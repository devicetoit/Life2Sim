import { ProjectData, SimulationSettings } from '../types';

const defaultPolicy: NonNullable<SimulationSettings['policy']> = {
    enabled: true,
    healthInsuranceRegion: 'tokyo',
    employmentInsuranceBusinessType: 'general',
    residentTaxPerCapitaYen: 5000,
    salaryBonusRatio: 0,
    bonusPaymentsPerYear: 2,
    idecoCategory: 'company_employee_no_corporate_pension'
};

export const withPolicyDefaults = (data: ProjectData): ProjectData => {
    return {
        ...data,
        settings: {
            ...data.settings,
            policy: {
                ...defaultPolicy,
                ...(data.settings.policy || {})
            }
        }
    };
};
