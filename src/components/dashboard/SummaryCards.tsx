import React from 'react';
import { AnnualResult } from '../../types';
import { AlertTriangle, TrendingDown, Wallet } from 'lucide-react';
import { formatInteger } from '../../lib/format';

interface Props {
    results: AnnualResult[];
}

export const SummaryCards: React.FC<Props> = ({ results }) => {
    if (!results.length) return null;

    // 1. Min Balance
    let minBalance = Infinity;
    let minBalanceAge = -1;

    // 2. Bankruptcy (Depletion)
    let bankruptcyAge = -1;
    let bankruptcyAmount = 0;

    results.forEach(r => {
        if (r.assets.total < minBalance) {
            minBalance = r.assets.total;
            minBalanceAge = r.age;
        }

        // Check first year of negative
        if (r.assets.total < 0 && bankruptcyAge === -1) {
            bankruptcyAge = r.age;
            bankruptcyAmount = r.assets.total;
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
                    <h3 className="font-bold text-slate-700 font-display">お金がなくなる時期</h3>
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
                    <h3 className="font-bold text-slate-700 font-display">いちばん貯金が少ない時</h3>
                </div>
                <p className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-2">
                    {formatInteger(Math.round(minBalance))}万円
                </p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <span className="text-blue-500">{minBalanceAge}歳</span> のとき
                </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-slate-200/60 bg-white premium-shadow transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500 font-bold">
                        <Wallet size={20} />
                    </div>
                    <h3 className="font-bold text-slate-700 font-display">生涯のさいごに残るお金</h3>
                </div>
                <p className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-2">
                    {formatInteger(Math.round(results[results.length - 1].assets.total))}万円
                </p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <span className="text-indigo-500">{results[results.length - 1].age}歳</span> のとき
                </p>
            </div>
        </div>
    );
};
