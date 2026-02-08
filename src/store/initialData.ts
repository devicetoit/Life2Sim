import { ProjectData } from '../types';

export const initialData: ProjectData = {
    people: [
        { id: 'p1', name: '世帯主', birthYear: 1990, sex: 'male', relation: 'self' }, // 35歳 in 2025
        { id: 'p2', name: '配偶者', birthYear: 1992, sex: 'female', relation: 'spouse' }, // 33歳 in 2025
        { id: 'p3', name: '第1子', birthYear: 2022, sex: 'female', relation: 'child' }, // 3歳 in 2025
    ],
    incomes: [
        // --- 世帯主 ---
        { id: 'inc1-1', personId: 'p1', name: '給与', category: 'salary', amount: 700, startAge: 35, endAge: 59, taxRate: 0.8, peakAmount: 900, peakAge: 50 },
        { id: 'inc1-2', personId: 'p1', name: '給与(再雇用)', category: 'salary', amount: 400, startAge: 60, endAge: 64, taxRate: 0.8 },
        { id: 'inc3', personId: 'p1', name: '老齢厚生年金(見込)', category: 'public_pension', amount: 150, startAge: 65, endAge: 95, taxRate: 0.9 },
        { id: 'inc4', personId: 'p1', name: '老齢基礎年金(見込)', category: 'public_pension', amount: 80, startAge: 65, endAge: 95, taxRate: 0.9 },

        // --- 配偶者 ---
        { id: 'inc2-1', personId: 'p2', name: '給与', category: 'salary', amount: 400, startAge: 33, endAge: 60, taxRate: 0.8 },
        { id: 'inc5', personId: 'p2', name: '老齢厚生年金(見込)', category: 'public_pension', amount: 100, startAge: 65, endAge: 95, taxRate: 0.9 },
        { id: 'inc6', personId: 'p2', name: '老齢基礎年金(見込)', category: 'public_pension', amount: 80, startAge: 65, endAge: 95, taxRate: 0.9 },
    ],
    assets: [
        { id: 'a1', name: '預貯金', type: 'cash', term: 'short', initialAmount: 1000, rate: 0.0 },
        { id: 'a2', name: '投資信託', type: 'investment', term: 'medium', initialAmount: 500, rate: 3.0 },
        { id: 'a3', name: '確定拠出年金', type: 'dc', term: 'long', initialAmount: 200, rate: 5.0 },
    ],
    contributions: [
        { id: 'c1', name: 'DC積立', assetId: 'a3', amount: 2.3, frequency: 'monthly', startAge: 35, endAge: 60 },
        { id: 'c2', name: 'NISA積立', assetId: 'a2', amount: 120, frequency: 'yearly', startAge: 35, endAge: 60 },
    ],
    livingCostSteps: [
        { id: 'l1', startAge: 35, breakdown: { food: 6.0, communication: 1.0, dailyGoods: 2.0, utilities: 2.0, hobby: 2.0, other: 2.0 } },
        { id: 'l2', startAge: 45, breakdown: { food: 8.0, communication: 1.0, dailyGoods: 2.5, utilities: 2.5, hobby: 2.0, other: 2.0 } },
        { id: 'l3', startAge: 65, breakdown: { food: 5.0, communication: 1.0, dailyGoods: 2.0, utilities: 2.0, hobby: 5.0, other: 3.0 } },
    ],
    events: [
        { id: 'e1', name: '旅行/レジャー', category: 'future_plan', amount: 30, type: 'periodic', startAge: 35, endAge: 60, interval: 1, rateCategory: 'none' },
        { id: 'e2', name: '車両買替', category: 'irregular', amount: 300, type: 'periodic', startAge: 40, endAge: 80, interval: 10, rateCategory: 'none' },
        { id: 'e3', name: '住宅リフォーム', category: 'irregular', amount: 200, type: 'one_time', startAge: 65, rateCategory: 'none' },
    ],
    educationPlans: [
        { childId: 'p3', templateName: 'default', totalAmountOverride: 2000 },
    ],
    housing: {
        purchaseAge: 40,
        price: 5000,
        downPayment: 500,
        loanAmount: 4500,
        loanTerm: 35,
        interestRate: 0.6,
        interestPeriods: [
            { years: 10, rate: 0.6 },
            { years: 25, rate: 1.2 }
        ],
        danshinRate: 0.0,
        danshinType: '一般',
        allDiseaseRate: 0.0,
        allDiseaseType: 'なし',
        maintenanceCost: 15,
        rentalCost: 10.0,
    },
    personalFixedCosts: [
        { id: 'pf1', personId: 'p1', name: '通信費', amount: 0.5, startAge: 35, endAge: 95 },
        { id: 'pf2', personId: 'p1', name: '小遣い', amount: 3.0, startAge: 35, endAge: 65 },
        { id: 'pf3', personId: 'p2', name: '通信費', amount: 0.5, startAge: 33, endAge: 95 },
        { id: 'pf4', personId: 'p2', name: '小遣い', amount: 2.0, startAge: 33, endAge: 65 },
    ],
    settings: {
        startAge: 35,
        endAge: 95,
        deathAge: 0,
        rates: {
            inflation: 1.0,
            living: 1.0,
            living_second: 1.0,
            fixed: 0.0,
            education: 0.0,
            other: 1.0,
            none: 0.0
        },
        deathSettings: {
            livingCostFactor: 0.7,
            independentChildFactor: 0.5,
            independentAge: 22,
            funeralCost: 200,
            emergencyFund: 50,
            recoveryFund: 100
        },
        baseYear: 2025
    }
};
