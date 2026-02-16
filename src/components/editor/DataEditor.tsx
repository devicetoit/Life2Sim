import React, { useState, useRef, useCallback } from 'react';
import { useStore } from '../../store';
import { Save, Download, ChevronUp, Trash2, Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { ProjectData } from '../../types';

// Simple validation for imported JSON
const validateProjectData = (data: unknown): data is ProjectData => {
    if (!data || typeof data !== 'object') return false;
    const d = data as Record<string, unknown>;
    return (
        Array.isArray(d.people) &&
        Array.isArray(d.incomes) &&
        Array.isArray(d.assets) &&
        typeof d.housing === 'object' &&
        typeof d.settings === 'object'
    );
};

interface DataEditorProps {
    isSidebar?: boolean;
}

export const DataEditor: React.FC<DataEditorProps> = ({ isSidebar = false }) => {
    const { data, updateData, importData } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileImport = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const parsed = JSON.parse(content);

                if (!validateProjectData(parsed)) {
                    setImportStatus({ type: 'error', message: 'JSONの形式が正しくありません。必須項目が不足しています。' });
                    return;
                }

                importData(content);
                setImportStatus({ type: 'success', message: `${file.name} を正常に読み込みました。` });
                setTimeout(() => setImportStatus(null), 3000);
            } catch (err) {
                setImportStatus({ type: 'error', message: 'JSONの解析に失敗しました。ファイル形式を確認してください。' });
            }
        };
        reader.readAsText(file);
    }, [importData]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/json') {
            handleFileImport(file);
        } else {
            setImportStatus({ type: 'error', message: 'JSONファイルのみ対応しています。' });
        }
    }, [handleFileImport]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileImport(file);
        }
    }, [handleFileImport]);

    const exportJSON = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `life-plan-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const exportCSV = () => {
        // Simple CSV export for summary or results? 
        // User asked for "Parameters" in CSV. Let's do a basic one for Incomes/Assets.
        let csv = "Category,Name,Amount/Value,Start,End\n";
        data.incomes.forEach(inc => {
            csv += `Income,${inc.name},${inc.amount},${inc.startAge},${inc.endAge}\n`;
        });
        data.assets.forEach(a => {
            csv += `Asset,${a.name},${a.initialAmount},${a.rate}%,-\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `life-plan-params.csv`;
        a.click();
    };

    if (!isOpen && !isSidebar) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-3 z-50 hover:translate-y-[-2px] active:translate-y-[0px]"
            >
                <Save size={20} className="text-indigo-400" />
                <span className="font-bold text-sm tracking-tight text-white/90">データをいじる・保存・読込</span>
            </button>
        );
    }

    const editorContent = (
        <div className={`${isSidebar ? 'w-full h-full' : 'w-full max-w-2xl h-full shadow-2xl'} bg-slate-50 flex flex-col font-sans`}>
            <header className="p-6 bg-white border-b border-slate-200/60 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded-lg">
                        <Save size={20} className="text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-display font-bold text-slate-800">
                        シミュレーター設定
                    </h2>
                </div>
                {!isSidebar && (
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronUp size={24} />
                    </button>
                )}
                </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-10">
                    {/* Export Section */}
                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60 transition-all hover:border-indigo-100">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-5">保存と書き出し</h3>
                        <div className="flex gap-4">
                            <button onClick={exportJSON} className="flex-1 flex items-center justify-center gap-2 p-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors">
                            <Download size={16} /> JSONで保存
                            </button>
                            <button onClick={exportCSV} className="flex-1 flex items-center justify-center gap-2 p-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                            <Download size={16} /> CSVで書き出し
                            </button>
                        </div>
                    </section>

                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-display font-bold text-slate-800">家族構成</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Family Members</p>
                        </div>
                            <button
                                onClick={() => updateData(d => ({
                                    ...d,
                                    people: [...d.people, {
                                        id: `p${Date.now()}`,
                                        name: '新規メンバー',
                                        birthYear: 2000,
                                        sex: 'male' as const,
                                        relation: 'child' as const
                                    }]
                                }))}
                                className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded hover:bg-pink-200"
                            >
                                + 追加
                            </button>
                        </div>
                        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">名前</th>
                                        <th className="px-3 py-2 text-left w-20">生年</th>
                                        <th className="px-3 py-2 text-left w-20">続柄</th>
                                        <th className="px-3 py-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.people.map((person) => (
                                        <tr key={person.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                                <input
                                                    className="w-full border-none p-0 focus:ring-0 bg-transparent"
                                                    value={person.name}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        people: d.people.map(p => p.id === person.id ? { ...p, name: e.target.value } : p)
                                                    }))}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full border-none p-0 focus:ring-0 bg-transparent"
                                                    value={person.birthYear}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        people: d.people.map(p => p.id === person.id ? { ...p, birthYear: Number(e.target.value) } : p)
                                                    }))}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <select
                                                    className="w-full border-none p-0 focus:ring-0 bg-transparent text-xs"
                                                    value={person.relation}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        people: d.people.map(p => p.id === person.id ? { ...p, relation: e.target.value as any } : p)
                                                    }))}
                                                >
                                                    <option value="self">本人</option>
                                                    <option value="spouse">配偶者</option>
                                                    <option value="child">子</option>
                                                    <option value="other">その他</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                {person.relation !== 'self' && (
                                                    <button
                                                        onClick={() => updateData(d => ({ ...d, people: d.people.filter(p => p.id !== person.id) }))}
                                                        className="text-gray-300 hover:text-red-500"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-display font-bold text-slate-800">収入の予定</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Income Sources</p>
                        </div>
                            <button
                                onClick={() => updateData(d => ({
                                    ...d,
                                    incomes: [...d.incomes, {
                                        id: `inc${Date.now()}`,
                                        personId: d.people[0]?.id || 'p1',
                                        name: '新規収入',
                                        category: 'salary' as const,
                                        amount: 0,
                                    startAge: 40,
                                        endAge: 65,
                                        taxRate: 0.8
                                    }]
                                }))}
                                className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200"
                            >
                                + 追加
                            </button>
                        </div>
                        <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-2 py-2 text-left">対象</th>
                                        <th className="px-2 py-2 text-left">名称</th>
                                        <th className="px-2 py-2 text-left w-20">カテゴリ</th>
                                        <th className="px-2 py-2 text-right w-16">金額</th>
                                        <th className="px-2 py-2 text-right w-12">開始</th>
                                        <th className="px-2 py-2 text-right w-12">終了</th>
                                        <th className="px-2 py-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.incomes.map((inc) => {
                                        return (
                                            <tr key={inc.id} className="hover:bg-gray-50">
                                                <td className="px-2 py-1">
                                                    <select
                                                        className="w-full border-none p-0 focus:ring-0 bg-transparent text-xs"
                                                        value={inc.personId}
                                                        onChange={(e) => updateData(d => ({
                                                            ...d,
                                                            incomes: d.incomes.map(i => i.id === inc.id ? { ...i, personId: e.target.value } : i)
                                                        }))}
                                                    >
                                                        {data.people.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        className="w-full border-none p-0 focus:ring-0 bg-transparent text-sm"
                                                        value={inc.name}
                                                        onChange={(e) => updateData(d => ({
                                                            ...d,
                                                            incomes: d.incomes.map(i => i.id === inc.id ? { ...i, name: e.target.value } : i)
                                                        }))}
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <select
                                                        className="w-full border-none p-0 focus:ring-0 bg-transparent text-xs"
                                                        value={inc.category}
                                                        onChange={(e) => updateData(d => ({
                                                            ...d,
                                                            incomes: d.incomes.map(i => i.id === inc.id ? { ...i, category: e.target.value as any } : i)
                                                        }))}
                                                    >
                                                    <option value="salary">給与（手取り）</option>
                                                    <option value="public_pension">公的年金</option>
                                                        <option value="other">その他</option>
                                                    </select>
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        className="w-full border-none p-0 focus:ring-0 bg-transparent text-right"
                                                        value={inc.amount}
                                                        onChange={(e) => updateData(d => ({
                                                            ...d,
                                                            incomes: d.incomes.map(i => i.id === inc.id ? { ...i, amount: Number(e.target.value) } : i)
                                                        }))}
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        className="w-full border-none p-0 focus:ring-0 bg-transparent text-right"
                                                        value={inc.startAge}
                                                        onChange={(e) => updateData(d => ({
                                                            ...d,
                                                            incomes: d.incomes.map(i => i.id === inc.id ? { ...i, startAge: Number(e.target.value) } : i)
                                                        }))}
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <input
                                                        type="number"
                                                        className="w-full border-none p-0 focus:ring-0 bg-transparent text-right"
                                                        value={inc.endAge}
                                                        onChange={(e) => updateData(d => ({
                                                            ...d,
                                                            incomes: d.incomes.map(i => i.id === inc.id ? { ...i, endAge: Number(e.target.value) } : i)
                                                        }))}
                                                    />
                                                </td>
                                                <td className="px-2 py-1">
                                                    <button
                                                        onClick={() => updateData(d => ({ ...d, incomes: d.incomes.filter(i => i.id !== inc.id) }))}
                                                        className="text-gray-300 hover:text-red-500"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-display font-bold text-slate-800">貯金と運用の設定</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assets & Investments</p>
                        </div>
                            <button
                                onClick={() => updateData(d => ({
                                    ...d,
                                    assets: [...d.assets, {
                                        id: `a${Date.now()}`,
                                    name: '新しい貯金',
                                        type: 'cash' as const,
                                        term: 'short' as const,
                                        initialAmount: 0,
                                        rate: 0
                                    }]
                                }))}
                                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
                            >
                                + 追加
                            </button>
                        </div>
                        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-3 py-2 text-left">名称</th>
                                    <th className="px-3 py-2 text-left">種類</th>
                                    <th className="px-3 py-2 text-right">現在の金額</th>
                                    <th className="px-3 py-2 text-right">増える割合(年)</th>
                                        <th className="px-3 py-2 w-8"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {data.assets.map((asset) => (
                                        <tr key={asset.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                                <input
                                                    className="w-full border-none p-0 focus:ring-0 bg-transparent font-medium"
                                                    value={asset.name}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        assets: d.assets.map(a => a.id === asset.id ? { ...a, name: e.target.value } : a)
                                                    }))}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <select
                                                    className="w-full border-none p-0 focus:ring-0 bg-transparent text-xs"
                                                    value={asset.term}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        assets: d.assets.map(a => a.id === asset.id ? { ...a, term: e.target.value as any } : a)
                                                    }))}
                                                >
                                                <option value="short">普通預金など</option>
                                                <option value="medium">定期預金など</option>
                                                <option value="long">投資信託など</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    className="w-full border-none p-0 focus:ring-0 bg-transparent text-right"
                                                    value={asset.initialAmount}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        assets: d.assets.map(a => a.id === asset.id ? { ...a, initialAmount: Number(e.target.value) } : a)
                                                    }))}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center justify-end gap-1">
                                                    <input
                                                        type="number"
                                                        step="0.1"
                                                        className="w-12 border-none p-0 focus:ring-0 bg-transparent text-right"
                                                        value={asset.rate}
                                                        onChange={(e) => updateData(d => ({
                                                            ...d,
                                                            assets: d.assets.map(a => a.id === asset.id ? { ...a, rate: Number(e.target.value) } : a)
                                                        }))}
                                                    />
                                                    <span className="text-gray-400">%</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    onClick={() => updateData(d => ({ ...d, assets: d.assets.filter(a => a.id !== asset.id) }))}
                                                    className="text-gray-300 hover:text-red-500"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex flex-col mb-6">
                        <h3 className="text-lg font-display font-bold text-slate-800">マイホームの予定</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Housing & Mortgage</p>
                    </div>
                        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">購入年齢</label>
                                    <input
                                        type="number"
                                        className="w-full text-sm border-gray-200 rounded"
                                        value={data.housing.purchaseAge}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            housing: { ...d.housing, purchaseAge: Number(e.target.value) }
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">購入価格(万円)</label>
                                    <input
                                        type="number"
                                        className="w-full text-sm border-gray-200 rounded"
                                        value={data.housing.price}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            housing: { ...d.housing, price: Number(e.target.value) }
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">住宅ローンの内容</h4>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">借入金額(万円)</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded"
                                            value={data.housing.loanAmount}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                housing: { ...d.housing, loanAmount: Number(e.target.value) }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">返済期間(年)</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded"
                                            value={data.housing.loanTerm}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                housing: { ...d.housing, loanTerm: Number(e.target.value) }
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase">金利の切り替わり</label>
                                        <button
                                            onClick={() => updateData(d => ({
                                                ...d,
                                                housing: {
                                                    ...d.housing,
                                                    interestPeriods: [...d.housing.interestPeriods, { years: 10, rate: 1.0 }]
                                                }
                                            }))}
                                            className="text-[10px] bg-white border px-2 py-0.5 rounded shadow-sm hover:bg-gray-50"
                                        >
                                            + 期間追加
                                        </button>
                                    </div>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr>
                                            <th className="text-left pb-1 font-normal text-gray-400">何年後まで</th>
                                            <th className="text-left pb-1 font-normal text-gray-400">金利 (%)</th>
                                                <th className="w-6"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="space-y-1">
                                            {data.housing.interestPeriods.map((period, idx) => (
                                                <tr key={idx}>
                                                    <td className="pr-2 pb-1">
                                                        <input
                                                            type="number"
                                                            className="w-full border-gray-200 rounded p-1"
                                                            value={period.years}
                                                            onChange={(e) => updateData(d => ({
                                                                ...d,
                                                                housing: {
                                                                    ...d.housing,
                                                                    interestPeriods: d.housing.interestPeriods.map((p, i) => i === idx ? { ...p, years: Number(e.target.value) } : p)
                                                                }
                                                            }))}
                                                        />
                                                    </td>
                                                    <td className="pr-2 pb-1">
                                                        <input
                                                            type="number"
                                                            step="0.001"
                                                            className="w-full border-gray-200 rounded p-1"
                                                            value={period.rate}
                                                            onChange={(e) => updateData(d => ({
                                                                ...d,
                                                                housing: {
                                                                    ...d.housing,
                                                                    interestPeriods: d.housing.interestPeriods.map((p, i) => i === idx ? { ...p, rate: Number(e.target.value) } : p)
                                                                }
                                                            }))}
                                                        />
                                                    </td>
                                                    <td className="pb-1 text-center">
                                                        <button
                                                            onClick={() => updateData(d => ({
                                                                ...d,
                                                                housing: {
                                                                    ...d.housing,
                                                                    interestPeriods: d.housing.interestPeriods.filter((_, i) => i !== idx)
                                                                }
                                                            }))}
                                                            className="text-gray-300 hover:text-red-500"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                    <label className="text-xs text-gray-400 block mb-1">ローン保険(団信)の種類</label>
                                        <input
                                            className="w-full text-sm border-gray-200 rounded"
                                            value={data.housing.danshinType || ''}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                housing: { ...d.housing, danshinType: e.target.value }
                                            }))}
                                            placeholder="一般、ガン団信など"
                                        />
                                    </div>
                                    <div>
                                    <label className="text-xs text-gray-400 block mb-1">保険による金利上乗せ(%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full text-sm border-gray-200 rounded"
                                            value={data.housing.danshinRate || 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                housing: { ...d.housing, danshinRate: Number(e.target.value) }
                                            }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">全疾病保障種類</label>
                                        <input
                                            className="w-full text-sm border-gray-200 rounded"
                                            value={data.housing.allDiseaseType || ''}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                housing: { ...d.housing, allDiseaseType: e.target.value }
                                            }))}
                                            placeholder="全疾病保障、生活習慣病など"
                                        />
                                    </div>
                                    <div>
                                    <label className="text-xs text-gray-400 block mb-1">病気保障の追加利率(%)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full text-sm border-gray-200 rounded"
                                            value={data.housing.allDiseaseRate || 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                housing: { ...d.housing, allDiseaseRate: Number(e.target.value) }
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">頭金(万円)</label>
                                    <input
                                        type="number"
                                        className="w-full text-sm border-gray-200 rounded"
                                        value={data.housing.downPayment}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            housing: { ...d.housing, downPayment: Number(e.target.value) }
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">購入前家賃(月/万)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        className="w-full text-sm border-gray-200 rounded"
                                        value={data.housing.rentalCost}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            housing: { ...d.housing, rentalCost: Number(e.target.value) }
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">年間維持費(万)</label>
                                    <input
                                        type="number"
                                        className="w-full text-sm border-gray-200 rounded"
                                        value={data.housing.maintenanceCost}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            housing: { ...d.housing, maintenanceCost: Number(e.target.value) }
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex flex-col mb-6">
                        <h3 className="text-lg font-display font-bold text-slate-800">毎月の生活費（基本）</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Basic Living Costs</p>
                    </div>
                        <div className="space-y-4">
                            {data.livingCostSteps.map((step) => {
                                const updateBreakdown = (f: string, val: number) => {
                                    const newBreakdown = { ...step.breakdown, [f]: val };
                                    updateData(d => ({
                                        ...d,
                                        livingCostSteps: d.livingCostSteps.map(s => s.id === step.id ? { ...s, breakdown: newBreakdown } : s)
                                    }));
                                };

                                const total = Object.values(step.breakdown).reduce((sum, v) => sum + (v || 0), 0);

                                return (
                                    <div key={step.id} className="bg-white p-4 rounded-lg border shadow-sm">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-24">
                                                    <label className="text-[10px] text-gray-400 uppercase">開始年齢</label>
                                                    <input
                                                        type="number"
                                                        className="w-full text-sm border-gray-200 rounded"
                                                        value={step.startAge}
                                                        onChange={(e) => updateData(d => ({
                                                            ...d,
                                                            livingCostSteps: d.livingCostSteps.map(s => s.id === step.id ? { ...s, startAge: Number(e.target.value) } : s)
                                                        }))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] text-gray-400 uppercase">月額合計</label>
                                                    <p className="text-lg font-bold text-indigo-600">{total.toFixed(1)}<span className="text-xs font-normal text-gray-400 ml-1">万円</span></p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => updateData(d => ({ ...d, livingCostSteps: d.livingCostSteps.filter(s => s.id !== step.id) }))}
                                                className="text-gray-300 hover:text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div>
                                                <label className="text-[10px] text-gray-400">食費</label>
                                                <input type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.food || 0} onChange={(e) => updateBreakdown('food', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400">通信費</label>
                                                <input type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.communication || 0} onChange={(e) => updateBreakdown('communication', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400">日用品</label>
                                                <input type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.dailyGoods || 0} onChange={(e) => updateBreakdown('dailyGoods', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400">水道光熱費</label>
                                                <input type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.utilities || 0} onChange={(e) => updateBreakdown('utilities', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400">趣味・娯楽</label>
                                                <input type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.hobby || 0} onChange={(e) => updateBreakdown('hobby', Number(e.target.value))} />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400">その他</label>
                                                <input type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.other || 0} onChange={(e) => updateBreakdown('other', Number(e.target.value))} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <button
                                onClick={() => updateData(d => ({
                                    ...d,
                                    livingCostSteps: [...d.livingCostSteps, {
                                        id: `l${Date.now()}`,
                                        startAge: 65,
                                        breakdown: { food: 5, communication: 1, dailyGoods: 2, utilities: 2, hobby: 3, other: 2 }
                                    }].sort((a, b) => a.startAge - b.startAge)
                                }))}
                                className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors text-sm"
                            >
                                + 生活費ステップを追加
                            </button>
                        </div>
                    </section>

                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex flex-col mb-6">
                        <h3 className="text-lg font-display font-bold text-slate-800">たまの出費（旅行・車など）</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Life Events & Large Expenses</p>
                    </div>
                        <div className="space-y-2">
                            {data.events.map((event) => (
                                <div key={event.id} className="bg-white p-3 rounded-lg border shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <input
                                            className="font-medium text-gray-800 border-none p-0 focus:ring-0 flex-1"
                                            value={event.name}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                events: d.events.map(ev => ev.id === event.id ? { ...ev, name: e.target.value } : ev)
                                            }))}
                                        />
                                        <button
                                            onClick={() => updateData(d => ({ ...d, events: d.events.filter(ev => ev.id !== event.id) }))}
                                            className="text-gray-300 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-sm">
                                        <div>
                                            <label className="text-xs text-gray-400">金額(万円)</label>
                                            <input
                                                type="number"
                                                className="w-full border-gray-200 rounded mt-1"
                                                value={event.amount}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    events: d.events.map(ev => ev.id === event.id ? { ...ev, amount: Number(e.target.value) } : ev)
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">開始年齢</label>
                                            <input
                                                type="number"
                                                className="w-full border-gray-200 rounded mt-1"
                                                value={event.startAge}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    events: d.events.map(ev => ev.id === event.id ? { ...ev, startAge: Number(e.target.value) } : ev)
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">タイプ</label>
                                            <select
                                                className="w-full border-gray-200 rounded mt-1 text-xs"
                                                value={event.type}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    events: d.events.map(ev => ev.id === event.id ? { ...ev, type: e.target.value as any } : ev)
                                                }))}
                                            >
                                                <option value="one_time">一回限り</option>
                                                <option value="periodic">定期</option>
                                            </select>
                                        </div>
                                        {event.type === 'periodic' && (
                                            <div>
                                                <label className="text-xs text-gray-400">間隔(年)</label>
                                                <input
                                                    type="number"
                                                    className="w-full border-gray-200 rounded mt-1"
                                                    value={event.interval || 1}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        events: d.events.map(ev => ev.id === event.id ? { ...ev, interval: Number(e.target.value) } : ev)
                                                    }))}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>


                    {/* Contributions Section */}
                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex flex-col mb-6">
                        <h3 className="text-lg font-display font-bold text-slate-800">積立設定</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Regular Savings & Contributions</p>
                    </div>
                        <div className="space-y-2">
                            {data.contributions.map((contrib) => (
                                <div key={contrib.id} className="bg-white p-3 rounded-lg border shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <input
                                            className="font-medium text-gray-800 border-none p-0 focus:ring-0 flex-1"
                                            value={contrib.name}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                contributions: d.contributions.map(c => c.id === contrib.id ? { ...c, name: e.target.value } : c)
                                            }))}
                                        />
                                        <button
                                            onClick={() => updateData(d => ({ ...d, contributions: d.contributions.filter(c => c.id !== contrib.id) }))}
                                            className="text-gray-300 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-sm">
                                        <div>
                                            <label className="text-xs text-gray-400">対象資産</label>
                                            <select
                                                className="w-full border-gray-200 rounded mt-1 text-xs"
                                                value={contrib.assetId}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    contributions: d.contributions.map(c => c.id === contrib.id ? { ...c, assetId: e.target.value } : c)
                                                }))}
                                            >
                                                {data.assets.map(a => (
                                                    <option key={a.id} value={a.id}>{a.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">金額(万円)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="w-full border-gray-200 rounded mt-1"
                                                value={contrib.amount}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    contributions: d.contributions.map(c => c.id === contrib.id ? { ...c, amount: Number(e.target.value) } : c)
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">開始年齢</label>
                                            <input
                                                type="number"
                                                className="w-full border-gray-200 rounded mt-1"
                                                value={contrib.startAge}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    contributions: d.contributions.map(c => c.id === contrib.id ? { ...c, startAge: Number(e.target.value) } : c)
                                                }))}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">終了年齢</label>
                                            <input
                                                type="number"
                                                className="w-full border-gray-200 rounded mt-1"
                                                value={contrib.endAge}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    contributions: d.contributions.map(c => c.id === contrib.id ? { ...c, endAge: Number(e.target.value) } : c)
                                                }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Education Plans Section */}
                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex flex-col mb-6">
                        <h3 className="text-lg font-display font-bold text-slate-800">教育費設定</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Education Planning</p>
                    </div>
                        <div className="space-y-2">
                            {data.educationPlans.map((plan) => {
                                const child = data.people.find(p => p.id === plan.childId);
                                return (
                                    <div key={plan.childId} className="bg-white p-3 rounded-lg border shadow-sm flex items-center gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-400">対象の子</label>
                                            <p className="font-medium text-gray-800">{child?.name || '不明'}</p>
                                        </div>
                                        <div className="w-32">
                                            <label className="text-xs text-gray-400">累計教育費(万円)</label>
                                            <input
                                                type="number"
                                                className="w-full text-sm border-gray-200 rounded mt-1"
                                                value={plan.totalAmountOverride || 0}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    educationPlans: d.educationPlans.map(ep => ep.childId === plan.childId ? { ...ep, totalAmountOverride: Number(e.target.value) } : ep)
                                                }))}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Personal Fixed Costs Section */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-amber-500 pl-3">個人固定費</h3>
                        <div className="space-y-2">
                            {data.personalFixedCosts.map((cost) => {
                                const person = data.people.find(p => p.id === cost.personId);
                                return (
                                    <div key={cost.id} className="bg-white p-3 rounded-lg border shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{person?.name}</span>
                                                <input
                                                    className="font-medium text-gray-800 border-none p-0 focus:ring-0"
                                                    value={cost.name}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        personalFixedCosts: d.personalFixedCosts.map(c => c.id === cost.id ? { ...c, name: e.target.value } : c)
                                                    }))}
                                                />
                                            </div>
                                            <button
                                                onClick={() => updateData(d => ({ ...d, personalFixedCosts: d.personalFixedCosts.filter(c => c.id !== cost.id) }))}
                                                className="text-gray-300 hover:text-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <label className="text-xs text-gray-400">月額(万円)</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="w-full border-gray-200 rounded mt-1"
                                                    value={cost.amount}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        personalFixedCosts: d.personalFixedCosts.map(c => c.id === cost.id ? { ...c, amount: Number(e.target.value) } : c)
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">開始年齢</label>
                                                <input
                                                    type="number"
                                                    className="w-full border-gray-200 rounded mt-1"
                                                    value={cost.startAge || 0}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        personalFixedCosts: d.personalFixedCosts.map(c => c.id === cost.id ? { ...c, startAge: Number(e.target.value) } : c)
                                                    }))}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400">終了年齢</label>
                                                <input
                                                    type="number"
                                                    className="w-full border-gray-200 rounded mt-1"
                                                    value={cost.endAge || 99}
                                                    onChange={(e) => updateData(d => ({
                                                        ...d,
                                                        personalFixedCosts: d.personalFixedCosts.map(c => c.id === cost.id ? { ...c, endAge: Number(e.target.value) } : c)
                                                    }))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Simulation Settings Section */}
                    <section>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-gray-500 pl-3">シミュレーション設定</h3>
                        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">基準年</label>
                                    <input
                                        type="number"
                                        className="w-full text-sm border-gray-200 rounded"
                                        value={data.settings.baseYear}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            settings: { ...d.settings, baseYear: Number(e.target.value) }
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">開始年齢</label>
                                    <input
                                        type="number"
                                        className="w-full text-sm border-gray-200 rounded"
                                        value={data.settings.startAge}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            settings: { ...d.settings, startAge: Number(e.target.value) }
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">終了年齢</label>
                                    <input
                                        type="number"
                                        className="w-full text-sm border-gray-200 rounded"
                                        value={data.settings.endAge}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            settings: { ...d.settings, endAge: Number(e.target.value) }
                                        }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-2">インフレ率設定</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-500">生活費(%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            value={data.settings.rates.living}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: { ...d.settings, rates: { ...d.settings.rates, living: Number(e.target.value) } }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">教育費(%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            value={data.settings.rates.education}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: { ...d.settings, rates: { ...d.settings.rates, education: Number(e.target.value) } }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">その他(%)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            value={data.settings.rates.other}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: { ...d.settings, rates: { ...d.settings.rates, other: Number(e.target.value) } }
                                            }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

            {!isSidebar && (
                <footer className="p-4 bg-white border-t flex gap-4">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        閉じる
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('すべての編集内容を破棄し、標準データに戻します。よろしいですか？')) {
                                useStore.getState().reset();
                            }
                        }}
                        className="px-6 py-3 border border-red-200 text-red-500 font-bold rounded-lg hover:bg-red-50 transition-colors"
                    >
                        初期化
                    </button>
                </footer>
            )}
        </div>
    );

    if (isSidebar) return editorContent;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
            <div className="animate-in slide-in-from-right duration-300 h-full w-full max-w-2xl">
                {editorContent}
            </div>
        </div>
    );
};
