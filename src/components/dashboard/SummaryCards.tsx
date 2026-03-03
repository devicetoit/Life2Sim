import React from 'react';
import { AnnualResult } from '../../types';
import { AlertTriangle, TrendingDown, Wallet } from 'lucide-react';
import { formatInteger } from '../../lib/format';

interface Props {
    results: AnnualResult[];
}

export const SummaryCards: React.FC<Props> = ({ results }) => {
    if (!results.length) return null;

    // 1. Bankruptcy (Depletion)
    let bankruptcyAge = -1;
    let bankruptcyAmount = 0;
    let recurringDeficitYears = 0;
    let financingYears = 0;
    let financingTotal = 0;

    results.forEach(r => {
        // Check first year of negative
        if (r.assets.total < 0 && bankruptcyAge === -1) {
            bankruptcyAge = r.age;
            bankruptcyAmount = r.assets.total;
        }

        if (r.cashflow.recurringBalance < 0) {
            recurringDeficitYears += 1;
        }
        if (r.financing.total > 0) {
            financingYears += 1;
            financingTotal += r.financing.total;
        }
    });

    const isSafe = bankruptcyAge === -1;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className={`p-8 rounded-[2rem] border premium-shadow transition-transform hover:scale-[1.02] ${!isSafe ? 'bg-rose-50 border-rose-100 ring-4 ring-rose-50/50' : 'bg-emerald-50 border-emerald-100 ring-4 ring-emerald-50/50'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${!isSafe ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        <AlertTriangle size={20} />
                    </div>
                    <h3 className="font-bold text-slate-700 font-display">資産の安全性</h3>
                </div>
                <p className={`text-4xl font-display font-bold tracking-tight mb-2 ${!isSafe ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {isSafe ? 'ずっと安心' : `${bankruptcyAge}歳ごろ`}
                </p>
                {isSafe ? (
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">100歳までプラスを維持</p>
                ) : (
                    <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">不足額: {formatInteger(Math.abs(Math.round(bankruptcyAmount)))}万円</p>
                )}
            </div>

            <div className="p-8 rounded-[2rem] border border-slate-200/60 bg-white premium-shadow transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-500 font-bold">
                        <TrendingDown size={20} />
                    </div>
                    <h3 className="font-bold text-slate-700 font-display">生活費が赤字だった年</h3>
                </div>
                <p className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-2">
                    {recurringDeficitYears}年
                </p>
                <p className="text-xs text-slate-500 font-bold tracking-wide">
                    給与・年金などの経常収入だけでは、支出をまかなえなかった年数
                </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-slate-200/60 bg-white premium-shadow transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500 font-bold">
                        <Wallet size={20} />
                    </div>
                    <h3 className="font-bold text-slate-700 font-display">貯金や資産に頼った年</h3>
                </div>
                <p className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-2">
                    {financingYears}年
                </p>
                <p className="text-xs text-slate-500 font-bold tracking-wide">
                    不足分を補うために、取り崩し・資産移管を使った累計
                    <span className="text-indigo-600 ml-1">{formatInteger(Math.round(financingTotal))}万円</span>
                </p>
            </div>
        </div>
    );
};
