import React from 'react';
import { AnnualResult } from '../../types';
import { AlertTriangle, Wallet, TrendingUp } from 'lucide-react';
import { formatInteger } from '../../lib/format';

interface Props {
    results: AnnualResult[];
}

export const SummaryCards: React.FC<Props> = ({ results }) => {
    if (!results.length) return null;

    // 1. Bankruptcy (Depletion)
    let bankruptcyAge = -1;
    let bankruptcyAmount = 0;
    const retirementSnapshot = results.find(r => r.age >= 65) ?? results[results.length - 1];
    const finalSnapshot = results[results.length - 1];

    results.forEach(r => {
        // Check first year of negative
        if (r.assets.total < 0 && bankruptcyAge === -1) {
            bankruptcyAge = r.age;
            bankruptcyAmount = r.assets.total;
        }
    });

    const isSafe = bankruptcyAge === -1;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="p-8 rounded-[2rem] border border-slate-200/60 bg-white premium-shadow transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-blue-50 text-blue-500 font-bold">
                        <Wallet size={20} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-slate-700 font-display">65歳時点の資産</h3>
                </div>
                <p className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-2">
                    {formatInteger(Math.round(retirementSnapshot.assets.total))}万円
                </p>
                <p className="text-xs text-slate-500 font-bold tracking-wide">
                    {retirementSnapshot.year}年（{retirementSnapshot.age}歳）時点の貯蓄・投資の合計
                </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-slate-200/60 bg-white premium-shadow transition-transform hover:scale-[1.02]">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-500 font-bold">
                        <TrendingUp size={20} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-slate-700 font-display">最終年の資産</h3>
                </div>
                <p className="text-4xl font-display font-bold text-slate-900 tracking-tight mb-2">
                    {formatInteger(Math.round(finalSnapshot.assets.total))}万円
                </p>
                <p className="text-xs text-slate-500 font-bold tracking-wide">
                    {finalSnapshot.year}年（{finalSnapshot.age}歳）時点の貯蓄・投資の合計
                </p>
            </div>

            <div className={`p-8 rounded-[2rem] border premium-shadow transition-transform hover:scale-[1.02] ${!isSafe ? 'bg-rose-50 border-rose-100 ring-4 ring-rose-50/50' : 'bg-emerald-50 border-emerald-100 ring-4 ring-emerald-50/50'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-xl ${!isSafe ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                        <AlertTriangle size={20} aria-hidden="true" />
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
        </div>
    );
};
