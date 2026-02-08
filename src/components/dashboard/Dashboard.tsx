import React, { useEffect } from 'react';
import { useStore } from '../../store';
import { AssetChart } from '../charts/AssetChart';
import { BalanceChart } from '../charts/BalanceChart';
import { SummaryCards } from './SummaryCards';
import { AnnualTable } from '../table/AnnualTable';
import { DataEditor } from '../editor/DataEditor';
import { TrendingUp, Wallet, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const { data, results, updateData } = useStore();

    useEffect(() => {
        // Initial Calc
        if (results.length === 0) {
            useStore.getState().recalc(); // Call recalc from store directly
        }
    }, [results.length]); // Only depend on results.length

    if (!results || results.length === 0) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp className="text-indigo-600" />
                        Life2Sim
                    </h1>
                    <p className="text-sm text-gray-500">家族の未来を描くライフシミュレーターです。</p>
                </div>

                <div className="flex gap-4 items-end">
                    {/* Simple Toggle for Death Scenario */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">万一モード (死亡年齢)</label>
                        <select
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={data.settings.deathAge || 0}
                            onChange={(e) => updateData(d => ({
                                ...d,
                                settings: { ...d.settings, deathAge: Number(e.target.value) }
                            }))}
                        >
                            <option value={0}>なし (標準)</option>
                            <option value={45}>45歳</option>
                            <option value={50}>50歳</option>
                            <option value={55}>55歳</option>
                            <option value={60}>60歳</option>
                        </select>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto">
                <SummaryCards results={results} />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Wallet className="text-indigo-500" />
                            収支推移 (収入・支出)
                        </h2>
                        <BalanceChart results={results} />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Clock className="text-indigo-500" />
                            資産残高推移
                        </h2>
                        <AssetChart results={results} assets={data.assets} />
                    </div>
                </div>

                <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-6">年間収支詳細 (5年刻み)</h2>
                    <AnnualTable results={results} />
                </div>
            </main>

            <DataEditor />
        </div>
    );
};
