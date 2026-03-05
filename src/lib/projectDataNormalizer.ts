import { ProjectData } from '../types';
import { withPolicyDefaults } from './policyDefaults';

const incomeCategories = new Set([
    'salary',
    'public_pension',
    'private_pension',
    'individual_pension',
    'child_allowance',
    'other'
]);

const assetTypes = new Set(['cash', 'investment', 'dc']);
const assetTerms = new Set(['short', 'medium', 'long']);
const contributionFrequencies = new Set(['monthly', 'yearly']);
const eventCategories = new Set(['future_plan', 'irregular', 'education_fund', 'surrender_value', 'other']);
const eventTypes = new Set(['one_time', 'periodic']);
const rateCategories = new Set(['inflation', 'living', 'living_second', 'fixed', 'education', 'other', 'none']);
const personalFixedCostTargets = new Set(['person', 'family']);

const toFiniteNumber = (value: unknown, fallback: number): number => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return fallback;
};

export const normalizeProjectData = (data: ProjectData): ProjectData => {
    const withPolicy = withPolicyDefaults(data);
    const fallbackAssetId = withPolicy.assets[0]?.id || 'a1';

    const normalized: ProjectData = {
        ...withPolicy,
        settings: {
            ...withPolicy.settings,
            assetTransferAges: {
                investment: Math.floor(toFiniteNumber(withPolicy.settings.assetTransferAges?.investment, 65)),
                dc: Math.floor(toFiniteNumber(withPolicy.settings.assetTransferAges?.dc, 65))
            },
            glipCompatibility: {
                includeTransfersInIncomeTotal: withPolicy.settings.glipCompatibility?.includeTransfersInIncomeTotal === true
            }
        },
        incomes: withPolicy.incomes.map((inc) => {
            const category = incomeCategories.has(inc.category) ? inc.category : 'other';
            const taxRate = toFiniteNumber(inc.taxRate, 0.8);
            const annualGrowthRate = (inc.annualGrowthRate === undefined || inc.annualGrowthRate === null)
                ? undefined
                : toFiniteNumber(inc.annualGrowthRate, 0);
            const peakAmount = (inc.peakAmount === undefined || inc.peakAmount === null)
                ? undefined
                : toFiniteNumber(inc.peakAmount, inc.amount);
            const peakAge = (inc.peakAge === undefined || inc.peakAge === null)
                ? undefined
                : toFiniteNumber(inc.peakAge, inc.startAge);
            const annualDecayRate = (inc.annualDecayRate === undefined || inc.annualDecayRate === null)
                ? undefined
                : toFiniteNumber(inc.annualDecayRate, 0.005);

            return {
                ...inc,
                category,
                taxRate,
                annualGrowthRate,
                peakAmount,
                peakAge,
                annualDecayRate
            };
        }),
        assets: withPolicy.assets.map((asset) => ({
            ...asset,
            type: assetTypes.has(asset.type) ? asset.type : 'cash',
            term: assetTerms.has(asset.term) ? asset.term : 'short'
        })),
        contributions: withPolicy.contributions.map((contrib) => ({
            ...contrib,
            assetId: withPolicy.assets.some(a => a.id === contrib.assetId) ? contrib.assetId : fallbackAssetId,
            // Legacy data may not include this field; default to yearly to avoid accidental 12x interpretation.
            frequency: contributionFrequencies.has(contrib.frequency) ? contrib.frequency : 'yearly'
        })),
        personalFixedCosts: withPolicy.personalFixedCosts.map((cost) => {
            const target = personalFixedCostTargets.has(cost.target || '') ? cost.target : 'person';
            return {
                ...cost,
                target,
                personId: target === 'person' ? (cost.personId || withPolicy.people[0]?.id || 'p1') : cost.personId
            };
        }),
        events: withPolicy.events.map((event) => {
            const type = eventTypes.has(event.type) ? event.type : 'one_time';
            const interval = type === 'periodic'
                ? Math.max(1, Math.floor(toFiniteNumber(event.interval, 1)))
                : undefined;

            return {
                ...event,
                category: eventCategories.has(event.category) ? event.category : 'other',
                type,
                interval,
                rateCategory: rateCategories.has(event.rateCategory) ? event.rateCategory : 'none'
            };
        })
    };

    return normalized;
};
