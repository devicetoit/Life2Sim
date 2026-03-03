import taxRules from './tax.json';
import socialInsuranceRules from './social_insurance.json';
import pensionRules from './pension.json';
import investmentRules from './investment.json';

export type IdecoCategory =
    | 'self_employed'
    | 'company_employee_no_corporate_pension'
    | 'company_employee_with_corporate_pension'
    | 'public_servant'
    | 'dependent_spouse';

export interface PolicyContext {
    healthInsuranceRegion?: string;
    employmentInsuranceBusinessType?: 'general';
    residentTaxPerCapitaYen?: number;
    salaryBonusRatio?: number;
    bonusPaymentsPerYear?: number;
    idecoCategory?: IdecoCategory;
}

const MAN_YEN_TO_YEN = 10000;
const floorToUnit = (value: number, unit: number): number => Math.floor(value / unit) * unit;
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const getBasicDeductionYen = (totalIncomeYen: number): number => {
    for (const band of taxRules.basic_deduction) {
        if (band.max_total_income === null || totalIncomeYen <= band.max_total_income) {
            return band.amount;
        }
    }
    return 0;
};

const getSalaryIncomeDeductionYen = (salaryIncomeYen: number): number => {
    for (const band of taxRules.salary_income_deduction.bands) {
        if (band.up_to === null || salaryIncomeYen <= band.up_to) {
            if (band.type === 'fixed') {
                return band.fixed_amount ?? 0;
            }
            return salaryIncomeYen * (band.rate ?? 0) + (band.offset ?? 0);
        }
    }
    return 0;
};

const getPublicPensionDeductionYen = (publicPensionIncomeYen: number, age: number): number => {
    const deductionRules = age >= 65
        ? taxRules.public_pension_deduction.age_65_and_over
        : taxRules.public_pension_deduction.under_65;

    for (const band of deductionRules.bands) {
        if (band.up_to === null || publicPensionIncomeYen <= band.up_to) {
            if (band.type === 'fixed') {
                return Math.min(publicPensionIncomeYen, band.fixed_amount ?? 0);
            }
            const deduction = publicPensionIncomeYen * (band.rate ?? 0) + (band.offset ?? 0);
            return Math.max(0, Math.min(publicPensionIncomeYen, deduction));
        }
    }
    return 0;
};

const getIncomeTaxBaseYen = (taxableIncomeYen: number): number => {
    if (taxableIncomeYen <= 0) return 0;
    for (const bracket of taxRules.income_tax.brackets) {
        if (bracket.up_to === null || taxableIncomeYen <= bracket.up_to) {
            return taxableIncomeYen * bracket.rate - bracket.deduction;
        }
    }
    return 0;
};

const estimateEmployeeSocialInsuranceYen = (params: {
    annualSalaryIncomeYen: number;
    age: number;
    context?: PolicyContext;
}): number => {
    const annualIncomeYen = params.annualSalaryIncomeYen;
    if (annualIncomeYen <= 0) return 0;
    const region = params.context?.healthInsuranceRegion || socialInsuranceRules.health_insurance.default_region;
    const healthRateTotal = socialInsuranceRules.health_insurance.rates_by_region[region as keyof typeof socialInsuranceRules.health_insurance.rates_by_region]
        ?? socialInsuranceRules.health_insurance.rates_by_region[socialInsuranceRules.health_insurance.default_region as keyof typeof socialInsuranceRules.health_insurance.rates_by_region];
    const healthEmployeeRate = healthRateTotal * socialInsuranceRules.health_insurance.employee_share_ratio;
    const bonusRatio = clamp(params.context?.salaryBonusRatio ?? 0, 0, 0.9);
    const bonusPaymentsPerYear = Math.max(1, Math.floor(params.context?.bonusPaymentsPerYear ?? 2));
    const annualBonusYen = annualIncomeYen * bonusRatio;
    const annualBaseSalaryYen = annualIncomeYen - annualBonusYen;
    const monthlyBaseSalaryYen = annualBaseSalaryYen / 12;

    const healthMonthlyRule = socialInsuranceRules.health_insurance.standard_monthly_remuneration;
    const healthStandardMonthlyYen = clamp(
        floorToUnit(monthlyBaseSalaryYen, healthMonthlyRule.rounding_unit),
        healthMonthlyRule.min,
        healthMonthlyRule.max
    );
    const healthMonthlyPremiumYen = healthStandardMonthlyYen * healthEmployeeRate * 12;
    const healthBonusPremiumYen = Math.min(annualBonusYen, socialInsuranceRules.health_insurance.standard_bonus.annual_cap) * healthEmployeeRate;

    const nursingRule = socialInsuranceRules.nursing_care_insurance;
    const nursingEmployeeRate =
        params.age >= nursingRule.applicable_age_min && params.age <= nursingRule.applicable_age_max
            ? nursingRule.rate * nursingRule.employee_share_ratio
            : 0;
    const nursingMonthlyPremiumYen = healthStandardMonthlyYen * nursingEmployeeRate * 12;
    const nursingBonusPremiumYen = Math.min(annualBonusYen, socialInsuranceRules.health_insurance.standard_bonus.annual_cap) * nursingEmployeeRate;

    const pensionEmployeeRate =
        params.age < 70
            ? socialInsuranceRules.employee_pension_insurance.rate * socialInsuranceRules.employee_pension_insurance.employee_share_ratio
            : 0;
    const pensionMonthlyRule = socialInsuranceRules.employee_pension_insurance.standard_monthly_remuneration;
    const pensionStandardMonthlyYen = clamp(
        floorToUnit(monthlyBaseSalaryYen, pensionMonthlyRule.rounding_unit),
        pensionMonthlyRule.min,
        pensionMonthlyRule.max
    );
    const pensionMonthlyPremiumYen = pensionStandardMonthlyYen * pensionEmployeeRate * 12;
    const bonusPerPaymentYen = annualBonusYen / bonusPaymentsPerYear;
    const pensionBonusPremiumYen = Math.min(bonusPerPaymentYen, socialInsuranceRules.employee_pension_insurance.standard_bonus.per_payment_cap) * bonusPaymentsPerYear * pensionEmployeeRate;

    const businessType = params.context?.employmentInsuranceBusinessType || socialInsuranceRules.employment_insurance.default_business_type;
    const employmentEmployeeRate =
        socialInsuranceRules.employment_insurance.rates[businessType as keyof typeof socialInsuranceRules.employment_insurance.rates]?.employee_rate
        ?? socialInsuranceRules.employment_insurance.rates.general.employee_rate;
    const employmentInsuranceYen = annualIncomeYen * employmentEmployeeRate;

    const annualSocialInsuranceYen =
        healthMonthlyPremiumYen +
        healthBonusPremiumYen +
        nursingMonthlyPremiumYen +
        nursingBonusPremiumYen +
        pensionMonthlyPremiumYen +
        pensionBonusPremiumYen +
        employmentInsuranceYen;

    return annualSocialInsuranceYen;
};

export const estimateAnnualTaxAndSocialInsurance = (params: {
    annualSalaryIncomeManYen: number;
    annualPublicPensionIncomeManYen: number;
    age: number;
    context?: PolicyContext;
}): { annualTaxManYen: number; annualSocialInsuranceManYen: number } => {
    const annualSalaryIncomeYen = params.annualSalaryIncomeManYen * MAN_YEN_TO_YEN;
    const annualPublicPensionIncomeYen = params.annualPublicPensionIncomeManYen * MAN_YEN_TO_YEN;

    const salaryIncomeAmountYen = Math.max(0, annualSalaryIncomeYen - getSalaryIncomeDeductionYen(annualSalaryIncomeYen));
    const pensionIncomeAmountYen = Math.max(0, annualPublicPensionIncomeYen - getPublicPensionDeductionYen(annualPublicPensionIncomeYen, params.age));
    const totalIncomeAmountYen = salaryIncomeAmountYen + pensionIncomeAmountYen;

    const annualSocialInsuranceYen = estimateEmployeeSocialInsuranceYen({
        annualSalaryIncomeYen,
        age: params.age,
        context: params.context
    });
    const basicDeductionYen = getBasicDeductionYen(totalIncomeAmountYen);
    const taxableIncomeYen = Math.max(0, totalIncomeAmountYen - basicDeductionYen - annualSocialInsuranceYen);

    const incomeTaxBaseYen = Math.max(0, getIncomeTaxBaseYen(taxableIncomeYen));
    const reconstructionTaxYen = incomeTaxBaseYen * taxRules.income_tax.reconstruction_surtax_rate;
    const residentTaxPerCapitaYen =
        params.context?.residentTaxPerCapitaYen
        ?? (taxRules.resident_tax.per_capita_yen_default + taxRules.resident_tax.forest_environment_tax_yen_default);
    const residentTaxYen = taxableIncomeYen * taxRules.resident_tax.standard_income_levy_rate + residentTaxPerCapitaYen;
    const annualTaxYen = incomeTaxBaseYen + reconstructionTaxYen + residentTaxYen;

    return {
        annualTaxManYen: annualTaxYen / MAN_YEN_TO_YEN,
        annualSocialInsuranceManYen: annualSocialInsuranceYen / MAN_YEN_TO_YEN
    };
};

export const estimateSalaryTaxAndSocialInsurance = (params: {
    annualIncomeManYen: number;
    age: number;
    context?: PolicyContext;
}): { annualTaxManYen: number; annualSocialInsuranceManYen: number } => {
    return estimateAnnualTaxAndSocialInsurance({
        annualSalaryIncomeManYen: params.annualIncomeManYen,
        annualPublicPensionIncomeManYen: 0,
        age: params.age,
        context: params.context
    });
};

export const getOldAgeBasicPensionAnnualManYen = (): number => {
    return pensionRules.old_age_basic_pension.annual_amount / MAN_YEN_TO_YEN;
};

export const getAdjustedBasicPensionAnnualManYen = (claimAge: number): number => {
    const defaultClaimAge = pensionRules.old_age_basic_pension.default_claim_age;
    const base = getOldAgeBasicPensionAnnualManYen();
    const monthDiff = (claimAge - defaultClaimAge) * 12;

    if (monthDiff < 0) {
        const reduction = Math.min(Math.abs(monthDiff) * pensionRules.early_claim_adjustment.monthly_rate, pensionRules.early_claim_adjustment.max_reduction);
        return base * (1 - reduction);
    }

    if (monthDiff > 0) {
        const increase = Math.min(monthDiff * pensionRules.deferred_claim_adjustment.monthly_rate, pensionRules.deferred_claim_adjustment.max_increase);
        return base * (1 + increase);
    }

    return base;
};

export const capContributionByPolicyRules = (params: {
    contributionName: string;
    annualContributionManYen: number;
    isDcAsset: boolean;
    context?: PolicyContext;
}): number => {
    const name = params.contributionName.toLowerCase();
    const annualContributionYen = params.annualContributionManYen * MAN_YEN_TO_YEN;

    if (name.includes('nisa')) {
        const capYen = investmentRules.nisa.annual_limits.combined;
        return Math.min(annualContributionYen, capYen) / MAN_YEN_TO_YEN;
    }

    if (params.isDcAsset || name.includes('ideco') || name.includes('dc')) {
        const category = params.context?.idecoCategory || 'company_employee_no_corporate_pension';
        const monthlyCapYen = investmentRules.ideco.monthly_caps_by_category[category as keyof typeof investmentRules.ideco.monthly_caps_by_category]
            ?? investmentRules.ideco.monthly_caps_by_category.company_employee_no_corporate_pension;
        const annualCapYen = monthlyCapYen * 12;
        return Math.min(annualContributionYen, annualCapYen) / MAN_YEN_TO_YEN;
    }

    return params.annualContributionManYen;
};
