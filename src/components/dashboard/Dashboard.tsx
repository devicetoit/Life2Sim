import React, { useEffect } from 'react';
import { useStore } from '../../store';
import { AssetChart } from '../charts/AssetChart';
import { BalanceChart } from '../charts/BalanceChart';
import { SummaryCards } from './SummaryCards';
import { AnnualTable } from '../table/AnnualTable';
import { DataEditor } from '../editor/DataEditor';
import { TrendingUp, Wallet, Clock, CloudUpload, LogIn, LogOut, Save } from 'lucide-react';

interface DashboardProps {
    userEmail: string | null;
    isAuthLoading: boolean;
    isSyncing: boolean;
    isSaving: boolean;
    authError: string | null;
    onLogin: () => Promise<void>;
    onLogout: () => Promise<void>;
    onSave: () => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({
    userEmail,
    isAuthLoading,
    isSyncing,
    isSaving,
    authError,
    onLogin,
    onLogout,
    onSave,
}) => {
    const { data, results, updateData } = useStore();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    useEffect(() => {
        // Initial Calc
        if (results.length === 0) {
            useStore.getState().recalc();
        }
    }, [results.length]);

    if (!results || results.length === 0) return <div>読み込み中…</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
            {/* Header - Premium Navigation */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-5 flex flex-col xl:flex-row xl:items-center justify-between gap-6 sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-premium-gradient p-2.5 rounded-2xl shadow-lg shadow-indigo-100 rotate-3">
                        <TrendingUp className="text-white w-7 h-7 -rotate-3" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-display font-bold text-slate-800 tracking-tight flex items-center gap-2">
                            Life2Sim <span className="text-indigo-600 font-bold text-[10px] tracking-widest px-2 py-0.5 bg-indigo-50 rounded-lg border border-indigo-100">シミュレーター</span>
                        </h1>
                        <p className="text-[11px] text-slate-400 font-bold tracking-wider">家族の未来を描くライフシミュレーター</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                    <div className="px-4 py-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">制度ルール</p>
                        <p className={`text-xs font-bold ${data.settings.policy?.enabled !== false ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {data.settings.policy?.enabled !== false ? 'ON' : 'OFF'}
                        </p>
                    </div>

                    {/* Simplified Risk Mgmt */}
                    <div className="flex items-center gap-4 bg-rose-50/40 p-1 pl-4 rounded-2xl border border-rose-100/50 hover:bg-rose-50 transition-colors">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest leading-none mb-1.5 mt-1">もしもの時のシミュレーション</span>
                            <select
                                aria-label="もしもの時の年齢設定"
                                className="bg-transparent text-sm font-bold text-rose-700 cursor-pointer pb-1 pr-6"
                                value={data.settings.deathAge || 0}
                                onChange={(e) => updateData(d => ({
                                    ...d,
                                    settings: { ...d.settings, deathAge: Number(e.target.value) }
                                }))}
                            >
                                <option value={0}>100歳まで生存 (標準)</option>
                                <option value={45}>もしもの時：45歳</option>
                                <option value={50}>もしもの時：50歳</option>
                                <option value={55}>もしもの時：55歳</option>
                                <option value={60}>もしもの時：60歳</option>
                            </select>
                        </div>
                    </div>

                    {/* Sidebar Toggle and Auth / Sync */}
                    <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${isSidebarOpen ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200 shadow-sm'}`}
                        >
                            <Save size={14} />
                            {isSidebarOpen ? '設定を隠す' : '設定を表示'}
                        </button>

                        <div className="w-[1px] h-6 bg-slate-200 mx-1" />

                        {userEmail ? (
                            <>
                                <div className="px-3 py-1 flex flex-col justify-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Cloud Sync</span>
                                    <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">{userEmail}</span>
                                </div>
                                <button
                                    onClick={onSave}
                                    disabled={isSaving || isSyncing}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 transition-colors transition-transform flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <CloudUpload size={14} className={isSaving ? 'animate-bounce' : ''} />
                                    {isSaving ? '保存中…' : '保存'}
                                </button>
                                <button
                                    onClick={onLogout}
                                    disabled={isAuthLoading}
                                    aria-label="ログアウト"
                                    className="p-2.5 rounded-xl bg-white text-slate-400 hover:text-rose-500 border border-slate-200 hover:border-rose-100 transition-colors shadow-sm"
                                    title="Logout"
                                >
                                    <LogOut size={16} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onLogin}
                                disabled={isAuthLoading}
                                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors transition-transform flex items-center gap-2 shadow-sm hover:translate-y-[-1px]"
                            >
                                <LogIn size={16} className="text-indigo-500" />
                                クラウド同期
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {authError && (
                <div
                    role="alert"
                    aria-live="polite"
                    className="bg-rose-50 border-b border-rose-100 px-8 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top duration-300"
                >
                    <div className="p-1 bg-rose-100 rounded-lg">
                        <Save size={14} className="text-rose-600" />
                    </div>
                    <p className="text-sm font-bold text-rose-700">{authError}</p>
                </div>
            )}

            <main className="flex-1 min-h-0 flex flex-row relative">
                <div className={`flex-1 p-8 bg-slate-50/30 scroll-smooth`}>
                    <div className="max-w-[1400px] mx-auto">
                        <SummaryCards results={results} />

                        <div className={`grid grid-cols-1 ${isSidebarOpen ? '2xl:grid-cols-2' : 'xl:grid-cols-2'} gap-8 mt-10`}>
                            <div className="bg-white p-8 rounded-[2rem] premium-shadow border border-slate-200/60 ring-1 ring-slate-100">
                                <h2 className="text-xl font-display font-bold text-slate-800 mb-8 flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-50 rounded-xl">
                                        <Wallet className="text-indigo-500 w-5 h-5" />
                                    </div>
                                    収支推移 (入るお金・使うお金)
                                </h2>
                                <BalanceChart results={results} />
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] premium-shadow border border-slate-200/60 ring-1 ring-slate-100">
                                <h2 className="text-xl font-display font-bold text-slate-800 mb-8 flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-50 rounded-xl">
                                        <Clock className="text-emerald-500 w-5 h-5" />
                                    </div>
                                    資産（貯蓄・投資）の推移
                                </h2>
                                <AssetChart results={results} assets={data.assets} />
                            </div>
                        </div>

                        <div className="mt-10 mb-10 bg-white p-8 rounded-[2rem] premium-shadow border border-slate-200/60 ring-1 ring-slate-100">
                            <h2 className="text-xl font-display font-bold text-slate-800 mb-8 px-2">生涯の家計簿 (年度別詳細)</h2>
                            <AnnualTable results={results} />
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Editor */}
                <aside className={`${isSidebarOpen ? 'w-[400px] translate-x-0 opacity-100' : 'w-0 translate-x-full opacity-0'} transition-[width,opacity,transform] duration-300 ease-in-out border-l border-slate-200 bg-white overflow-hidden flex flex-col`}>
                    <div className="w-[400px] h-full overflow-y-auto">
                        <DataEditor isSidebar={true} />
                    </div>
                </aside>
            </main>

            {/* Mobile Editor Trigger */}
            <div className="lg:hidden">
                <DataEditor />
            </div>
        </div>
    );
};
