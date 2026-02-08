import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table';
import { AnnualResult } from '../../types';
import { Download } from 'lucide-react';

interface Props {
    results: AnnualResult[];
}

export const AnnualTable: React.FC<Props> = ({ results }) => {
    const columnHelper = createColumnHelper<AnnualResult>();

    const columns = useMemo(() => [
        columnHelper.group({
            header: '基本情報',
            columns: [
                columnHelper.accessor('year', { header: '西暦', size: 80 }),
                columnHelper.accessor('age', { header: '年齢', size: 60 }),
            ]
        }),
        columnHelper.group({
            header: '収入 (ご本人)',
            columns: [
                columnHelper.accessor('income.self.salary', { header: '収入', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('income.self.publicPension', { header: '公的年金等', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('income.self.privatePension', { header: '私の年金', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('income.self.individualPension', { header: '個人年金保険', cell: i => Math.round(i.getValue()).toLocaleString() }),
            ]
        }),
        columnHelper.group({
            header: '収入 (配偶者)',
            columns: [
                columnHelper.accessor('income.spouse.salary', { header: '収入', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('income.spouse.publicPension', { header: '公的年金等', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('income.spouse.privatePension', { header: '私の年金', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('income.spouse.individualPension', { header: '個人年金保険', cell: i => Math.round(i.getValue()).toLocaleString() }),
            ]
        }),
        columnHelper.group({
            header: 'その他収入',
            columns: [
                columnHelper.accessor('income.assetWithdrawal', { header: '金融商品取崩', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('income.childAllowance', { header: '子育て手当', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('income.total', { header: '収入計', cell: i => <span className="font-bold">{Math.round(i.getValue()).toLocaleString()}</span> }),
            ]
        }),
        columnHelper.group({
            header: '支出',
            columns: [
                columnHelper.accessor('expense.living', { header: '生活資金', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.housing', { header: '住宅関連', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.education', { header: '子育て関連', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.futurePlan', { header: '将来プラン', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.selfSpecific', { header: '本人固有', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.spouseSpecific', { header: '配偶者固有', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.familySpecific', { header: '家族固有', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.repayment', { header: '返済額', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.investment', { header: '金融商品積立', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.insurance', { header: '保険料', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.tax', { header: '税金・社保', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('expense.total', { header: '支出計', cell: i => <span className="font-bold">{Math.round(i.getValue()).toLocaleString()}</span> }),
            ]
        }),
        columnHelper.group({
            header: '収支・貯蓄',
            columns: [
                columnHelper.accessor('balance', { header: '年度別収支①', cell: i => <span className={i.getValue() < 0 ? 'text-red-500' : ''}>{Math.round(i.getValue()).toLocaleString()}</span> }),
                columnHelper.accessor('irregularExpense', { header: '不定期支出②', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('netSavings', { header: '貯蓄額①-②', cell: i => <span className="font-bold">{Math.round(i.getValue()).toLocaleString()}</span> }),
                columnHelper.accessor('educationFundMaturity', { header: '学資・満期', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('surrenderValue', { header: '解約返戻金', cell: i => Math.round(i.getValue()).toLocaleString() }),
            ]
        }),
        columnHelper.group({
            header: '資産',
            columns: [
                columnHelper.accessor('assets.shortTerm', { header: '短期向け', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('assets.mediumTerm', { header: '中期向け', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('assets.longTerm', { header: '長期向け', cell: i => Math.round(i.getValue()).toLocaleString() }),
                columnHelper.accessor('assets.total', { header: '金融資産残高', cell: i => <span className="font-bold text-indigo-600">{Math.round(i.getValue()).toLocaleString()}</span> }),
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
                r.expense.repayment, r.expense.investment, r.expense.insurance, r.expense.tax, r.expense.total,
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
