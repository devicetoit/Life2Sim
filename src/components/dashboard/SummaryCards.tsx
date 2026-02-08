import React from 'react';
import { AnnualResult } from '../../types';
import { AlertTriangle, TrendingDown, Wallet } from 'lucide-react';

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${!isSafe ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={!isSafe ? "text-red-500" : "text-green-500"} />
                    <h3 className="font-semibold text-gray-700">資産枯渇</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {isSafe ? '枯渇なし' : `${bankruptcyAge}歳`}
                </p>
                {!isSafe && <p className="text-sm text-red-600">不足額: {Math.abs(Math.round(bankruptcyAmount))}万円</p>}
            </div>

            <div className="p-4 rounded-lg border bg-white border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="text-blue-500" />
                    <h3 className="font-semibold text-gray-700">最低資産残高</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {Math.round(minBalance)}万円
                </p>
                <p className="text-sm text-gray-500">({minBalanceAge}歳時点)</p>
            </div>

            <div className="p-4 rounded-lg border bg-white border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <Wallet className="text-purple-500" />
                    <h3 className="font-semibold text-gray-700">最終残高 ({results[results.length - 1].age}歳)</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                    {Math.round(results[results.length - 1].assets.total)}万円
                </p>
            </div>
        </div>
    );
};
