import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AnnualResult } from '../../types';

interface Props {
    results: AnnualResult[];
}

export const BalanceChart: React.FC<Props> = ({ results }) => {
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
        <div className="h-96 w-full bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">年間収支分析 (報告書形式)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => Math.round(value).toLocaleString() + '万円'} />
                    <Legend />
                    {expenseConfigs.map(cfg => (
                        <Bar key={cfg.key} dataKey={cfg.key} name={cfg.name} stackId="a" fill={cfg.color} />
                    ))}
                    <Line type="monotone" dataKey="income" name="入るお金 (年収)" stroke="#ef4444" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="balance" name="手元に残るお金" stroke="#000" strokeWidth={1} strokeDasharray="5 5" dot={false} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};
