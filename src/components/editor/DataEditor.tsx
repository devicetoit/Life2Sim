import React, { useState, useRef, useCallback } from 'react';
import { useStore } from '../../store';
import { Save, Download, ChevronUp, Trash2, Upload, FileJson, AlertCircle, CheckCircle, Maximize2, X } from 'lucide-react';
import { ProjectData, EducationStage } from '../../types';

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

const HEALTH_INSURANCE_REGION_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'hokkaido', label: '北海道（協会けんぽ）' },
    { value: 'aomori', label: '青森（協会けんぽ）' },
    { value: 'iwate', label: '岩手（協会けんぽ）' },
    { value: 'miyagi', label: '宮城（協会けんぽ）' },
    { value: 'akita', label: '秋田（協会けんぽ）' },
    { value: 'yamagata', label: '山形（協会けんぽ）' },
    { value: 'fukushima', label: '福島（協会けんぽ）' },
    { value: 'ibaraki', label: '茨城（協会けんぽ）' },
    { value: 'tochigi', label: '栃木（協会けんぽ）' },
    { value: 'gunma', label: '群馬（協会けんぽ）' },
    { value: 'saitama', label: '埼玉（協会けんぽ）' },
    { value: 'chiba', label: '千葉（協会けんぽ）' },
    { value: 'tokyo', label: '東京（協会けんぽ）' },
    { value: 'kanagawa', label: '神奈川（協会けんぽ）' },
    { value: 'niigata', label: '新潟（協会けんぽ）' },
    { value: 'toyama', label: '富山（協会けんぽ）' },
    { value: 'ishikawa', label: '石川（協会けんぽ）' },
    { value: 'fukui', label: '福井（協会けんぽ）' },
    { value: 'yamanashi', label: '山梨（協会けんぽ）' },
    { value: 'nagano', label: '長野（協会けんぽ）' },
    { value: 'gifu', label: '岐阜（協会けんぽ）' },
    { value: 'shizuoka', label: '静岡（協会けんぽ）' },
    { value: 'aichi', label: '愛知（協会けんぽ）' },
    { value: 'mie', label: '三重（協会けんぽ）' },
    { value: 'shiga', label: '滋賀（協会けんぽ）' },
    { value: 'kyoto', label: '京都（協会けんぽ）' },
    { value: 'osaka', label: '大阪（協会けんぽ）' },
    { value: 'hyogo', label: '兵庫（協会けんぽ）' },
    { value: 'nara', label: '奈良（協会けんぽ）' },
    { value: 'wakayama', label: '和歌山（協会けんぽ）' },
    { value: 'tottori', label: '鳥取（協会けんぽ）' },
    { value: 'shimane', label: '島根（協会けんぽ）' },
    { value: 'okayama', label: '岡山（協会けんぽ）' },
    { value: 'hiroshima', label: '広島（協会けんぽ）' },
    { value: 'yamaguchi', label: '山口（協会けんぽ）' },
    { value: 'tokushima', label: '徳島（協会けんぽ）' },
    { value: 'kagawa', label: '香川（協会けんぽ）' },
    { value: 'ehime', label: '愛媛（協会けんぽ）' },
    { value: 'kochi', label: '高知（協会けんぽ）' },
    { value: 'fukuoka', label: '福岡（協会けんぽ）' },
    { value: 'saga', label: '佐賀（協会けんぽ）' },
    { value: 'nagasaki', label: '長崎（協会けんぽ）' },
    { value: 'kumamoto', label: '熊本（協会けんぽ）' },
    { value: 'oita', label: '大分（協会けんぽ）' },
    { value: 'miyazaki', label: '宮崎（協会けんぽ）' },
    { value: 'kagoshima', label: '鹿児島（協会けんぽ）' },
    { value: 'okinawa', label: '沖縄（協会けんぽ）' }
];

const EDUCATION_STAGE_CATEGORY_OPTIONS: Record<string, string[]> = {
    preschool_0_3: ['認可', '認可外', '幼稚園', 'その他'],
    preschool_4_6: ['認可', '認可外', '幼稚園', 'その他'],
    elementary: ['公立', '私立'],
    junior_high: ['公立', '私立'],
    high_school: ['公立', '私立(支援考慮)', '私立(満額負担寄り)'],
    university: ['国公立', '私立文系', '私立理系', 'その他'],
    university_commute: ['自宅', '下宿', 'その他']
};

const EDUCATION_STAGE_PRESET_TOTALS: Record<string, Record<string, number>> = {
    preschool_0_3: {
        '認可': 180,
        '認可外': 360,
        '幼稚園': 180,
        'その他': 180
    },
    preschool_4_6: {
        '認可': 78,
        '認可外': 180,
        '幼稚園': 120,
        'その他': 78
    },
    elementary: {
        '公立': 180,
        '私立': 610
    },
    junior_high: {
        '公立': 180,
        '私立': 304
    },
    high_school: {
        '公立': 150,
        '私立(支援考慮)': 150,
        '私立(満額負担寄り)': 311
    },
    university: {
        '国公立': 600,
        '私立文系': 629,
        '私立理系': 800,
        'その他': 629
    },
    university_commute: {
        '自宅': 144,
        '下宿': 480,
        'その他': 144
    }
};

const getEducationStagePresetTotal = (stageId: string, category: string): number => {
    return EDUCATION_STAGE_PRESET_TOTALS[stageId]?.[category] ?? 0;
};

const DEFAULT_EDUCATION_STAGES: EducationStage[] = [
    { id: 'preschool_0_3', name: '保育園/幼稚園', category: '認可', startAge: 0, endAge: 3, totalAmount: undefined },
    { id: 'preschool_4_6', name: '保育園/幼稚園', category: '認可', startAge: 4, endAge: 6, totalAmount: undefined },
    { id: 'elementary', name: '小学校', category: '公立', startAge: 7, endAge: 12, totalAmount: undefined },
    { id: 'junior_high', name: '中学校', category: '公立', startAge: 13, endAge: 15, totalAmount: undefined },
    { id: 'high_school', name: '高校', category: '公立', startAge: 16, endAge: 18, totalAmount: undefined },
    { id: 'university', name: '大学', category: '国公立', startAge: 19, endAge: 22, totalAmount: undefined },
    { id: 'university_commute', name: '通学区分', category: '自宅', startAge: 19, endAge: 22, totalAmount: undefined }
];

const cloneDefaultEducationStages = (): EducationStage[] =>
    DEFAULT_EDUCATION_STAGES.map((stage) => ({ ...stage }));

export const DataEditor: React.FC<DataEditorProps> = ({ isSidebar = false }) => {
    const data = useStore((state) => state.data);
    const results = useStore((state) => state.results);
    const updateData = useStore((state) => state.updateData);
    const importData = useStore((state) => state.importData);
    const recalc = useStore((state) => state.recalc);
    const [isOpen, setIsOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [expandedEducationPlanChildId, setExpandedEducationPlanChildId] = useState<string | null>(null);
    const [isIncomeEditorExpanded, setIsIncomeEditorExpanded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isJsonFile = (file: File): boolean =>
        file.type === 'application/json' || file.name.toLowerCase().endsWith('.json');

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
        if (file && isJsonFile(file)) {
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
        if (file && isJsonFile(file)) {
            handleFileImport(file);
        } else if (file) {
            setImportStatus({ type: 'error', message: 'JSONファイルのみ対応しています。' });
        }
    }, [handleFileImport]);

    const handleEditorBlurCapture = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') {
            recalc();
        }
    }, [recalc]);

    const handleEditorKeyDownCapture = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Enter') return;
        const target = e.target as HTMLElement | null;
        if (!target) return;
        if (target.tagName === 'TEXTAREA') return;
        const tag = target.tagName;
        if (tag === 'INPUT' || tag === 'SELECT') {
            recalc();
        }
    }, [recalc]);

    const exportJSON = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `life-plan-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const exportText = () => {
        const lines: string[] = [];
        lines.push(`Life2Sim 設定エクスポート`);
        lines.push(`出力日: ${new Date().toISOString()}`);
        lines.push('');

        lines.push('[People]');
        lines.push('id\tname\trelation\tbirthYear\tsex');
        data.people.forEach(p => lines.push(`${p.id}\t${p.name}\t${p.relation}\t${p.birthYear}\t${p.sex}`));
        lines.push('');

        lines.push('[Incomes]');
        lines.push('id\tpersonId\tname\tcategory\tamount\tstartAge\tendAge\tannualGrowthRate\tpeakAmount\tpeakAge\tannualDecayRate');
        data.incomes.forEach(i => lines.push(`${i.id}\t${i.personId}\t${i.name}\t${i.category}\t${i.amount}\t${i.startAge}\t${i.endAge}\t${i.annualGrowthRate ?? ''}\t${i.peakAmount ?? ''}\t${i.peakAge ?? ''}\t${i.annualDecayRate ?? ''}`));
        lines.push('');

        lines.push('[Assets]');
        lines.push('id\tname\ttype\tterm\tinitialAmount\trate');
        data.assets.forEach(a => lines.push(`${a.id}\t${a.name}\t${a.type}\t${a.term}\t${a.initialAmount}\t${a.rate}`));
        lines.push('');

        lines.push('[Contributions]');
        lines.push('id\tname\tassetId\tamount\tfrequency\tstartAge\tendAge\ttargetAssetIdAfterEnd');
        data.contributions.forEach(c => lines.push(`${c.id}\t${c.name}\t${c.assetId}\t${c.amount}\t${c.frequency}\t${c.startAge}\t${c.endAge}\t${c.targetAssetIdAfterEnd ?? ''}`));
        lines.push('');

        lines.push('[LivingCostSteps]');
        lines.push('id\tstartAge\tfood\tcommunication\tdailyGoods\tutilities\thousing\thobby\tother');
        data.livingCostSteps.forEach(s => lines.push(`${s.id}\t${s.startAge}\t${s.breakdown.food}\t${s.breakdown.communication}\t${s.breakdown.dailyGoods}\t${s.breakdown.utilities}\t${s.breakdown.housing ?? 0}\t${s.breakdown.hobby}\t${s.breakdown.other}`));
        lines.push('');

        lines.push('[Events]');
        lines.push('id\tname\tcategory\tamount\ttype\tstartAge\tendAge\tinterval\trateCategory');
        data.events.forEach(e => lines.push(`${e.id}\t${e.name}\t${e.category}\t${e.amount}\t${e.type}\t${e.startAge}\t${e.endAge ?? ''}\t${e.interval ?? ''}\t${e.rateCategory}`));
        lines.push('');

        lines.push('[EducationPlans]');
        lines.push('childId\ttemplateName\ttotalAmountOverride\tstagesJson');
        data.educationPlans.forEach(p => lines.push(`${p.childId}\t${p.templateName ?? ''}\t${p.totalAmountOverride ?? ''}\t${JSON.stringify(p.stages ?? [])}`));
        lines.push('');

        lines.push('[Housing]');
        lines.push(JSON.stringify(data.housing, null, 2));
        lines.push('');

        lines.push('[PersonalFixedCosts]');
        lines.push('id\ttarget\tpersonId\tname\tamount\tstartAge\tendAge');
        data.personalFixedCosts.forEach(p => lines.push(`${p.id}\t${p.target ?? 'person'}\t${p.personId ?? ''}\t${p.name}\t${p.amount}\t${p.startAge ?? ''}\t${p.endAge ?? ''}`));
        lines.push('');

        lines.push('[Settings]');
        lines.push(JSON.stringify(data.settings, null, 2));

        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `life-plan-params-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
    };

    const updateEducationPlanStages = useCallback((childId: string, updater: (stages: EducationStage[]) => EducationStage[]) => {
        updateData((d) => ({
            ...d,
            educationPlans: d.educationPlans.map((ep) => {
                if (ep.childId !== childId) return ep;
                const baseStages = ep.stages && ep.stages.length > 0 ? ep.stages : cloneDefaultEducationStages();
                return {
                    ...ep,
                    stages: updater(baseStages)
                };
            })
        }));
    }, [updateData]);

    const renderEducationStageTable = useCallback((planChildId: string, stages: EducationStage[], wide: boolean = false) => (
        <div className={wide ? '' : 'overflow-x-auto'}>
            <table className={`w-full ${wide ? '' : 'min-w-[760px]'} text-sm border rounded-lg overflow-hidden`}>
                <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                        <th className="px-3 py-2 text-left">区分</th>
                        <th className="px-3 py-2 text-left">開始</th>
                        <th className="px-3 py-2 text-left">終了</th>
                        <th className="px-3 py-2 text-left">種別</th>
                        <th className="px-3 py-2 text-left">累計額(万円)</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {stages.map((stage) => (
                        <tr key={`${planChildId}-${stage.id}`} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-700 whitespace-nowrap">{stage.name}</td>
                            <td className="px-3 py-2 w-20">
                                <input
                                    type="number"
                                    className="w-full border-gray-200 rounded"
                                    name={`education-stage-start-${planChildId}-${stage.id}`}
                                    value={stage.startAge}
                                    onChange={(e) => updateEducationPlanStages(planChildId, (currentStages) =>
                                        currentStages.map((s) => s.id === stage.id ? { ...s, startAge: Number(e.target.value) } : s)
                                    )}
                                />
                            </td>
                            <td className="px-3 py-2 w-20">
                                <input
                                    type="number"
                                    className="w-full border-gray-200 rounded"
                                    name={`education-stage-end-${planChildId}-${stage.id}`}
                                    value={stage.endAge}
                                    onChange={(e) => updateEducationPlanStages(planChildId, (currentStages) =>
                                        currentStages.map((s) => s.id === stage.id ? { ...s, endAge: Number(e.target.value) } : s)
                                    )}
                                />
                            </td>
                            <td className="px-3 py-2 w-40">
                                <select
                                    className="w-full border-gray-200 rounded"
                                    name={`education-stage-category-${planChildId}-${stage.id}`}
                                    value={stage.category || ''}
                                    onChange={(e) => updateEducationPlanStages(planChildId, (currentStages) =>
                                        currentStages.map((s) => s.id === stage.id
                                            ? {
                                                ...s,
                                                category: e.target.value,
                                                totalAmount: getEducationStagePresetTotal(stage.id, e.target.value)
                                            }
                                            : s)
                                    )}
                                >
                                    {(EDUCATION_STAGE_CATEGORY_OPTIONS[stage.id] || ['その他']).map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-3 py-2 w-36">
                                <input
                                    type="number"
                                    className="w-full border-gray-200 rounded"
                                    name={`education-stage-amount-${planChildId}-${stage.id}`}
                                    value={stage.totalAmount ?? ''}
                                    placeholder={`${getEducationStagePresetTotal(stage.id, stage.category || '')}`}
                                    onChange={(e) => updateEducationPlanStages(planChildId, (currentStages) =>
                                        currentStages.map((s) => s.id === stage.id
                                            ? { ...s, totalAmount: e.target.value === '' ? undefined : Number(e.target.value) }
                                            : s)
                                    )}
                                    onBlur={(e) => {
                                        if (e.target.value !== '') return;
                                        const preset = getEducationStagePresetTotal(stage.id, stage.category || '');
                                        updateEducationPlanStages(planChildId, (currentStages) =>
                                            currentStages.map((s) => s.id === stage.id ? { ...s, totalAmount: preset } : s)
                                        );
                                    }}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ), [updateEducationPlanStages]);

    const renderIncomeTable = useCallback((wide: boolean = false) => (
        <div className={wide ? '' : 'overflow-x-auto'}>
            <table className={`w-full ${wide ? '' : 'min-w-max'} text-sm whitespace-nowrap`}>
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                        <th className="px-2 py-2 text-left">対象</th>
                        <th className="px-2 py-2 text-left">名称</th>
                        <th className="px-2 py-2 text-left w-20">カテゴリ</th>
                        <th className="px-2 py-2 text-right w-16">金額</th>
                        <th className="px-2 py-2 text-right w-12">開始</th>
                        <th className="px-2 py-2 text-right w-12">終了</th>
                        <th className="px-2 py-2 text-right w-16">年成長率</th>
                        <th className="px-2 py-2 text-right w-20">ピーク金額</th>
                        <th className="px-2 py-2 text-right w-12">ピーク年齢</th>
                        <th className="px-2 py-2 text-right w-16">減衰率</th>
                        <th className="px-2 py-2 w-8"></th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {data.incomes.map((inc) => (
                        <tr key={inc.id} className="hover:bg-gray-50">
                            <td className="px-2 py-1">
                                <select
                                    className="w-full border-none bg-transparent p-0 text-xs"
                                    aria-label="収入対象者"
                                    value={inc.personId}
                                    onChange={(e) => updateData((d) => ({
                                        ...d,
                                        incomes: d.incomes.map((i) => i.id === inc.id ? { ...i, personId: e.target.value } : i)
                                    }))}
                                >
                                    {data.people.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-2 py-1">
                                <input
                                    className="w-full border-none bg-transparent p-0 text-sm"
                                    aria-label="収入名称"
                                    name={`income-name-${inc.id}`}
                                    autoComplete="off"
                                    value={inc.name}
                                    onChange={(e) => updateData((d) => ({
                                        ...d,
                                        incomes: d.incomes.map((i) => i.id === inc.id ? { ...i, name: e.target.value } : i)
                                    }))}
                                />
                            </td>
                            <td className="px-2 py-1">
                                <select
                                    className="w-full border-none bg-transparent p-0 text-xs"
                                    aria-label="収入カテゴリ"
                                    value={inc.category}
                                    onChange={(e) => updateData((d) => ({
                                        ...d,
                                        incomes: d.incomes.map((i) => i.id === inc.id ? { ...i, category: e.target.value as any } : i)
                                    }))}
                                >
                                    <option value="salary">給与</option>
                                    <option value="public_pension">公的年金</option>
                                    <option value="private_pension">私的年金</option>
                                    <option value="individual_pension">個人年金</option>
                                    <option value="child_allowance">手当</option>
                                    <option value="retirement">退職金</option>
                                    <option value="other">その他</option>
                                </select>
                            </td>
                            <td className="px-2 py-1">
                                <input type="number" className="w-full border-none bg-transparent p-0 text-right" aria-label="収入金額" name={`income-amount-${inc.id}`} autoComplete="off" value={inc.amount} onChange={(e) => updateData((d) => ({ ...d, incomes: d.incomes.map((i) => i.id === inc.id ? { ...i, amount: Number(e.target.value) } : i) }))} />
                            </td>
                            <td className="px-2 py-1">
                                <input type="number" className="w-full border-none bg-transparent p-0 text-right" aria-label="収入開始年齢" name={`income-start-age-${inc.id}`} autoComplete="off" value={inc.startAge} onChange={(e) => updateData((d) => ({ ...d, incomes: d.incomes.map((i) => i.id === inc.id ? { ...i, startAge: Number(e.target.value) } : i) }))} />
                            </td>
                            <td className="px-2 py-1">
                                <input type="number" className="w-full border-none bg-transparent p-0 text-right" aria-label="収入終了年齢" name={`income-end-age-${inc.id}`} autoComplete="off" value={inc.endAge} onChange={(e) => updateData((d) => ({ ...d, incomes: d.incomes.map((i) => i.id === inc.id ? { ...i, endAge: Number(e.target.value) } : i) }))} />
                            </td>
                            <td className="px-2 py-1">
                                <input type="number" step="0.001" className="w-full border-none bg-transparent p-0 text-right" aria-label="収入年成長率" value={inc.annualGrowthRate ?? ''} onChange={(e) => updateData((d) => ({ ...d, incomes: d.incomes.map((i) => i.id === inc.id ? { ...i, annualGrowthRate: e.target.value === '' ? undefined : Number(e.target.value) } : i) }))} />
                            </td>
                            <td className="px-2 py-1">
                                <input type="number" className="w-full border-none bg-transparent p-0 text-right" aria-label="収入ピーク金額" value={inc.peakAmount ?? ''} onChange={(e) => updateData((d) => ({ ...d, incomes: d.incomes.map((i) => i.id === inc.id ? { ...i, peakAmount: e.target.value === '' ? undefined : Number(e.target.value) } : i) }))} />
                            </td>
                            <td className="px-2 py-1">
                                <input type="number" className="w-full border-none bg-transparent p-0 text-right" aria-label="収入ピーク年齢" value={inc.peakAge ?? ''} onChange={(e) => updateData((d) => ({ ...d, incomes: d.incomes.map((i) => i.id === inc.id ? { ...i, peakAge: e.target.value === '' ? undefined : Number(e.target.value) } : i) }))} />
                            </td>
                            <td className="px-2 py-1">
                                <input type="number" step="0.001" min="0" max="1" className="w-full border-none bg-transparent p-0 text-right" aria-label="収入減衰率" value={inc.annualDecayRate ?? ''} onChange={(e) => updateData((d) => ({ ...d, incomes: d.incomes.map((i) => i.id === inc.id ? { ...i, annualDecayRate: e.target.value === '' ? undefined : Number(e.target.value) } : i) }))} />
                            </td>
                            <td className="px-2 py-1">
                                <button onClick={() => updateData((d) => ({ ...d, incomes: d.incomes.filter((i) => i.id !== inc.id) }))} aria-label="収入項目を削除" className="text-gray-300 hover:text-red-500">
                                    <Trash2 size={14} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ), [data.incomes, data.people, updateData]);

    const exportAiMarkdown = async () => {
        const lines: string[] = [];
        const now = new Date();
        const recurringDeficit = results.find(r => r.cashflow.recurringBalance < 0);
        const finalDeficit = results.find(r => r.cashflow.finalNet < 0);
        const assetDepletion = results.find(r => r.assets.total <= 0);
        const retirement60 = results.find(r => r.age >= 60);
        const retirement65 = results.find(r => r.age >= 65);
        const finalYear = results[results.length - 1];
        const minAsset = results.reduce((min, r) => Math.min(min, r.assets.total), Number.POSITIVE_INFINITY);
        const maxTax = results.reduce((max, r) => Math.max(max, r.expense.tax), 0);
        const maxSocialInsurance = results.reduce((max, r) => Math.max(max, r.expense.socialInsurance), 0);

        // 外部ファイルからプロンプトテンプレートを読み込む
        let promptTemplate = "";
        try {
            const response = await fetch('/ai_prompt_template.md');
            if (response.ok) {
                promptTemplate = await response.text();
            }
        } catch (error) {
            console.error('Failed to load prompt template:', error);
        }

        if (promptTemplate) {
            lines.push(promptTemplate.trim());
            lines.push('');
        } else {
            // フォールバック: 元のハードコードされた内容
            lines.push('# Life2Sim AI相談用データ');
            lines.push('');
            lines.push('## 推奨プロンプト');
            lines.push('');
            lines.push('以下のライフシミュレーション設定と結果を読み取り、家計・資産形成・住宅・教育費・働き方・老後資金の観点から分析してください。');
            lines.push('特に次の点を重視してください。');
            lines.push('');
            lines.push('1. 年ごとの赤字そのものは問題視しすぎず、資産合計が0円以下になるリスクを中心に見てください');
            lines.push('2. 何歳ごろに、どの要因で資産が大きく減りやすいかを特定してください');
            lines.push('3. 資産が0円以下にならないための改善案を、効果の大きい順に3〜5個提示してください');
            lines.push('4. 住宅予算、働き方、教育費、投資積立、老後支出のうち、どこを動かすのが最も効率的かを示してください');
            lines.push('5. 単年赤字よりも、累積資産の維持・老後の資産寿命の延長を重視してください');
            lines.push('6. 追加で確認すべき入力値や制度前提も挙げてください');
            lines.push('');
            lines.push('回答は、');
            lines.push('- まず資産が減る主要局面');
            lines.push('- 次に資産が尽きないための改善案を優先順位順');
            lines.push('- 最後に前提の不確実性');
            lines.push('の順で整理してください。');
            lines.push('');
            lines.push('## AIへの依頼');
            lines.push('');
            lines.push('以下はライフシミュレーションの設定値と結果です。');
            lines.push('年ごとの赤字は許容しつつ、資産合計が0円以下にならないことを重視したいです。');
            lines.push('家計・資産形成・住宅・働き方・老後資金の観点から、資産寿命を伸ばすための弱点、改善案、前提の見直しポイントを分析してください。');
            lines.push('特に、どの年齢帯で資産が削られやすいか、どの設定変更が最も効きやすいかを重視して評価してください。');
            lines.push('');
        }
        lines.push('## 出力日時');
        lines.push('');
        lines.push(`- ${now.toISOString()}`);
        lines.push('');
        lines.push('## サマリー');
        lines.push('');
        lines.push(`- シミュレーション期間: ${data.settings.startAge}歳〜${data.settings.endAge}歳`);
        lines.push(`- 結果年数: ${results.length}年`);
        lines.push(`- 最終資産合計: ${finalYear ? finalYear.assets.total.toFixed(1) : 'N/A'}万円`);
        lines.push(`- 最小資産合計: ${Number.isFinite(minAsset) ? minAsset.toFixed(1) : 'N/A'}万円`);
        lines.push(`- 経常収支が初めて赤字になる年齢: ${recurringDeficit ? `${recurringDeficit.age}歳 (${recurringDeficit.year}年)` : 'なし'}`);
        lines.push(`- 最終収支が初めて赤字になる年齢: ${finalDeficit ? `${finalDeficit.age}歳 (${finalDeficit.year}年)` : 'なし'}`);
        lines.push(`- 資産合計が0以下になる年齢: ${assetDepletion ? `${assetDepletion.age}歳 (${assetDepletion.year}年)` : 'なし'}`);
        lines.push(`- 60歳時点の資産合計: ${retirement60 ? `${retirement60.assets.total.toFixed(1)}万円` : 'N/A'}`);
        lines.push(`- 65歳時点の資産合計: ${retirement65 ? `${retirement65.assets.total.toFixed(1)}万円` : 'N/A'}`);
        lines.push(`- 年間税額の最大値: ${maxTax.toFixed(1)}万円`);
        lines.push(`- 年間社会保険料の最大値: ${maxSocialInsurance.toFixed(1)}万円`);
        lines.push('');
        lines.push('## 設定値(JSON)');
        lines.push('');
        lines.push('```json');
        lines.push(JSON.stringify(data, null, 2));
        lines.push('```');
        lines.push('');
        lines.push('## 年次結果サマリー(TSV)');
        lines.push('');
        lines.push('```tsv');
        lines.push([
            'year',
            'age',
            'income_total',
            'recurring_income',
            'recurring_expense',
            'recurring_balance',
            'one_time_net',
            'financing_in',
            'final_net',
            'tax',
            'social_insurance',
            'assets_total',
            'assets_short',
            'assets_medium',
            'assets_long'
        ].join('\t'));
        results.forEach((r) => {
            lines.push([
                r.year,
                r.age,
                r.income.total.toFixed(1),
                r.cashflow.recurringIncome.toFixed(1),
                r.cashflow.recurringExpense.toFixed(1),
                r.cashflow.recurringBalance.toFixed(1),
                r.cashflow.oneTimeNet.toFixed(1),
                r.cashflow.financingIn.toFixed(1),
                r.cashflow.finalNet.toFixed(1),
                r.expense.tax.toFixed(1),
                r.expense.socialInsurance.toFixed(1),
                r.assets.total.toFixed(1),
                r.assets.shortTerm.toFixed(1),
                r.assets.mediumTerm.toFixed(1),
                r.assets.longTerm.toFixed(1)
            ].join('\t'));
        });
        lines.push('```');
        lines.push('');
        lines.push('## 注目年の詳細(JSON)');
        lines.push('');
        lines.push('```json');
        lines.push(JSON.stringify({
            recurringDeficit,
            finalDeficit,
            assetDepletion,
            retirement60,
            retirement65,
            finalYear
        }, null, 2));
        lines.push('```');

        const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `life-plan-ai-review-${new Date().toISOString().split('T')[0]}.md`;
        a.click();
    };

    const ioSection = (
        <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60 ring-1 ring-indigo-50/80">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">データ入出力</h3>
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                aria-label="JSONファイルのドロップ領域"
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDragging
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                    }`}
            >
                <FileJson className="mx-auto h-8 w-8 text-slate-400 mb-2" aria-hidden="true" />
                <p className="text-xs text-slate-600 mb-3">最初に設定JSONを読み込んでから編集を開始できます</p>
                <p className="text-[11px] text-slate-500 mb-4">JSONファイルをドラッグ&ドロップ、または下のボタンで選択</p>
                <input
                    ref={fileInputRef}
                    id="config-upload-input"
                    type="file"
                    name="config-upload"
                    autoComplete="off"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="JSONファイルを選択"
                    className="px-4 py-2 bg-slate-900 text-white text-xs rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                >
                    <Upload size={14} aria-hidden="true" />
                    ファイル選択
                </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <button onClick={exportJSON} className="flex items-center justify-center gap-2 p-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors">
                    <Download size={16} /> JSONで保存
                </button>
                <button onClick={exportText} className="flex items-center justify-center gap-2 p-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors">
                    <Download size={16} /> TXTで書き出し
                </button>
                <button onClick={exportAiMarkdown} className="flex items-center justify-center gap-2 p-2 border border-indigo-300 text-indigo-700 rounded hover:bg-indigo-50 transition-colors md:col-span-2">
                    <Download size={16} /> AI相談用 Markdown を出力
                </button>
            </div>
            {importStatus && (
                <div
                    role={importStatus.type === 'error' ? 'alert' : 'status'}
                    aria-live="polite"
                    className={`mt-4 p-3 rounded text-xs flex items-center gap-2 ${importStatus.type === 'success'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                        }`}
                >
                    {importStatus.type === 'success'
                        ? <CheckCircle size={14} aria-hidden="true" />
                        : <AlertCircle size={14} aria-hidden="true" />
                    }
                    {importStatus.message}
                </div>
            )}
        </section>
    );

    if (!isOpen && !isSidebar) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 p-4 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-colors transition-transform flex items-center gap-3 z-50 hover:translate-y-[-2px] active:translate-y-[0px]"
            >
                <Save size={20} className="text-indigo-400" />
                <span className="font-bold text-sm tracking-tight text-white/90">データをいじる・保存・読込</span>
            </button>
        );
    }

    const editorContent = (
        <div
            className={`${isSidebar ? 'w-full h-full min-h-0' : 'w-full max-w-2xl h-full shadow-2xl'} data-editor bg-slate-50 flex flex-col font-sans`}
            onBlurCapture={handleEditorBlurCapture}
            onKeyDownCapture={handleEditorKeyDownCapture}
        >
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
                    <button aria-label="閉じる" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg transition-colors">
                        <ChevronUp size={24} />
                    </button>
                )}
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 space-y-8 pb-10">
                {ioSection}

                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-display font-bold text-slate-800">家族構成</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Family Members</p>
                        </div>
                        <button
                            onClick={() => updateData(d => {
                                const newId = `p${Date.now()}`;
                                return {
                                    ...d,
                                    people: [...d.people, {
                                        id: newId,
                                        name: '新規メンバー',
                                        birthYear: 2000,
                                        sex: 'male' as const,
                                        relation: 'child' as const
                                    }],
                                    educationPlans: [
                                        ...d.educationPlans,
                                        { childId: newId, templateName: 'default', totalAmountOverride: 0, stages: cloneDefaultEducationStages() }
                                    ]
                                };
                            })}
                            className="text-xs bg-pink-100 text-pink-700 px-3 py-1 rounded hover:bg-pink-200"
                        >
                            + 追加
                        </button>
                    </div>
                    <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                        <table className="w-full min-w-max text-sm whitespace-nowrap">
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
                                                className="w-full border-none p-0 bg-transparent"
                                                aria-label="家族メンバー名"
                                                name={`person-name-${person.id}`}
                                                autoComplete="name"
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
                                                className="w-full border-none p-0 bg-transparent"
                                                aria-label="家族メンバーの生年"
                                                name={`person-birth-year-${person.id}`}
                                                autoComplete="bday-year"
                                                value={person.birthYear}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    people: d.people.map(p => p.id === person.id ? { ...p, birthYear: Number(e.target.value) } : p)
                                                }))}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <select
                                                className="w-full border-none p-0 bg-transparent text-xs"
                                                aria-label="家族メンバーの続柄"
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
                                                    aria-label="家族メンバーを削除"
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
                                    endAge: 65
                                }]
                            }))}
                            className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200"
                        >
                            + 追加
                        </button>
                    </div>
                    <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                        {renderIncomeTable()}
                    </div>
                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsIncomeEditorExpanded(true)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                        >
                            <Maximize2 size={14} aria-hidden="true" />
                            広く編集
                        </button>
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
                    <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                        <table className="w-full min-w-max text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-3 py-2 text-left">名称</th>
                                    <th className="px-3 py-2 text-left">運用タイプ</th>
                                    <th className="px-3 py-2 text-left">期間区分</th>
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
                                                className="w-full border-none p-0 bg-transparent font-medium"
                                                aria-label="資産名称"
                                                name={`asset-name-${asset.id}`}
                                                autoComplete="off"
                                                value={asset.name}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    assets: d.assets.map(a => a.id === asset.id ? { ...a, name: e.target.value } : a)
                                                }))}
                                            />
                                        </td>
                                        <td className="px-3 py-2">
                                            <select
                                                className="w-full border-none p-0 bg-transparent text-xs"
                                                aria-label="資産運用タイプ"
                                                value={asset.type}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    assets: d.assets.map(a => a.id === asset.id ? { ...a, type: e.target.value as any } : a)
                                                }))}
                                            >
                                                <option value="cash">現金</option>
                                                <option value="investment">投資</option>
                                                <option value="dc">DC/iDeCo</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <select
                                                className="w-full border-none p-0 bg-transparent text-xs"
                                                aria-label="資産期間区分"
                                                value={asset.term}
                                                onChange={(e) => updateData(d => ({
                                                    ...d,
                                                    assets: d.assets.map(a => a.id === asset.id ? { ...a, term: e.target.value as any } : a)
                                                }))}
                                            >
                                                <option value="short">短期</option>
                                                <option value="medium">中期</option>
                                                <option value="long">長期</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                className="w-full border-none p-0 bg-transparent text-right"
                                                aria-label="資産現在額"
                                                name={`asset-initial-amount-${asset.id}`}
                                                autoComplete="off"
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
                                                    className="w-12 border-none p-0 bg-transparent text-right"
                                                    aria-label="資産の年利率"
                                                    name={`asset-rate-${asset.id}`}
                                                    autoComplete="off"
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
                                                aria-label="資産項目を削除"
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
                                <label htmlFor="housing-purchase-age" className="text-xs text-gray-400 block mb-1">購入年齢</label>
                                <input
                                    id="housing-purchase-age"
                                    type="number"
                                    className="w-full text-sm border-gray-200 rounded"
                                    name="housing-purchase-age"
                                    autoComplete="off"
                                    value={data.housing.purchaseAge}
                                    onChange={(e) => updateData(d => ({
                                        ...d,
                                        housing: { ...d.housing, purchaseAge: Number(e.target.value) }
                                    }))}
                                />
                            </div>
                            <div>
                                <label htmlFor="housing-price" className="text-xs text-gray-400 block mb-1">購入価格(万円)</label>
                                <input
                                    id="housing-price"
                                    type="number"
                                    className="w-full text-sm border-gray-200 rounded"
                                    name="housing-price"
                                    autoComplete="off"
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
                                    <label htmlFor="housing-loan-amount" className="text-xs text-gray-400 block mb-1">借入金額(万円)</label>
                                    <input
                                        id="housing-loan-amount"
                                        type="number"
                                        className="w-full text-sm border-gray-200 rounded"
                                        name="housing-loan-amount"
                                        autoComplete="off"
                                        value={data.housing.loanAmount}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            housing: { ...d.housing, loanAmount: Number(e.target.value) }
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="housing-loan-term" className="text-xs text-gray-400 block mb-1">返済期間(年)</label>
                                    <input
                                        id="housing-loan-term"
                                        type="number"
                                        className="w-full text-sm border-gray-200 rounded"
                                        name="housing-loan-term"
                                        autoComplete="off"
                                        value={data.housing.loanTerm}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            housing: { ...d.housing, loanTerm: Number(e.target.value) }
                                        }))}
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 overflow-x-auto">
                                <div className="flex justify-between items-center mb-2 min-w-max gap-4">
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
                                <table className="w-full min-w-max text-xs whitespace-nowrap">
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
                                                        name={`housing-interest-years-${idx}`}
                                                        autoComplete="off"
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
                                                        name={`housing-interest-rate-${idx}`}
                                                        autoComplete="off"
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
                                                        aria-label="金利期間を削除"
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
                                    <label htmlFor="housing-danshin-type" className="text-xs text-gray-400 block mb-1">ローン保険(団信)の種類</label>
                                    <input
                                        id="housing-danshin-type"
                                        className="w-full text-sm border-gray-200 rounded"
                                        name="housing-danshin-type"
                                        autoComplete="off"
                                        value={data.housing.danshinType || ''}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            housing: { ...d.housing, danshinType: e.target.value }
                                        }))}
                                        placeholder="一般、ガン団信など"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="housing-danshin-rate" className="text-xs text-gray-400 block mb-1">保険による金利上乗せ(%)</label>
                                    <input
                                        id="housing-danshin-rate"
                                        type="number"
                                        step="0.01"
                                        className="w-full text-sm border-gray-200 rounded"
                                        name="housing-danshin-rate"
                                        autoComplete="off"
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
                                    <label htmlFor="housing-all-disease-type" className="text-xs text-gray-400 block mb-1">全疾病保障種類</label>
                                    <input
                                        id="housing-all-disease-type"
                                        className="w-full text-sm border-gray-200 rounded"
                                        name="housing-all-disease-type"
                                        autoComplete="off"
                                        value={data.housing.allDiseaseType || ''}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            housing: { ...d.housing, allDiseaseType: e.target.value }
                                        }))}
                                        placeholder="全疾病保障、生活習慣病など"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="housing-all-disease-rate" className="text-xs text-gray-400 block mb-1">病気保障の追加利率(%)</label>
                                    <input
                                        id="housing-all-disease-rate"
                                        type="number"
                                        step="0.01"
                                        className="w-full text-sm border-gray-200 rounded"
                                        name="housing-all-disease-rate"
                                        autoComplete="off"
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
                                <label htmlFor="housing-down-payment" className="text-xs text-gray-400 block mb-1">頭金(万円)</label>
                                <input
                                    id="housing-down-payment"
                                    type="number"
                                    className="w-full text-sm border-gray-200 rounded"
                                    name="housing-down-payment"
                                    autoComplete="off"
                                    value={data.housing.downPayment}
                                    onChange={(e) => updateData(d => ({
                                        ...d,
                                        housing: { ...d.housing, downPayment: Number(e.target.value) }
                                    }))}
                                />
                            </div>
                            <div>
                                <label htmlFor="housing-rental-cost" className="text-xs text-gray-400 block mb-1">購入前家賃(月/万)</label>
                                <input
                                    id="housing-rental-cost"
                                    type="number"
                                    step="0.1"
                                    className="w-full text-sm border-gray-200 rounded"
                                    name="housing-rental-cost"
                                    autoComplete="off"
                                    value={data.housing.rentalCost}
                                    onChange={(e) => updateData(d => ({
                                        ...d,
                                        housing: { ...d.housing, rentalCost: Number(e.target.value) }
                                    }))}
                                />
                            </div>
                            <div>
                                <label htmlFor="housing-maintenance-cost" className="text-xs text-gray-400 block mb-1">年間維持費(万)</label>
                                <input
                                    id="housing-maintenance-cost"
                                    type="number"
                                    className="w-full text-sm border-gray-200 rounded"
                                    name="housing-maintenance-cost"
                                    autoComplete="off"
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
                                                <label htmlFor={`living-step-start-${step.id}`} className="text-[10px] text-gray-400 uppercase">開始年齢</label>
                                                <input
                                                    id={`living-step-start-${step.id}`}
                                                    type="number"
                                                    className="w-full text-sm border-gray-200 rounded"
                                                    name={`living-step-start-${step.id}`}
                                                    autoComplete="off"
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
                                            aria-label="生活費ステップを削除"
                                            className="text-gray-300 hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div>
                                            <label htmlFor={`living-step-food-${step.id}`} className="text-[10px] text-gray-400">食費</label>
                                            <input id={`living-step-food-${step.id}`} name={`living-step-food-${step.id}`} autoComplete="off" type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.food || 0} onChange={(e) => updateBreakdown('food', Number(e.target.value))} />
                                        </div>
                                        <div>
                                            <label htmlFor={`living-step-communication-${step.id}`} className="text-[10px] text-gray-400">通信費</label>
                                            <input id={`living-step-communication-${step.id}`} name={`living-step-communication-${step.id}`} autoComplete="off" type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.communication || 0} onChange={(e) => updateBreakdown('communication', Number(e.target.value))} />
                                        </div>
                                        <div>
                                            <label htmlFor={`living-step-daily-goods-${step.id}`} className="text-[10px] text-gray-400">日用品</label>
                                            <input id={`living-step-daily-goods-${step.id}`} name={`living-step-daily-goods-${step.id}`} autoComplete="off" type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.dailyGoods || 0} onChange={(e) => updateBreakdown('dailyGoods', Number(e.target.value))} />
                                        </div>
                                        <div>
                                            <label htmlFor={`living-step-utilities-${step.id}`} className="text-[10px] text-gray-400">水道光熱費</label>
                                            <input id={`living-step-utilities-${step.id}`} name={`living-step-utilities-${step.id}`} autoComplete="off" type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.utilities || 0} onChange={(e) => updateBreakdown('utilities', Number(e.target.value))} />
                                        </div>
                                        <div>
                                            <label htmlFor={`living-step-hobby-${step.id}`} className="text-[10px] text-gray-400">趣味・娯楽</label>
                                            <input id={`living-step-hobby-${step.id}`} name={`living-step-hobby-${step.id}`} autoComplete="off" type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.hobby || 0} onChange={(e) => updateBreakdown('hobby', Number(e.target.value))} />
                                        </div>
                                        <div>
                                            <label htmlFor={`living-step-other-${step.id}`} className="text-[10px] text-gray-400">その他</label>
                                            <input id={`living-step-other-${step.id}`} name={`living-step-other-${step.id}`} autoComplete="off" type="number" step="0.1" className="w-full text-xs border-gray-200 rounded p-1" value={step.breakdown?.other || 0} onChange={(e) => updateBreakdown('other', Number(e.target.value))} />
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
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-display font-bold text-slate-800">たまの出費（旅行・車など）</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Life Events & Large Expenses</p>
                        </div>
                        <button
                            onClick={() => updateData(d => ({
                                ...d,
                                events: [...d.events, {
                                    id: `e${Date.now()}`,
                                    name: '新規イベント',
                                    category: 'irregular' as const,
                                    amount: 0,
                                    type: 'one_time' as const,
                                    startAge: 40,
                                    rateCategory: 'none' as const
                                }]
                            }))}
                            className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded hover:bg-amber-200"
                        >
                            + 追加
                        </button>
                    </div>
                    <div className="space-y-2">
                        {data.events.map((event) => (
                            <div key={event.id} className="bg-white p-3 rounded-lg border shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <input
                                        className="font-medium text-gray-800 border-none p-0 flex-1"
                                        aria-label="イベント名"
                                        name={`event-name-${event.id}`}
                                        autoComplete="off"
                                        value={event.name}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            events: d.events.map(ev => ev.id === event.id ? { ...ev, name: e.target.value } : ev)
                                        }))}
                                    />
                                    <button
                                        onClick={() => updateData(d => ({ ...d, events: d.events.filter(ev => ev.id !== event.id) }))}
                                        aria-label="イベントを削除"
                                        className="text-gray-300 hover:text-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
                                    <div>
                                        <label htmlFor={`event-category-${event.id}`} className="text-xs text-gray-400">カテゴリ</label>
                                        <select
                                            id={`event-category-${event.id}`}
                                            className="w-full border-gray-200 rounded mt-1 text-xs"
                                            value={event.category}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                events: d.events.map(ev => ev.id === event.id ? { ...ev, category: e.target.value as any } : ev)
                                            }))}
                                        >
                                            <option value="future_plan">将来プラン</option>
                                            <option value="irregular">不定期支出</option>
                                            <option value="education_fund">学資・満期金</option>
                                            <option value="surrender_value">解約返戻金</option>
                                            <option value="other">その他</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor={`event-amount-${event.id}`} className="text-xs text-gray-400">金額(万円)</label>
                                        <input
                                            id={`event-amount-${event.id}`}
                                            type="number"
                                            className="w-full border-gray-200 rounded mt-1"
                                            name={`event-amount-${event.id}`}
                                            autoComplete="off"
                                            value={event.amount}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                events: d.events.map(ev => ev.id === event.id ? { ...ev, amount: Number(e.target.value) } : ev)
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`event-start-age-${event.id}`} className="text-xs text-gray-400">開始年齢</label>
                                        <input
                                            id={`event-start-age-${event.id}`}
                                            type="number"
                                            className="w-full border-gray-200 rounded mt-1"
                                            name={`event-start-age-${event.id}`}
                                            autoComplete="off"
                                            value={event.startAge}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                events: d.events.map(ev => ev.id === event.id ? { ...ev, startAge: Number(e.target.value) } : ev)
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`event-end-age-${event.id}`} className="text-xs text-gray-400">終了年齢</label>
                                        <input
                                            id={`event-end-age-${event.id}`}
                                            type="number"
                                            className="w-full border-gray-200 rounded mt-1"
                                            name={`event-end-age-${event.id}`}
                                            autoComplete="off"
                                            value={event.endAge ?? ''}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                events: d.events.map(ev => ev.id === event.id ? {
                                                    ...ev,
                                                    endAge: e.target.value === '' ? undefined : Number(e.target.value)
                                                } : ev)
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`event-type-${event.id}`} className="text-xs text-gray-400">タイプ</label>
                                        <select
                                            id={`event-type-${event.id}`}
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
                                    <div>
                                        <label htmlFor={`event-rate-category-${event.id}`} className="text-xs text-gray-400">増減率カテゴリ</label>
                                        <select
                                            id={`event-rate-category-${event.id}`}
                                            className="w-full border-gray-200 rounded mt-1 text-xs"
                                            value={event.rateCategory}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                events: d.events.map(ev => ev.id === event.id ? { ...ev, rateCategory: e.target.value as any } : ev)
                                            }))}
                                        >
                                            <option value="none">固定(変動なし)</option>
                                            <option value="other">その他支出率</option>
                                            <option value="inflation">インフレ率</option>
                                            <option value="living">生活費率</option>
                                            <option value="fixed">固定費率</option>
                                            <option value="education">教育費率</option>
                                        </select>
                                    </div>
                                    {event.type === 'periodic' && (
                                        <div>
                                            <label htmlFor={`event-interval-${event.id}`} className="text-xs text-gray-400">間隔(年)</label>
                                            <input
                                                id={`event-interval-${event.id}`}
                                                type="number"
                                                className="w-full border-gray-200 rounded mt-1"
                                                name={`event-interval-${event.id}`}
                                                autoComplete="off"
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
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-display font-bold text-slate-800">積立設定</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Regular Savings & Contributions</p>
                        </div>
                        <button
                            onClick={() => updateData(d => ({
                                ...d,
                                contributions: [...d.contributions, {
                                    id: `c${Date.now()}`,
                                    name: '新規積立',
                                    assetId: d.assets[0]?.id || 'a1',
                                    amount: 0,
                                    frequency: 'monthly' as const,
                                    startAge: 35,
                                    endAge: 60
                                }]
                            }))}
                            className="text-xs bg-teal-100 text-teal-700 px-3 py-1 rounded hover:bg-teal-200"
                        >
                            + 追加
                        </button>
                    </div>
                    <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                        <table className="w-full min-w-max text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-3 py-2 text-left">名称</th>
                                    <th className="px-3 py-2 text-left">対象資産</th>
                                    <th className="px-3 py-2 text-right">金額(万円)</th>
                                    <th className="px-3 py-2 text-left">頻度</th>
                                    <th className="px-3 py-2 text-right">開始年齢</th>
                                    <th className="px-3 py-2 text-right">終了年齢</th>
                                    <th className="px-3 py-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.contributions.map((contrib) => (
                                    <tr key={contrib.id} className="hover:bg-gray-50">
                                        <td className="px-3 py-2">
                                            <input className="w-full border-none bg-transparent p-0 font-medium text-gray-800" aria-label="積立設定名" name={`contrib-name-${contrib.id}`} autoComplete="off" value={contrib.name} onChange={(e) => updateData((d) => ({ ...d, contributions: d.contributions.map((c) => c.id === contrib.id ? { ...c, name: e.target.value } : c) }))} />
                                        </td>
                                        <td className="px-3 py-2">
                                            <select className="w-full border-none bg-transparent p-0 text-xs" id={`contrib-asset-${contrib.id}`} value={contrib.assetId} onChange={(e) => updateData((d) => ({ ...d, contributions: d.contributions.map((c) => c.id === contrib.id ? { ...c, assetId: e.target.value } : c) }))}>
                                                {data.assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input id={`contrib-amount-${contrib.id}`} type="number" step="0.1" className="w-full border-none bg-transparent p-0 text-right" name={`contrib-amount-${contrib.id}`} autoComplete="off" value={contrib.amount} onChange={(e) => updateData((d) => ({ ...d, contributions: d.contributions.map((c) => c.id === contrib.id ? { ...c, amount: Number(e.target.value) } : c) }))} />
                                        </td>
                                        <td className="px-3 py-2">
                                            <select id={`contrib-frequency-${contrib.id}`} className="w-full border-none bg-transparent p-0 text-xs" value={contrib.frequency} onChange={(e) => updateData((d) => ({ ...d, contributions: d.contributions.map((c) => c.id === contrib.id ? { ...c, frequency: e.target.value as 'monthly' | 'yearly' } : c) }))}>
                                                <option value="monthly">毎月</option>
                                                <option value="yearly">毎年</option>
                                            </select>
                                        </td>
                                        <td className="px-3 py-2">
                                            <input id={`contrib-start-age-${contrib.id}`} type="number" className="w-full border-none bg-transparent p-0 text-right" name={`contrib-start-age-${contrib.id}`} autoComplete="off" value={contrib.startAge} onChange={(e) => updateData((d) => ({ ...d, contributions: d.contributions.map((c) => c.id === contrib.id ? { ...c, startAge: Number(e.target.value) } : c) }))} />
                                        </td>
                                        <td className="px-3 py-2">
                                            <input id={`contrib-end-age-${contrib.id}`} type="number" className="w-full border-none bg-transparent p-0 text-right" name={`contrib-end-age-${contrib.id}`} autoComplete="off" value={contrib.endAge} onChange={(e) => updateData((d) => ({ ...d, contributions: d.contributions.map((c) => c.id === contrib.id ? { ...c, endAge: Number(e.target.value) } : c) }))} />
                                        </td>
                                        <td className="px-3 py-2">
                                            <button onClick={() => updateData((d) => ({ ...d, contributions: d.contributions.filter((c) => c.id !== contrib.id) }))} aria-label="積立設定を削除" className="text-gray-300 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Education Plans Section */}
                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex flex-col mb-6">
                        <h3 className="text-lg font-display font-bold text-slate-800">教育費設定</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Education Planning</p>
                        <p className="mt-2 text-[11px] text-gray-400">子どもごとに広く編集を開くと、横長テーブルを広い画面で編集できます。高校の私立初期値は、現行の就学支援金制度を踏まえて `私立(支援考慮)` と `私立(満額負担寄り)` を分けています。</p>
                    </div>
                    <div className="space-y-4">
                        {data.educationPlans.map((plan) => {
                            const child = data.people.find(p => p.id === plan.childId);
                            const stages = plan.stages && plan.stages.length > 0 ? plan.stages : cloneDefaultEducationStages();
                            const detailedTotal = stages.reduce((sum, stage) => sum + (stage.totalAmount || 0), 0);
                            return (
                                <div key={plan.childId} className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs text-gray-400">対象の子</label>
                                            <p className="font-medium text-gray-800">{child?.name || '不明'}</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="text-right">
                                                <p className="text-[11px] text-gray-400">教育費合計</p>
                                                <p className="text-lg font-semibold text-gray-800">{detailedTotal.toLocaleString()} 万円</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setExpandedEducationPlanChildId(plan.childId)}
                                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                                            >
                                                <Maximize2 size={14} aria-hidden="true" />
                                                広く編集
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {renderEducationStageTable(plan.childId, stages)}
                                        <div className="flex items-center justify-between gap-4">
                                            <p className="text-[11px] text-gray-400">各区分の累計額を、その年齢レンジに均等配分して年次教育費へ反映します。種別を変更した時、または累計額を空欄で抜けた時は参考値を自動入力します。結婚援助額はここには含めません。</p>
                                            <div className="text-right">
                                                <p className="text-[11px] text-gray-400">教育費合計</p>
                                                <p className="text-sm font-semibold text-gray-800">{detailedTotal.toLocaleString()} 万円</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {expandedEducationPlanChildId && (() => {
                    const expandedPlan = data.educationPlans.find((plan) => plan.childId === expandedEducationPlanChildId);
                    if (!expandedPlan) return null;
                    const expandedChild = data.people.find((person) => person.id === expandedPlan.childId);
                    const expandedStages = expandedPlan.stages && expandedPlan.stages.length > 0 ? expandedPlan.stages : cloneDefaultEducationStages();
                    const expandedTotal = expandedStages.reduce((sum, stage) => sum + (stage.totalAmount || 0), 0);

                    return (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="education-expanded-editor-title"
                            onClick={() => setExpandedEducationPlanChildId(null)}
                        >
                            <div
                                className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expanded Editor</p>
                                        <h4 id="education-expanded-editor-title" className="text-lg font-display font-bold text-slate-800">
                                            教育費設定: {expandedChild?.name || '子ども'}
                                        </h4>
                                        <p className="mt-1 text-sm text-slate-500">横スクロールせずに、年齢・種別・累計額をまとめて編集できます。</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setExpandedEducationPlanChildId(null)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                                    >
                                        <X size={16} aria-hidden="true" />
                                        閉じる
                                    </button>
                                </div>
                                <div className="overflow-y-auto px-6 py-5">
                                    <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-700">教育費合計</p>
                                            <p className="text-[11px] text-slate-500">種別変更時、または累計額を空欄で抜けた時は参考値を自動入力します。</p>
                                        </div>
                                        <p className="text-xl font-semibold text-slate-800">{expandedTotal.toLocaleString()} 万円</p>
                                    </div>
                                    {renderEducationStageTable(expandedPlan.childId, expandedStages, true)}
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {isIncomeEditorExpanded && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="income-expanded-editor-title"
                        onClick={() => setIsIncomeEditorExpanded(false)}
                    >
                        <div
                            className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expanded Editor</p>
                                    <h4 id="income-expanded-editor-title" className="text-lg font-display font-bold text-slate-800">収入の予定</h4>
                                    <p className="mt-1 text-sm text-slate-500">対象者、金額、期間、成長率、ピーク条件を横スクロールせずにまとめて編集できます。</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsIncomeEditorExpanded(false)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
                                >
                                    <X size={16} aria-hidden="true" />
                                    閉じる
                                </button>
                            </div>
                            <div className="overflow-y-auto px-6 py-5">
                                {renderIncomeTable(true)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Personal Fixed Costs Section */}
                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-lg font-display font-bold text-slate-800">固定費（個人・家族共通）</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fixed Costs (Personal / Family)</p>
                        </div>
                        <button
                            onClick={() => updateData(d => ({
                                ...d,
                                personalFixedCosts: [...d.personalFixedCosts, {
                                    id: `pf${Date.now()}`,
                                    target: 'person' as const,
                                    personId: d.people[0]?.id || 'p1',
                                    name: '新規固定費',
                                    amount: 0,
                                    startAge: 35,
                                    endAge: 65
                                }]
                            }))}
                            className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200"
                        >
                            + 追加
                        </button>
                    </div>
                    <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
                        <table className="w-full min-w-max text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-3 py-2 text-left">名称</th>
                                    <th className="px-3 py-2 text-left">対象</th>
                                    <th className="px-3 py-2 text-left">対象者</th>
                                    <th className="px-3 py-2 text-right">月額(万円)</th>
                                    <th className="px-3 py-2 text-right">開始年齢</th>
                                    <th className="px-3 py-2 text-right">終了年齢</th>
                                    <th className="px-3 py-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.personalFixedCosts.map((cost) => {
                                    const target = cost.target || 'person';
                                    return (
                                        <tr key={cost.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                                <input className="w-full border-none bg-transparent p-0 font-medium text-gray-800" aria-label="個人固定費名" name={`personal-cost-name-${cost.id}`} autoComplete="off" value={cost.name} onChange={(e) => updateData((d) => ({ ...d, personalFixedCosts: d.personalFixedCosts.map((c) => c.id === cost.id ? { ...c, name: e.target.value } : c) }))} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <select id={`personal-cost-target-${cost.id}`} className="w-full border-none bg-transparent p-0 text-xs" value={target} onChange={(e) => updateData((d) => ({ ...d, personalFixedCosts: d.personalFixedCosts.map((c) => c.id === cost.id ? { ...c, target: e.target.value as 'person' | 'family', personId: e.target.value === 'family' ? c.personId : (c.personId || d.people[0]?.id || 'p1') } : c) }))}>
                                                    <option value="person">個人</option>
                                                    <option value="family">家族共通</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <select id={`personal-cost-person-${cost.id}`} className="w-full border-none bg-transparent p-0 text-xs" value={cost.personId || ''} disabled={target === 'family'} onChange={(e) => updateData((d) => ({ ...d, personalFixedCosts: d.personalFixedCosts.map((c) => c.id === cost.id ? { ...c, personId: e.target.value } : c) }))}>
                                                    {data.people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input id={`personal-cost-amount-${cost.id}`} type="number" step="0.1" className="w-full border-none bg-transparent p-0 text-right" name={`personal-cost-amount-${cost.id}`} autoComplete="off" value={cost.amount} onChange={(e) => updateData((d) => ({ ...d, personalFixedCosts: d.personalFixedCosts.map((c) => c.id === cost.id ? { ...c, amount: Number(e.target.value) } : c) }))} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input id={`personal-cost-start-age-${cost.id}`} type="number" className="w-full border-none bg-transparent p-0 text-right" name={`personal-cost-start-age-${cost.id}`} autoComplete="off" value={cost.startAge || 0} onChange={(e) => updateData((d) => ({ ...d, personalFixedCosts: d.personalFixedCosts.map((c) => c.id === cost.id ? { ...c, startAge: Number(e.target.value) } : c) }))} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input id={`personal-cost-end-age-${cost.id}`} type="number" className="w-full border-none bg-transparent p-0 text-right" name={`personal-cost-end-age-${cost.id}`} autoComplete="off" value={cost.endAge || 99} onChange={(e) => updateData((d) => ({ ...d, personalFixedCosts: d.personalFixedCosts.map((c) => c.id === cost.id ? { ...c, endAge: Number(e.target.value) } : c) }))} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <button onClick={() => updateData((d) => ({ ...d, personalFixedCosts: d.personalFixedCosts.filter((c) => c.id !== cost.id) }))} aria-label="個人固定費を削除" className="text-gray-300 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Simulation Settings Section */}
                <section className="bg-white p-6 rounded-2xl premium-shadow border border-slate-200/60">
                    <div className="flex flex-col mb-6">
                        <h3 className="text-lg font-display font-bold text-slate-800">シミュレーション設定</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Core Simulation Settings</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="settings-base-year" className="text-xs text-gray-400 block mb-1">基準年</label>
                                <input
                                    id="settings-base-year"
                                    type="number"
                                    className="w-full text-sm border-gray-200 rounded"
                                    name="settings-base-year"
                                    autoComplete="off"
                                    value={data.settings.baseYear}
                                    onChange={(e) => updateData(d => ({
                                        ...d,
                                        settings: { ...d.settings, baseYear: Number(e.target.value) }
                                    }))}
                                />
                            </div>
                            <div>
                                <label htmlFor="settings-start-age" className="text-xs text-gray-400 block mb-1">開始年齢</label>
                                <input
                                    id="settings-start-age"
                                    type="number"
                                    className="w-full text-sm border-gray-200 rounded"
                                    name="settings-start-age"
                                    autoComplete="off"
                                    value={data.settings.startAge}
                                    onChange={(e) => updateData(d => ({
                                        ...d,
                                        settings: { ...d.settings, startAge: Number(e.target.value) }
                                    }))}
                                />
                            </div>
                            <div>
                                <label htmlFor="settings-end-age" className="text-xs text-gray-400 block mb-1">終了年齢</label>
                                <input
                                    id="settings-end-age"
                                    type="number"
                                    className="w-full text-sm border-gray-200 rounded"
                                    name="settings-end-age"
                                    autoComplete="off"
                                    value={data.settings.endAge}
                                    onChange={(e) => updateData(d => ({
                                        ...d,
                                        settings: { ...d.settings, endAge: Number(e.target.value) }
                                    }))}
                                />
                            </div>
                            <div>
                                <label htmlFor="settings-transfer-age-investment" className="text-xs text-gray-400 block mb-1">投資移管年齢</label>
                                <input
                                    id="settings-transfer-age-investment"
                                    type="number"
                                    className="w-full text-sm border-gray-200 rounded"
                                    name="settings-transfer-age-investment"
                                    autoComplete="off"
                                    value={data.settings.assetTransferAges?.investment ?? 65}
                                    onChange={(e) => updateData(d => ({
                                        ...d,
                                        settings: {
                                            ...d.settings,
                                            assetTransferAges: {
                                                ...(d.settings.assetTransferAges || {}),
                                                investment: Number(e.target.value)
                                            }
                                        }
                                    }))}
                                />
                            </div>
                            <div>
                                <label htmlFor="settings-transfer-age-dc" className="text-xs text-gray-400 block mb-1">DC移管年齢</label>
                                <input
                                    id="settings-transfer-age-dc"
                                    type="number"
                                    className="w-full text-sm border-gray-200 rounded"
                                    name="settings-transfer-age-dc"
                                    autoComplete="off"
                                    value={data.settings.assetTransferAges?.dc ?? 65}
                                    onChange={(e) => updateData(d => ({
                                        ...d,
                                        settings: {
                                            ...d.settings,
                                            assetTransferAges: {
                                                ...(d.settings.assetTransferAges || {}),
                                                dc: Number(e.target.value)
                                            }
                                        }
                                    }))}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-2">インフレ率設定</label>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label htmlFor="settings-rate-living" className="text-xs text-gray-500">生活費(%)</label>
                                    <input
                                        id="settings-rate-living"
                                        type="number"
                                        step="0.1"
                                        className="w-full text-sm border-gray-200 rounded mt-1"
                                        name="settings-rate-living"
                                        autoComplete="off"
                                        value={data.settings.rates.living}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            settings: { ...d.settings, rates: { ...d.settings.rates, living: Number(e.target.value) } }
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="settings-rate-education" className="text-xs text-gray-500">教育費(%)</label>
                                    <input
                                        id="settings-rate-education"
                                        type="number"
                                        step="0.1"
                                        className="w-full text-sm border-gray-200 rounded mt-1"
                                        name="settings-rate-education"
                                        autoComplete="off"
                                        value={data.settings.rates.education}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            settings: { ...d.settings, rates: { ...d.settings.rates, education: Number(e.target.value) } }
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="settings-rate-other" className="text-xs text-gray-500">その他(%)</label>
                                    <input
                                        id="settings-rate-other"
                                        type="number"
                                        step="0.1"
                                        className="w-full text-sm border-gray-200 rounded mt-1"
                                        name="settings-rate-other"
                                        autoComplete="off"
                                        value={data.settings.rates.other}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            settings: { ...d.settings, rates: { ...d.settings.rates, other: Number(e.target.value) } }
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-2">Glip互換</label>
                            <div className="space-y-2">
                                <label htmlFor="settings-glip-include-transfer-income" className="flex items-center gap-2 text-xs text-gray-600">
                                    <input
                                        id="settings-glip-include-transfer-income"
                                        type="checkbox"
                                        name="settings-glip-include-transfer-income"
                                        checked={data.settings.glipCompatibility?.includeTransfersInIncomeTotal === true}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            settings: {
                                                ...d.settings,
                                                glipCompatibility: {
                                                    ...(d.settings.glipCompatibility || {}),
                                                    includeTransfersInIncomeTotal: e.target.checked
                                                }
                                            }
                                        }))}
                                    />
                                    移管額を収入計に含める
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-2">老後の取り崩し設定</label>
                            <div className="grid grid-cols-2 gap-3">
                                <label htmlFor="settings-retirement-withdrawal-enabled" className="flex items-center gap-2 text-xs text-gray-600">
                                    <input
                                        id="settings-retirement-withdrawal-enabled"
                                        type="checkbox"
                                        name="settings-retirement-withdrawal-enabled"
                                        checked={data.settings.retirementWithdrawalStrategy?.enabled === true}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            settings: {
                                                ...d.settings,
                                                retirementWithdrawalStrategy: {
                                                    ...(d.settings.retirementWithdrawalStrategy || {}),
                                                    enabled: e.target.checked,
                                                    startAge: d.settings.retirementWithdrawalStrategy?.startAge ?? 65
                                                }
                                            }
                                        }))}
                                    />
                                    現金不足分を投資信託から補う
                                </label>
                                <div>
                                    <label htmlFor="settings-retirement-withdrawal-start-age" className="text-xs text-gray-500">開始年齢</label>
                                    <input
                                        id="settings-retirement-withdrawal-start-age"
                                        type="number"
                                        className="w-full text-sm border-gray-200 rounded mt-1"
                                        name="settings-retirement-withdrawal-start-age"
                                        value={data.settings.retirementWithdrawalStrategy?.startAge ?? 65}
                                        onChange={(e) => updateData(d => ({
                                            ...d,
                                            settings: {
                                                ...d.settings,
                                                retirementWithdrawalStrategy: {
                                                    ...(d.settings.retirementWithdrawalStrategy || {}),
                                                    enabled: d.settings.retirementWithdrawalStrategy?.enabled === true,
                                                    startAge: Number(e.target.value)
                                                }
                                            }
                                        }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-2">制度ルール設定</label>
                            <div className="space-y-3">
                                <p className="text-xs text-gray-600">税・社保・年金の制度ルールは常時適用されます。</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label htmlFor="settings-policy-region" className="text-xs text-gray-500">健康保険料率地域</label>
                                        <select
                                            id="settings-policy-region"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-region"
                                            value={data.settings.policy?.healthInsuranceRegion || 'tokyo'}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        healthInsuranceRegion: e.target.value
                                                    }
                                                }
                                            }))}
                                        >
                                            {HEALTH_INSURANCE_REGION_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-employment-business" className="text-xs text-gray-500">雇用保険の事業区分</label>
                                        <select
                                            id="settings-policy-employment-business"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-employment-business"
                                            value={data.settings.policy?.employmentInsuranceBusinessType || 'general'}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        employmentInsuranceBusinessType: e.target.value as 'general' | 'agriculture_forestry_fisheries_sake' | 'construction'
                                                    }
                                                }
                                            }))}
                                        >
                                            <option value="general">一般の事業</option>
                                            <option value="agriculture_forestry_fisheries_sake">農林水産・清酒製造</option>
                                            <option value="construction">建設の事業</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-resident-capita" className="text-xs text-gray-500">住民税均等割(年額, 円)</label>
                                        <input
                                            id="settings-policy-resident-capita"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-resident-capita"
                                            value={data.settings.policy?.residentTaxPerCapitaYen ?? 5000}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        residentTaxPerCapitaYen: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-resident-capita-extra" className="text-xs text-gray-500">住民税均等割の上乗せ(年額, 円)</label>
                                        <input
                                            id="settings-policy-resident-capita-extra"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-resident-capita-extra"
                                            value={data.settings.policy?.residentTaxPerCapitaExtraYen ?? 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        residentTaxPerCapitaExtraYen: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-investment-tax-rate" className="text-xs text-gray-500">運用益課税率(特定口座)</label>
                                        <input
                                            id="settings-policy-investment-tax-rate"
                                            type="number"
                                            step="0.00001"
                                            min="0"
                                            max="1"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-investment-tax-rate"
                                            value={data.settings.policy?.investmentTaxRate ?? 0.20315}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        investmentTaxRate: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-nisa-lifetime-limit" className="text-xs text-gray-500">NISA生涯枠(万円)</label>
                                        <input
                                            id="settings-policy-nisa-lifetime-limit"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-nisa-lifetime-limit"
                                            value={data.settings.policy?.nisaLifetimeLimitManYen ?? 1800}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        nisaLifetimeLimitManYen: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-nisa-lifetime-used" className="text-xs text-gray-500">NISA既使用枠(万円)</label>
                                        <input
                                            id="settings-policy-nisa-lifetime-used"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-nisa-lifetime-used"
                                            value={data.settings.policy?.nisaLifetimeUsedManYen ?? 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        nisaLifetimeUsedManYen: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-bonus-ratio" className="text-xs text-gray-500">給与中の賞与比率(0-1)</label>
                                        <input
                                            id="settings-policy-bonus-ratio"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-bonus-ratio"
                                            value={data.settings.policy?.salaryBonusRatio ?? 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        salaryBonusRatio: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-bonus-payments" className="text-xs text-gray-500">賞与支給回数(年)</label>
                                        <input
                                            id="settings-policy-bonus-payments"
                                            type="number"
                                            min="1"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-bonus-payments"
                                            value={data.settings.policy?.bonusPaymentsPerYear ?? 2}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        bonusPaymentsPerYear: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <label htmlFor="settings-policy-public-pension-auto" className="flex items-center gap-2 text-xs text-gray-600">
                                        <input
                                            id="settings-policy-public-pension-auto"
                                            type="checkbox"
                                            name="settings-policy-public-pension-auto"
                                            checked={data.settings.policy?.publicPensionAutoCalculationEnabled !== false}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        publicPensionAutoCalculationEnabled: e.target.checked
                                                    }
                                                }
                                            }))}
                                        />
                                        公的年金を自動計算
                                    </label>
                                    <div>
                                        <label htmlFor="settings-policy-public-pension-claim-age" className="text-xs text-gray-500">年金受給開始年齢</label>
                                        <input
                                            id="settings-policy-public-pension-claim-age"
                                            type="number"
                                            min="60"
                                            max="75"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-public-pension-claim-age"
                                            value={data.settings.policy?.publicPensionClaimAge ?? 65}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        publicPensionClaimAge: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                        <p className="mt-1 text-[11px] text-gray-400">老齢基礎年金/老齢厚生年金(見込) を概算で自動上書き</p>
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-ideco-category" className="text-xs text-gray-500">iDeCo区分</label>
                                        <select
                                            id="settings-policy-ideco-category"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-ideco-category"
                                            value={data.settings.policy?.idecoCategory || 'company_employee_no_corporate_pension'}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        idecoCategory: e.target.value as 'self_employed' | 'company_employee_no_corporate_pension' | 'company_employee_with_corporate_pension' | 'public_servant' | 'dependent_spouse'
                                                    }
                                                }
                                            }))}
                                        >
                                            <option value="company_employee_no_corporate_pension">会社員（企業年金なし）</option>
                                            <option value="company_employee_with_corporate_pension">会社員（企業年金あり）</option>
                                            <option value="public_servant">公務員</option>
                                            <option value="self_employed">自営業</option>
                                            <option value="dependent_spouse">専業主婦(夫)等</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-social-insurance-model" className="text-xs text-gray-500">社会保険モデル</label>
                                        <select
                                            id="settings-policy-social-insurance-model"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-social-insurance-model"
                                            value={data.settings.policy?.socialInsuranceModel || 'employee'}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        socialInsuranceModel: e.target.value as 'employee' | 'national'
                                                    }
                                                }
                                            }))}
                                        >
                                            <option value="employee">被用者保険（協会けんぽ・厚生年金）</option>
                                            <option value="national">国保・国民年金（別ロジック）</option>
                                        </select>
                                        <p className="mt-1 text-[11px] text-gray-400">国保は「世帯割 + 人数割(世帯主・配偶者人数)」で計算</p>
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-national-health-insurance-household-base" className="text-xs text-gray-500">国保料 世帯割(年額, 円/世帯)</label>
                                        <input
                                            id="settings-policy-national-health-insurance-household-base"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-national-health-insurance-household-base"
                                            value={data.settings.policy?.nationalHealthInsuranceHouseholdBaseYen ?? 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        nationalHealthInsuranceHouseholdBaseYen: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-national-health-insurance" className="text-xs text-gray-500">国保料 人数割単価(年額, 円/人)</label>
                                        <input
                                            id="settings-policy-national-health-insurance"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-national-health-insurance"
                                            value={data.settings.policy?.nationalHealthInsuranceAnnualYen ?? 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        nationalHealthInsurancePerMemberYen: Number(e.target.value),
                                                        nationalHealthInsuranceAnnualYen: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-national-pension-monthly" className="text-xs text-gray-500">国民年金(月額, 円/人)</label>
                                        <input
                                            id="settings-policy-national-pension-monthly"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-national-pension-monthly"
                                            value={data.settings.policy?.nationalPensionMonthlyYen ?? 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        nationalPensionMonthlyYen: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-national-pension-start-age" className="text-xs text-gray-500">国民年金開始年齢</label>
                                        <input
                                            id="settings-policy-national-pension-start-age"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-national-pension-start-age"
                                            value={data.settings.policy?.nationalPensionStartAge ?? 20}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        nationalPensionStartAge: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-national-pension-end-age" className="text-xs text-gray-500">国民年金終了年齢</label>
                                        <input
                                            id="settings-policy-national-pension-end-age"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-national-pension-end-age"
                                            value={data.settings.policy?.nationalPensionEndAge ?? 59}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        nationalPensionEndAge: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <label htmlFor="settings-policy-auto-spouse-deduction" className="flex items-center gap-2 text-xs text-gray-600">
                                        <input
                                            id="settings-policy-auto-spouse-deduction"
                                            type="checkbox"
                                            name="settings-policy-auto-spouse-deduction"
                                            checked={data.settings.policy?.autoSpouseDeductionEnabled !== false}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        autoSpouseDeductionEnabled: e.target.checked
                                                    }
                                                }
                                            }))}
                                        />
                                        配偶者控除を自動判定
                                    </label>
                                    <label htmlFor="settings-policy-auto-dependent-deduction" className="flex items-center gap-2 text-xs text-gray-600">
                                        <input
                                            id="settings-policy-auto-dependent-deduction"
                                            type="checkbox"
                                            name="settings-policy-auto-dependent-deduction"
                                            checked={data.settings.policy?.autoDependentDeductionEnabled !== false}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        autoDependentDeductionEnabled: e.target.checked
                                                    }
                                                }
                                            }))}
                                        />
                                        扶養控除を自動判定
                                    </label>
                                    <div>
                                        <label htmlFor="settings-policy-retirement-years" className="text-xs text-gray-500">退職所得控除 勤続年数</label>
                                        <input
                                            id="settings-policy-retirement-years"
                                            type="number"
                                            min="1"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-retirement-years"
                                            value={data.settings.policy?.retirementYearsOfService ?? 30}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        retirementYearsOfService: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-deduction-spouse" className="text-xs text-gray-500">配偶者控除(年額, 円)</label>
                                        <input
                                            id="settings-policy-deduction-spouse"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-deduction-spouse"
                                            value={data.settings.policy?.deductionSpouseYen ?? 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        deductionSpouseYen: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-deduction-medical" className="text-xs text-gray-500">医療費控除(年額, 円)</label>
                                        <input
                                            id="settings-policy-deduction-medical"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-deduction-medical"
                                            value={data.settings.policy?.deductionMedicalYen ?? 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        deductionMedicalYen: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="settings-policy-deduction-other" className="text-xs text-gray-500">その他控除(年額, 円)</label>
                                        <input
                                            id="settings-policy-deduction-other"
                                            type="number"
                                            className="w-full text-sm border-gray-200 rounded mt-1"
                                            name="settings-policy-deduction-other"
                                            value={data.settings.policy?.deductionOtherYen ?? 0}
                                            onChange={(e) => updateData(d => ({
                                                ...d,
                                                settings: {
                                                    ...d.settings,
                                                    policy: {
                                                        ...d.settings.policy,
                                                        deductionOtherYen: Number(e.target.value)
                                                    }
                                                }
                                            }))}
                                        />
                                    </div>
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
            <div className="motion-safe:animate-in motion-safe:slide-in-from-right motion-safe:duration-300 h-full w-full max-w-2xl">
                {editorContent}
            </div>
        </div>
    );
};
