export type RateCategory = 'inflation' | 'living' | 'living_second' | 'fixed' | 'education' | 'other' | 'none';

export interface Person {
    id: string;
    name: string;
    birthYear: number;
    sex: 'male' | 'female';
    relation: 'self' | 'spouse' | 'child' | 'other';
}

export type IncomeCategory = 'salary' | 'public_pension' | 'private_pension' | 'individual_pension' | 'child_allowance' | 'retirement' | 'other';

export interface Income {
    id: string;
    personId: string;
    name: string;
    category: IncomeCategory;
    amount: number; // 額面 (万円)
    startAge: number; // personの年齢
    endAge: number;
    taxRate?: number; // 互換用（制度ルール常時ONのためUIでは未使用）
    annualGrowthRate?: number; // 年次の昇給率 (例: 0.01 = 1%)
    peakAmount?: number; // 目標ピーク年収
    peakAge?: number; // ピークに達する年齢
    annualDecayRate?: number; // ピークアウト後の減少率 (例: 0.005)
}

export type AssetTerm = 'short' | 'medium' | 'long';

export interface Asset {
    id: string;
    name: string;
    type: 'cash' | 'investment' | 'dc';
    term: AssetTerm;
    initialAmount: number; // 現在残高 (万円)
    rate: number; // 年利 (%)
}

export interface Contribution {
    id: string;
    name: string;
    assetId: string; // 紐づく資産
    amount: number; // 金額 (万円)
    frequency: 'monthly' | 'yearly';
    startAge: number; // 世帯主年齢基準
    endAge: number;
    targetAssetIdAfterEnd?: string; // 満期後の移動先 (DC->Cashなど)
}

export type EventCategory = 'future_plan' | 'irregular' | 'education_fund' | 'surrender_value' | 'other';

export interface LifeEvent {
    id: string;
    name: string;
    category: EventCategory;
    amount: number; // 万円
    type: 'one_time' | 'periodic';
    startAge: number; // 世帯主年齢
    endAge?: number;
    interval?: number;
    rateCategory: RateCategory;
}

export interface LivingCostBreakdown {
    food: number;
    communication: number;
    dailyGoods: number;
    utilities: number;
    housing?: number;
    hobby: number;
    other: number;
}

export interface LivingCostStep {
    id: string;
    startAge: number; // 世帯主年齢
    breakdown: LivingCostBreakdown;
}

export interface EducationTemplate {
    name: string;
    yearlyCosts: { age: number; amount: number }[]; // 子どもの年齢: 金額(万円)
}

export interface EducationStage {
    id: string;
    name: string;
    category?: string;
    startAge: number;
    endAge: number;
    totalAmount?: number; // その区分の累計額 (万円)
}

export interface EducationPlan {
    childId: string;
    templateName?: string;
    totalAmountOverride?: number; // 累計スケーリング用 (万円)
    stages?: EducationStage[];
}

export interface InterestPeriod {
    years: number;
    rate: number;
}

export interface Housing {
    purchaseAge: number;
    price: number; // 万円
    downPayment: number; // 万円
    loanAmount: number; // 万円
    loanTerm: number; // 年
    interestRate: number; // % (初期利率または固定利率)
    interestPeriods: InterestPeriod[]; // 期間別の金利設定
    danshinRate: number; // 団信上乗せ利率 (%)
    danshinType: string; // 団信種類
    allDiseaseRate: number; // 全疾病保障上乗せ利率 (%)
    allDiseaseType: string; // 全疾病保障種類
    maintenanceCost: number; // 年額(万円)
    rentalCost: number; // 月額(万円)
}

export interface PersonalFixedCost {
    id: string;
    personId?: string;
    target?: 'person' | 'family';
    name: string;
    amount: number; // 月額 (万円)
    startAge?: number; // 指定なしは全期間
    endAge?: number;
}

export interface SimulationSettings {
    rates: Record<RateCategory, number>;
    startAge: number; // 世帯主開始年齢
    endAge: number; // 終了年齢
    deathAge?: number; // 万一シミュレーション用
    deathSettings?: DeathSettings;
    baseYear: number;
    assetTransferAges?: {
        investment?: number;
        dc?: number;
    };
    glipCompatibility?: {
        includeTransfersInIncomeTotal?: boolean;
    };
    retirementWithdrawalStrategy?: {
        enabled?: boolean;
        startAge?: number;
    };
    policy?: {
        enabled?: boolean; // 互換用（実行時は常時ON）
        healthInsuranceRegion?: string;
        employmentInsuranceBusinessType?: 'general' | 'agriculture_forestry_fisheries_sake' | 'construction';
        residentTaxPerCapitaYen?: number;
        residentTaxPerCapitaExtraYen?: number;
        investmentTaxRate?: number;
        nisaLifetimeLimitManYen?: number;
        nisaLifetimeUsedManYen?: number;
        salaryBonusRatio?: number;
        bonusPaymentsPerYear?: number;
        socialInsuranceModel?: 'employee' | 'national';
        nationalHealthInsuranceHouseholdBaseYen?: number;
        nationalHealthInsurancePerMemberYen?: number;
        nationalHealthInsuranceAnnualYen?: number;
        nationalPensionMonthlyYen?: number;
        nationalPensionStartAge?: number;
        nationalPensionEndAge?: number;
        autoSpouseDeductionEnabled?: boolean;
        autoDependentDeductionEnabled?: boolean;
        retirementYearsOfService?: number;
        deductionSpouseYen?: number;
        deductionMedicalYen?: number;
        deductionOtherYen?: number;
        publicPensionAutoCalculationEnabled?: boolean;
        publicPensionClaimAge?: number;
        idecoCategory?: 'self_employed' | 'company_employee_no_corporate_pension' | 'company_employee_with_corporate_pension' | 'public_servant' | 'dependent_spouse';
    };
}

export interface DeathSettings {
    livingCostFactor: number; // 死亡後の生活費係数 (0.7)
    independentChildFactor: number; // 末子独立後の係数 (0.5)
    independentAge: number; // 末子独立年齢
    funeralCost: number; // 葬儀費用
    emergencyFund: number; // 予備費
    recoveryFund: number; // 生活立て直し資金
}

export interface AnnualResult {
    year: number;
    age: number; // 世帯主年齢
    income: {
        total: number;
        self: {
            salary: number;
            publicPension: number;
            privatePension: number;
            individualPension: number;
        };
        spouse: {
            salary: number;
            publicPension: number;
            privatePension: number;
            individualPension: number;
        };
        assetWithdrawal: number;
        childAllowance: number;
    };
    financing: {
        assetLiquidation: number; // 投資資産の取り崩し
        assetTransfer: number; // 資産区分移管（例: 65歳時DC/投資→現金）
        total: number;
    };
    cashflow: {
        recurringIncome: number; // 経常収入
        recurringExpense: number; // 経常支出
        recurringBalance: number; // 経常収支
        oneTimeIncome: number; // 臨時収入
        oneTimeExpense: number; // 臨時支出
        oneTimeNet: number; // 臨時収支
        financingIn: number; // 資金調達流入
        finalNet: number; // 経常収支 + 臨時収支 + 資金調達
    };
    expense: {
        total: number;
        living: number;
        housing: number;
        education: number;
        futurePlan: number;
        selfSpecific: number;
        spouseSpecific: number;
        familySpecific: number;
        repayment: number;
        investment: number;
        insurance: number;
        tax: number;
        socialInsurance: number;
    };
    balance: number; // 年度別収支 ①
    irregularExpense: number; // 不定期支出 ②
    netSavings: number; // 貯蓄額 ①-②
    educationFundMaturity: number; // 学資・満期金
    surrenderValue: number; // 解約返戻金受取額
    assets: {
        total: number;
        shortTerm: number;
        mediumTerm: number;
        longTerm: number;
        byCategory: Record<string, number>; // assetId -> amount
    };
    events: string[];
}

export interface ProjectData {
    people: Person[];
    incomes: Income[];
    assets: Asset[];
    contributions: Contribution[];
    livingCostSteps: LivingCostStep[];
    events: LifeEvent[];
    educationPlans: EducationPlan[];
    housing: Housing;
    personalFixedCosts: PersonalFixedCost[];
    settings: SimulationSettings;
}
