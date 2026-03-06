import React, { useState, useMemo, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceArea } from 'recharts';
import { AnnualResult } from '../../types';
import { formatAmount } from '../../lib/format';

interface Props {
    results: AnnualResult[];
}

export const BalanceChart: React.FC<Props> = ({ results }) => {
    const [left, setLeft] = useState<number | 'dataMin'>('dataMin');
    const [right, setRight] = useState<number | 'dataMax'>('dataMax');
    const [refAreaLeft, setRefAreaLeft] = useState<number | null>(null);
    const [refAreaRight, setRefAreaRight] = useState<number | null>(null);
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(mediaQuery.matches);
        update();
        mediaQuery.addEventListener('change', update);
        return () => mediaQuery.removeEventListener('change', update);
    }, []);

    if (!results.length) return null;

    const data = results.map(r => ({
        age: r.age,
        income: r.income.total,
        living: r.expense.living,
        housing: r.expense.housing,
        education: r.expense.education,
        futurePlan: r.expense.futurePlan,
        specific: r.expense.selfSpecific + r.expense.spouseSpecific + r.expense.familySpecific,
        repayment: r.expense.repayment,
        insurance: r.expense.insurance,
        tax: r.expense.tax + r.expense.socialInsurance,
        balance: r.balance
    }));
    const minAge = data[0]?.age ?? 0;
    const maxAge = data[data.length - 1]?.age ?? 0;

    // Calculate dynamic Y-axis max based on visible data
    const visibleData = useMemo(() => {
        if (left === 'dataMin' && right === 'dataMax') return data;
        return data.filter(d => d.age >= (left as number) && d.age <= (right as number));
    }, [data, left, right]);

    const xTicks = useMemo(() => {
        const from = left === 'dataMin' ? minAge : (left as number);
        const to = right === 'dataMax' ? maxAge : (right as number);
        if (to < from) return [];
        const start = from % 2 === 0 ? from : from + 1;
        const ticks: number[] = [];
        for (let v = start; v <= to; v += 2) ticks.push(v);
        if (ticks.length === 0 || ticks[0] !== from) ticks.unshift(from);
        if (ticks[ticks.length - 1] !== to) ticks.push(to);
        return ticks;
    }, [left, right, minAge, maxAge]);

    const yAxisMax = useMemo(() => {
        if (visibleData.length === 0) return 'auto';
        let maxVal = 0;
        visibleData.forEach(d => {
            // Check total stacked expenses
            const totalExpenses = d.living + d.housing + d.education + d.futurePlan + d.specific + d.repayment + d.insurance + d.tax;
            if (totalExpenses > maxVal) maxVal = totalExpenses;
            // Check income
            if (d.income > maxVal) maxVal = d.income;
        });

        // Add a 10% padding to the top so lines don't touch the very edge
        // Round to nearest 1000 for nice tick numbers
        const padding = Math.max(100, Math.ceil((maxVal * 1.1) / 1000) * 1000);
        return padding;
    }, [visibleData]);

    const zoom = () => {
        let refLeft = refAreaLeft;
        let refRight = refAreaRight;

        if (refLeft === refRight || refLeft === null || refRight === null) {
            setRefAreaLeft(null);
            setRefAreaRight(null);
            return;
        }

        // Ensure left is actually smaller than right
        if (refLeft > refRight) {
            [refLeft, refRight] = [refRight, refLeft];
        }

        setRefAreaLeft(null);
        setRefAreaRight(null);
        setLeft(refLeft);
        setRight(refRight);
    };

    const zoomOut = () => {
        setRefAreaLeft(null);
        setRefAreaRight(null);
        setLeft('dataMin');
        setRight('dataMax');
    };

    const expenseConfigs = [
        { key: 'tax', name: '税金・社会保険', color: '#d97706' },
        { key: 'insurance', name: '生命保険など', color: '#8b5cf6' },
        { key: 'repayment', name: '住宅ローンなど', color: '#ef4444' },
        { key: 'education', name: '子どもの教育費', color: '#ec4899' },
        { key: 'futurePlan', name: '将来のイベント', color: '#f59e0b' },
        { key: 'housing', name: '住居費（家賃等）', color: '#3b82f6' },
        { key: 'specific', name: '自分たちのお金', color: '#6b7280' },
        { key: 'living', name: 'ふだんの生活費', color: '#10b981' },
    ];

    return (
        <div className="h-96 w-full bg-white p-2 rounded-lg flex flex-col relative select-none">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">年間収支分析 (報告書形式)</h3>
                <div className="flex gap-2 items-center">
                    {(left !== 'dataMin' || right !== 'dataMax') && (
                        <button
                            onClick={zoomOut}
                            className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold px-3 py-1 rounded hover:bg-indigo-100 hover:border-indigo-300 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                        >
                            全体表示に戻す (ズームアウト)
                        </button>
                    )}
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                    data={data}
                    margin={{ top: 10, right: 30, left: 56, bottom: 12 }}
                    onMouseDown={(e: any) => e?.activeLabel && setRefAreaLeft(e.activeLabel)}
                    onMouseMove={(e: any) => refAreaLeft && e?.activeLabel && setRefAreaRight(e.activeLabel)}
                    onMouseUp={zoom}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="age"
                        domain={[left, right]}
                        type="number"
                        allowDataOverflow
                        ticks={xTicks}
                    />
                    <YAxis
                        width={88}
                        allowDataOverflow
                        domain={[0, yAxisMax]}
                        tickFormatter={(value) => `${Math.round(Number(value)).toLocaleString('ja-JP')}万円`}
                    />
                    <Tooltip
                        active={refAreaLeft === null ? undefined : false}
                        formatter={(value: number) => `${formatAmount(value)}万円`}
                        animationDuration={prefersReducedMotion ? 0 : 1000}
                    />
                    <Legend />
                    {expenseConfigs.map(cfg => (
                        <Bar key={cfg.key} dataKey={cfg.key} name={cfg.name} stackId="a" fill={cfg.color} isAnimationActive={!prefersReducedMotion} />
                    ))}
                    <Line type="monotone" dataKey="income" name="経常収入" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={!prefersReducedMotion} />
                    <Line type="monotone" dataKey="balance" name="手元に残るお金" stroke="#000" strokeWidth={1} strokeDasharray="5 5" dot={false} isAnimationActive={!prefersReducedMotion} />

                    {refAreaLeft !== null && refAreaRight !== null ? (
                        <ReferenceArea
                            x1={refAreaLeft}
                            x2={refAreaRight}
                            strokeOpacity={0.3}
                            fill="#6366f1"
                            fillOpacity={0.2}
                        />
                    ) : null}
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
