import { ProjectData, AnnualResult, RateCategory, Person, EducationTemplate, EducationPlan } from '../types';

// Utility to calculate compound rate
const getRate = (rates: Record<RateCategory, number>, category: RateCategory): number => {
    return (rates[category] || 0) / 100;
};

// Calculate PMT for housing loan (Monthly) -> Return Monthly Pmt
const calculateMonthlyPayment = (principal: number, annualRatePercent: number, remainingYears: number): number => {
    if (principal <= 0 || remainingYears <= 0) return 0;
    if (annualRatePercent === 0) return principal / (remainingYears * 12);

    const monthlyRate = annualRatePercent / 100 / 12;
    const numPayments = remainingYears * 12;
    const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);

    return monthlyPayment;
};

// Create a map of Education Costs by Year (based on Child's age)
const calculateEducationCosts = (
    plans: EducationPlan[],
    templates: Record<string, EducationTemplate>,
    children: Person[]
): Record<number, number> => {
    const costsByYear: Record<number, number> = {};

    plans.forEach(plan => {
        const child = children.find(p => p.id === plan.childId);
        if (!child) return;

        const template = templates[plan.templateName];
        if (!template) return;

        // Calculate scaling factor
        let scale = 1.0;
        if (plan.totalAmountOverride !== undefined) {
            const templateTotal = template.yearlyCosts.reduce((sum, item) => sum + item.amount, 0);
            if (templateTotal > 0) {
                scale = plan.totalAmountOverride / templateTotal;
            }
        }

        template.yearlyCosts.forEach(item => {
            const age = item.age;
            // Child's age = currentYear - birthYear
            // Year when child is `age` => birthYear + age
            const targetYear = child.birthYear + age;

            const cost = item.amount * scale;
            costsByYear[targetYear] = (costsByYear[targetYear] || 0) + cost;
        });
    });

    return costsByYear;
};

// 児童手当の計算 (2025年〜の新ルール)
const calculateChildAllowance = (year: number, children: Person[]): number => {
    const activeChildren = children
        .map(c => ({ age: year - c.birthYear }))
        .filter(c => c.age >= 0 && c.age <= 18)
        .sort((a, b) => b.age - a.age); // 年上の子から順にカウント

    if (activeChildren.length === 0) return 0;

    let totalYearly = 0;
    activeChildren.forEach((child, index) => {
        const age = child.age;
        const ordinal = index + 1; // 第何子か
        let monthly = 0;

        if (age <= 2) {
            monthly = 15000;
        } else if (age <= 12) { // 小学校修了前
            if (ordinal >= 3) {
                monthly = 15000;
            } else {
                monthly = 10000;
            }
        } else if (age <= 18) { // 高校生含む
            monthly = 10000;
        } else {
            monthly = 0;
        }

        totalYearly += (monthly * 12) / 10000; // 万円単位に変換
    });

    return totalYearly;
};

// 遺族年金の計算 (簡易版)
const calculateSurvivorPension = (year: number, _deceasedPerson: Person, children: Person[], deceasedPreviousIncome: number): number => {
    // 1. 遺族基礎年金 (子どもが18歳年度末まで)
    const activeChildren = children.filter(c => (year - c.birthYear) <= 18);
    let basicPension = 0;
    if (activeChildren.length > 0) {
        basicPension = 81.6; // 基本額 (2024年概算)
        if (activeChildren.length >= 1) basicPension += 23.5; // 第1子加算
        if (activeChildren.length >= 2) basicPension += 23.5; // 第2子加算
        if (activeChildren.length >= 3) basicPension += (activeChildren.length - 2) * 7.8; // 第3子以降
    }

    // 2. 遺族厚生年金 (簡易的に現役時年収の概ね10-15%程度とする。本来は報酬比例部分の3/4)
    // 年収800万程度の場合、月給50万程度 -> 概算で年間約80-100万程度を想定
    // ここでは簡易的に (額面年収 * 0.005481 * 300ヶ月 / 1000 * 0.75) のようなイメージで計算
    const emlpoyeesPension = (deceasedPreviousIncome * 0.12);

    // 中高齢寡婦加算などは今回は省略
    return basicPension + emlpoyeesPension;
};

export const calculateSimulation = (data: ProjectData): AnnualResult[] => {
    const results: AnnualResult[] = [];
    const { people, incomes, assets, contributions, livingCostSteps, events, housing, personalFixedCosts, settings, educationPlans } = data;

    // Find self (Husband)
    const self = people.find(p => p.relation === 'self');
    if (!self) throw new Error("Self not found");

    // Determine Base Year from settings or calculate from birthYear and startAge.
    const baseYear = settings.baseYear || (self.birthYear + settings.startAge);

    // Clone initial assets to track balances
    const currentAssets = assets.map(a => ({ ...a, balance: a.initialAmount }));

    // --- Pre-calculation for Housing Loan with Variable Rates ---
    const loanRepaymentsByAge: Record<number, number> = {};
    let remainingPrincipal = housing.loanAmount;
    let loanCurrentAge = housing.purchaseAge;

    if (housing.loanAmount > 0 && housing.loanTerm > 0) {
        let elapsedYears = 0;
        while (elapsedYears < housing.loanTerm) {
            // Find current interest rate based on interestPeriods
            let currentRate = housing.interestRate;
            let yearsAcc = 0;
            for (const period of housing.interestPeriods) {
                yearsAcc += period.years;
                if (elapsedYears < yearsAcc) {
                    currentRate = period.rate;
                    break;
                }
            }
            // Add Danshin Rate and All-Disease Rate
            currentRate += (housing.danshinRate || 0);
            currentRate += (housing.allDiseaseRate || 0);

            const remainingTerm = housing.loanTerm - elapsedYears;
            const monthlyPayment = calculateMonthlyPayment(remainingPrincipal, currentRate, remainingTerm);
            const yearlyPayment = monthlyPayment * 12;

            loanRepaymentsByAge[loanCurrentAge] = yearlyPayment;

            // Update principal for next year
            // Annuity repayment: Payment = Interest + Principal
            for (let m = 0; m < 12; m++) {
                const monthlyInterest = remainingPrincipal * (currentRate / 100 / 12);
                const principalRepayment = monthlyPayment - monthlyInterest;
                remainingPrincipal -= principalRepayment;
            }

            loanCurrentAge++;
            elapsedYears++;
        }
    }
    const loanEndAge = housing.purchaseAge + housing.loanTerm;

    // Pre-calculation for Education
    const educationTemplates: Record<string, EducationTemplate> = {
        // DEFAULT TEMPLATES (Can be moved to constant)
        'default': {
            name: 'default',
            yearlyCosts: [
                { age: 4, amount: 40 }, { age: 5, amount: 40 }, // Kindergarten
                { age: 7, amount: 30 }, { age: 8, amount: 30 }, { age: 9, amount: 30 }, { age: 10, amount: 30 }, { age: 11, amount: 30 }, { age: 12, amount: 30 }, // Elementary
                { age: 13, amount: 50 }, { age: 14, amount: 50 }, { age: 15, amount: 80 }, // Junior High (+ Exam)
                { age: 16, amount: 60 }, { age: 17, amount: 60 }, { age: 18, amount: 100 }, // High (+ Exam)
                { age: 19, amount: 150 }, { age: 20, amount: 150 }, { age: 21, amount: 150 }, { age: 22, amount: 150 } // University
            ]
        }
    };

    const educationCostsByYear = calculateEducationCosts(educationPlans, educationTemplates, people);

    // Let's handle death scenario
    const isDeathScenario = !!settings.deathAge;

    for (let age = settings.startAge; age <= settings.endAge; age++) {
        const yearIndex = age - settings.startAge;
        const currentYear = baseYear + yearIndex;

        // Death Logic
        const isDead = isDeathScenario && age >= settings.deathAge!;
        const isDeathYear = isDeathScenario && age === settings.deathAge!;

        // --- Income & Expenses Preparation ---
        let totalIncome = 0;
        const income = {
            total: 0,
            self: { salary: 0, publicPension: 0, privatePension: 0, individualPension: 0 },
            spouse: { salary: 0, publicPension: 0, privatePension: 0, individualPension: 0 },
            assetWithdrawal: 0,
            childAllowance: 0,
        };

        const expense = {
            total: 0,
            living: 0,
            housing: 0,
            education: 0,
            futurePlan: 0,
            selfSpecific: 0,
            spouseSpecific: 0,
            familySpecific: 0,
            repayment: 0,
            investment: 0,
            insurance: 0,
            tax: 0,
            socialInsurance: 0,
        };

        let irregularExpense = 0;
        let educationFundMaturity = 0;
        let surrenderValueReceived = 0;

        // 児童手当の自動計算
        const children = people.filter(p => p.relation === 'child');
        income.childAllowance += calculateChildAllowance(currentYear, children);

        incomes.forEach(inc => {
            const person = people.find(p => p.id === inc.personId);
            if (isDead && person?.relation === 'self') return;

            const personAge = age - (person ? (person.birthYear - self.birthYear) : 0);

            if (personAge >= inc.startAge && personAge <= inc.endAge) {
                let gross = inc.amount;

                if (inc.peakAmount && inc.peakAge) {
                    if (personAge <= inc.peakAge) {
                        // 目標値(peakAmount)に向かって徐々に鈍化しながら収束するカーブ (パワー関数)
                        const totalYears = inc.peakAge - inc.startAge;
                        const elapsed = personAge - inc.startAge;
                        const ratio = totalYears > 0 ? elapsed / totalYears : 1;
                        // 1.4乗のカーブで、初期の伸びは大きく、ピークに近づくほど緩やかになるように調整
                        gross = inc.amount + (inc.peakAmount - inc.amount) * (1 - Math.pow(1 - ratio, 1.4));
                    } else {
                        // ピーク後のフェーズ (横ばい期間の後に微減)
                        const elapsedSincePeak = personAge - inc.peakAge;
                        const plateauYears = 2; // ピークを2年程度維持 (例: 54, 55, 56)
                        if (elapsedSincePeak <= plateauYears) {
                            gross = inc.peakAmount;
                        } else {
                            const decayElapsed = elapsedSincePeak - plateauYears;
                            gross = inc.peakAmount * Math.pow(1 - (inc.annualDecayRate || 0.005), decayElapsed);
                        }
                    }
                } else if (inc.annualGrowthRate) {
                    const elapsed = personAge - inc.startAge;
                    gross = gross * Math.pow(1 + inc.annualGrowthRate, elapsed);
                }
                const taxAmount = gross * (1 - inc.taxRate);

                totalIncome += gross;
                expense.tax += taxAmount;

                const isSelf = person?.relation === 'self';
                const isSpouse = person?.relation === 'spouse';

                // カテゴリの特定（未設定時のフォールバック）
                let category = inc.category;
                if (!category) {
                    const name = inc.name;
                    if (name.includes('給与') || name.includes('賞与') || name.includes('退職')) category = 'salary';
                    else if (name.includes('公的年金')) category = 'public_pension';
                    else if (name.includes('私の年金')) category = 'private_pension';
                    else if (name.includes('個人年金')) category = 'individual_pension';
                    else if (name.includes('手当')) category = 'child_allowance';
                    else category = 'other';
                }

                if (category === 'salary' || category === 'other') {
                    if (isSelf) income.self.salary += gross;
                    else if (isSpouse) income.spouse.salary += gross;
                } else if (category === 'public_pension') {
                    if (isSelf) income.self.publicPension += gross;
                    else if (isSpouse) income.spouse.publicPension += gross;
                } else if (category === 'private_pension') {
                    if (isSelf) income.self.privatePension += gross;
                    else if (isSpouse) income.spouse.privatePension += gross;
                } else if (category === 'individual_pension') {
                    if (isSelf) income.self.individualPension += gross;
                    else if (isSpouse) income.spouse.individualPension += gross;
                } else if (category === 'child_allowance') {
                    income.childAllowance += gross;
                }
            }
        });

        // --- Expenses Calculation ---

        // 1. Living Cost
        let currentLivingStep = livingCostSteps[0];
        if (!currentLivingStep) {
            // Fallback if steps are empty
            results.push({
                year: currentYear,
                age,
                income,
                expense,
                balance: 0,
                irregularExpense: 0,
                netSavings: 0,
                educationFundMaturity: 0,
                surrenderValue: 0,
                assets: { total: 0, shortTerm: 0, mediumTerm: 0, longTerm: 0, byCategory: {} },
                events: []
            });
            continue;
        }

        for (const step of livingCostSteps) {
            if (age >= step.startAge) currentLivingStep = step;
        }

        const b = currentLivingStep.breakdown || { food: 0, communication: 0, dailyGoods: 0, utilities: 0, hobby: 0, other: 0 };
        const stepAmount = (b.food || 0) + (b.communication || 0) + (b.dailyGoods || 0) +
            (b.utilities || 0) + (b.housing || 0) + (b.hobby || 0) + (b.other || 0);

        let baseLivingCost = stepAmount * 12;
        const livingRate = getRate(settings.rates, 'living');
        const inflationFactor = Math.pow(1 + livingRate, yearIndex);
        let adjustableLivingCost = baseLivingCost * inflationFactor;

        if (isDead && settings.deathSettings) {
            adjustableLivingCost *= settings.deathSettings.livingCostFactor;
            if (settings.deathSettings.independentAge > 0) {
                const children = people.filter(p => p.relation === 'child');
                const allIndependent = children.every(c => {
                    const cAge = currentYear - c.birthYear;
                    return cAge >= settings.deathSettings!.independentAge;
                });
                if (allIndependent) {
                    adjustableLivingCost *= settings.deathSettings.independentChildFactor;
                }
            }
        }
        expense.living = adjustableLivingCost;

        // 1.1 Survivor Pension (if self is dead and has incomes defined previously)
        if (isDead) {
            const selfPerson = people.find(p => p.relation === 'self');
            if (selfPerson) {
                // 世帯主の本来の年収（ピーク設定など考慮した前年の想定年収などを使いたいが、
                // ここでは簡易的に現在の入力をベースに遺族年金を算出）
                const selfSalaryIncome = incomes.find(inc => inc.personId === selfPerson.id && inc.category === 'salary');
                const survivorPension = calculateSurvivorPension(currentYear, selfPerson, children, selfSalaryIncome?.amount || 0);
                // 遺族年金をその他の収入として合算
                income.spouse.publicPension += survivorPension;
            }
        }

        // 2. Housing
        if (age < housing.purchaseAge) {
            expense.housing = housing.rentalCost * 12;
        } else {
            expense.housing = housing.maintenanceCost;
            if (age < loanEndAge) {
                expense.repayment = loanRepaymentsByAge[age] || 0;
            }
            if (age === housing.purchaseAge) {
                expense.housing += housing.downPayment;
            }
        }

        // 3. Personal Fixed (Insurance is often here)
        personalFixedCosts.forEach(pfc => {
            const person = people.find(p => p.id === pfc.personId);
            if (isDead && person?.relation === 'self') return;

            const personAge = age - (person ? (person.birthYear - self.birthYear) : 0);
            if (pfc.startAge && personAge < pfc.startAge) return;
            if (pfc.endAge && personAge > pfc.endAge) return;

            const cost = pfc.amount * 12;
            if (pfc.name.includes('保険')) {
                expense.insurance += cost;
            } else if (person?.relation === 'self') {
                expense.selfSpecific += cost;
            } else if (person?.relation === 'spouse') {
                expense.spouseSpecific += cost;
            } else {
                expense.familySpecific += cost;
            }
        });

        // 4. Events
        events.forEach(evt => {
            let isHit = false;
            if (evt.type === 'one_time') {
                if (evt.startAge === age) isHit = true;
            } else {
                if (age >= evt.startAge && (!evt.endAge || age <= evt.endAge)) {
                    if (evt.interval) {
                        if ((age - evt.startAge) % evt.interval === 0) isHit = true;
                    } else {
                        isHit = true;
                    }
                }
            }

            if (isHit) {
                const amt = evt.amount;
                if (evt.category === 'future_plan') {
                    expense.futurePlan += amt;
                } else if (evt.category === 'irregular') {
                    irregularExpense += amt;
                } else if (evt.category === 'education_fund') {
                    educationFundMaturity += amt;
                } else if (evt.category === 'surrender_value') {
                    surrenderValueReceived += amt;
                }
            }
        });

        // 5. Education
        expense.education = educationCostsByYear[currentYear] || 0;

        // 6. Death Costs
        if (isDeathYear && settings.deathSettings) {
            const d = settings.deathSettings;
            expense.futurePlan += d.funeralCost + d.emergencyFund + d.recoveryFund;
        }

        // Sum expenses
        expense.total = expense.living + expense.housing + expense.education + expense.futurePlan +
            expense.selfSpecific + expense.spouseSpecific + expense.familySpecific +
            expense.repayment + expense.investment + expense.insurance + expense.tax + expense.socialInsurance;
        // --- Balance ---
        // Assets Management

        // --- Assets Management ---
        const yearContributions: Record<string, number> = {};
        contributions.forEach(c => {
            if (age >= c.startAge && age < c.endAge) {
                const amount = (c.amount * (c.frequency === 'monthly' ? 12 : 1));
                yearContributions[c.assetId] = (yearContributions[c.assetId] || 0) + amount;
                expense.investment += amount;
            }
        });

        // Recalculate total expense after contribution
        expense.total = expense.living + expense.housing + expense.education + expense.futurePlan +
            expense.selfSpecific + expense.spouseSpecific + expense.familySpecific +
            expense.repayment + expense.investment + expense.insurance + expense.tax + expense.socialInsurance;

        const netYearlyBalance = totalIncome - expense.total; // ①

        // Apply Interest & Contributions
        currentAssets.forEach(asset => {
            const interest = asset.balance * (asset.rate / 100);
            asset.balance += interest;
            const contrib = yearContributions[asset.id] || 0;
            asset.balance += contrib;
        });

        // Apply Balance
        const cashAsset = currentAssets.find(a => a.type === 'cash');
        let balanceToApply = totalIncome - expense.total - irregularExpense + educationFundMaturity + surrenderValueReceived;

        if (balanceToApply >= 0) {
            if (cashAsset) cashAsset.balance += balanceToApply;
        } else {
            let deficit = -balanceToApply;
            if (cashAsset) {
                const taken = Math.min(cashAsset.balance, deficit);
                cashAsset.balance -= taken;
                deficit -= taken;
            }
            if (deficit > 0) {
                const investments = currentAssets.filter(a => a.type === 'investment');
                let investmentWithdrawalTotal = 0;
                for (const inv of investments) {
                    if (deficit <= 0) break;
                    const taken = Math.min(inv.balance, deficit);
                    if (taken > 0) {
                        inv.balance -= taken;
                        deficit -= taken;
                        investmentWithdrawalTotal += taken;
                    }
                }
                if (investmentWithdrawalTotal > 0) {
                    income.assetWithdrawal += investmentWithdrawalTotal;
                }
            }
            if (deficit > 0 && cashAsset) {
                cashAsset.balance -= deficit;
            }
        }

        // Asset Transfer Logic
        if (age === 65) {
            const transferAssets = currentAssets.filter(a => a.type === 'dc' || a.type === 'investment');
            if (cashAsset) {
                transferAssets.forEach(ta => {
                    const amount = ta.balance;
                    if (amount > 0) {
                        cashAsset.balance += amount;
                        ta.balance = 0;
                        income.assetWithdrawal += amount;
                    }
                });
            }
        }

        // Asset Classification
        let shortTerm = 0, mediumTerm = 0, longTerm = 0;
        const byCategory: Record<string, number> = {};
        currentAssets.forEach(a => {
            byCategory[a.id] = a.balance;
            const term = a.term || 'short';
            if (term === 'short') shortTerm += a.balance;
            else if (term === 'medium') mediumTerm += a.balance;
            else if (term === 'long') longTerm += a.balance;
        });

        // 収入合計を各項目の和として算出
        income.total = income.self.salary + income.self.publicPension + income.self.privatePension + income.self.individualPension +
            income.spouse.salary + income.spouse.publicPension + income.spouse.privatePension + income.spouse.individualPension +
            income.childAllowance + income.assetWithdrawal;

        results.push({
            year: currentYear,
            age,
            income,
            expense,
            balance: netYearlyBalance,
            irregularExpense,
            netSavings: netYearlyBalance - irregularExpense,
            educationFundMaturity,
            surrenderValue: surrenderValueReceived,
            assets: {
                total: shortTerm + mediumTerm + longTerm,
                shortTerm,
                mediumTerm,
                longTerm,
                byCategory
            },
            events: isDeathYear ? ['Death'] : []
        });
    }

    return results;
};
