import { ProjectData, SimulationSettings } from '../types';

const defaultPolicy: NonNullable<SimulationSettings['policy']> = {
    enabled: true,
    healthInsuranceRegion: 'tokyo',
    employmentInsuranceBusinessType: 'general',
    residentTaxPerCapitaYen: 5000,
    residentTaxPerCapitaExtraYen: 0,
    salaryBonusRatio: 0,
    bonusPaymentsPerYear: 2,
    socialInsuranceModel: 'employee',
    nationalHealthInsuranceHouseholdBaseYen: 0,
    nationalHealthInsurancePerMemberYen: 0,
    nationalHealthInsuranceAnnualYen: 0,
    nationalPensionMonthlyYen: 0,
    nationalPensionStartAge: 20,
    nationalPensionEndAge: 59,
    deductionSpouseYen: 0,
    deductionMedicalYen: 0,
    deductionOtherYen: 0,
    idecoCategory: 'company_employee_no_corporate_pension'
};

export const withPolicyDefaults = (data: ProjectData): ProjectData => {
    const mergedPolicy = {
        ...defaultPolicy,
        ...(data.settings.policy || {}),
        enabled: true
    };
    if (
        (mergedPolicy.nationalHealthInsurancePerMemberYen === undefined || mergedPolicy.nationalHealthInsurancePerMemberYen === null)
        && mergedPolicy.nationalHealthInsuranceAnnualYen !== undefined
    ) {
        mergedPolicy.nationalHealthInsurancePerMemberYen = mergedPolicy.nationalHealthInsuranceAnnualYen;
    }
    return {
        ...data,
        settings: {
            ...data.settings,
            policy: mergedPolicy
        }
    };
};
