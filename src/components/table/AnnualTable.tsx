import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { AnnualResult } from '../../types';
import { Download } from 'lucide-react';
import { formatAmount } from '../../lib/format';

interface Props {
    results: AnnualResult[];
}

export const AnnualTable: React.FC<Props> = ({ results }) => {
    const columnHelper = createColumnHelper<AnnualResult>();

    const columns = useMemo(() => [
        columnHelper.group({
            header: '年齢など',
            columns: [
                columnHelper.accessor('year', { header: '西暦', size: 80 }),
                columnHelper.accessor('age', { header: '年齢', size: 60 }),
            ]
        }),
        columnHelper.group({
            header: '本人の収入',
            columns: [
                columnHelper.accessor('income.self.salary', { header: 'お給料', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('income.self.publicPension', { header: '年金など', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('income.self.privatePension', { header: '個人年金等', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('income.self.individualPension', { header: 'iDeCo等', cell: i => formatAmount(i.getValue()) }),
            ]
        }),
        columnHelper.group({
            header: '家族の収入',
            columns: [
                columnHelper.accessor('income.spouse.salary', { header: 'お給料', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('income.spouse.publicPension', { header: '年金など', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('income.spouse.privatePension', { header: '個人年金等', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('income.spouse.individualPension', { header: 'iDeCo等', cell: i => formatAmount(i.getValue()) }),
            ]
        }),
        columnHelper.group({
            header: 'その他',
            columns: [
                columnHelper.accessor('income.assetWithdrawal', { header: '貯金の切崩', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('income.childAllowance', { header: '児童手当', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('income.total', { header: '年収合計', cell: i => <span className="font-bold">{formatAmount(i.getValue())}</span> }),
            ]
        }),
        columnHelper.group({
            header: '使う予定のお金',
            columns: [
                columnHelper.accessor('expense.living', { header: '基本生活費', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('expense.housing', { header: '火災保険等', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('expense.education', { header: '学費など', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('expense.futurePlan', { header: '車の買替等', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('expense.selfSpecific', { header: '趣味・他', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('expense.spouseSpecific', { header: '趣味・他', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('expense.familySpecific', { header: '家族関連', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('expense.repayment', { header: '家ローン', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('expense.investment', { header: '将来の積立', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('expense.insurance', { header: '保険料', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor((row) => row.expense.tax + row.expense.socialInsurance, {
                    id: 'expense.taxAndSocialInsurance',
                    header: '税金・社保',
                    cell: i => formatAmount(i.getValue())
                }),
                columnHelper.accessor('expense.total', { header: '支出合計', cell: i => <span className="font-bold">{formatAmount(i.getValue())}</span> }),
            ]
        }),
        columnHelper.group({
            header: '毎年の収支',
            columns: [
                columnHelper.accessor('balance', { header: '年間の残金', cell: i => <span className={i.getValue() < 0 ? 'text-red-500' : ''}>{formatAmount(i.getValue())}</span> }),
                columnHelper.accessor('irregularExpense', { header: '不定期な出費', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('netSavings', { header: '実質の貯蓄', cell: i => <span className="font-bold">{formatAmount(i.getValue())}</span> }),
                columnHelper.accessor('educationFundMaturity', { header: '満期保険等', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('surrenderValue', { header: '保険解約金', cell: i => formatAmount(i.getValue()) }),
            ]
        }),
        columnHelper.group({
            header: '貯金の合計',
            columns: [
                columnHelper.accessor('assets.shortTerm', { header: 'ふだん使い', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('assets.mediumTerm', { header: '予備のお金', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('assets.longTerm', { header: '運用の資金', cell: i => formatAmount(i.getValue()) }),
                columnHelper.accessor('assets.total', { header: 'その年の残高', cell: i => <span className="font-bold text-indigo-600">{formatAmount(i.getValue())}</span> }),
            ]
        }),
    ], [columnHelper]);

    const table = useReactTable({
        data: results,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleExportCSV = () => {
        // Flatten headers
        const headerRows: string[][] = [[], []]; // Group headers and actual headers
        columns.forEach(col => {
            if ('columns' in col) {
                col.columns?.forEach((subCol, idx) => {
                    headerRows[0].push(idx === 0 ? col.header as string : '');
                    headerRows[1].push((subCol as any).header as string);
                });
            } else {
                headerRows[0].push('');
                headerRows[1].push((col as any).header as string);
            }
        });

        const rows = results.map(r => {
            return [
                r.year, r.age,
                r.income.self.salary, r.income.self.publicPension, r.income.self.privatePension, r.income.self.individualPension,
                r.income.spouse.salary, r.income.spouse.publicPension, r.income.spouse.privatePension, r.income.spouse.individualPension,
                r.income.assetWithdrawal, r.income.childAllowance, r.income.total,
                r.expense.living, r.expense.housing, r.expense.education, r.expense.futurePlan,
                r.expense.selfSpecific, r.expense.spouseSpecific, r.expense.familySpecific,
                r.expense.repayment, r.expense.investment, r.expense.insurance, (r.expense.tax + r.expense.socialInsurance), r.expense.total,
                r.balance, r.irregularExpense, r.netSavings, r.educationFundMaturity, r.surrenderValue,
            ].map(v => {
                if (v === null || v === undefined) return '';
                const s = String(v);
                return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
            }).join(',');
        });

        const csvContent = [
            headerRows[0].join(','),
            headerRows[1].join(','),
            ...rows
        ].join('\r\n');

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `life_plan_table_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!results.length) return null;

    return (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                <h3 className="font-bold text-gray-700">生涯収支・資産詳細</h3>
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 rounded text-sm text-gray-700 shadow-sm transition-colors"
                >
                    <Download size={16} /> CSV出力
                </button>
            </div>
            <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="min-w-full text-[11px] border-collapse">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className="px-2 py-1.5 text-center font-bold text-gray-600 border border-gray-200"
                                    >
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="px-2 py-1 border border-gray-100 text-right whitespace-nowrap">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

