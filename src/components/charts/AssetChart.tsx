import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AnnualResult, Asset } from '../../types';

interface Props {
    results: AnnualResult[];
    assets: Asset[];
}

export const AssetChart: React.FC<Props> = ({ results, assets }) => {
    if (!results.length) return null;

    // Create a mapping of id to name
    const assetMap: Record<string, string> = {};
    assets.forEach(a => {
        assetMap[a.id] = a.name;
    });

    const data = results.map(r => ({
        age: r.age,
        year: r.year,
        ...r.assets.byCategory
    }));

    // Create a mapping of id to name would be better, but simplified for now:
    // We need to map assetId to name to color... 
    // For Quick implementation: Just stack them, colors might be random if dynamic.
    // Better: Pass asset definitions to map ids to names.

    // Since byCategory uses IDs (a1, a2...) but keys above are types...
    // Wait, engine logic: `assetCategories[a.id] = a.balance`.
    // So keys are `a1`, `a2`. We need to map them to readable names.

    // Actually, let's just make the chart generic for now.
    // We can get all unique keys from the first result.
    const keys = Object.keys(results[0]?.assets.byCategory || {});

    // Simple color palette
    const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="h-96 w-full bg-white p-2 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">貯金の増えかた (合計)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" label={{ value: '年齢', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis label={{ value: '万円', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number) => value.toFixed(1).toLocaleString() + '万円'} />
                    <Legend />
                    {keys.map((key, index) => (
                        <Area
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stackId="1"
                            stroke={palette[index % palette.length]}
                            fill={palette[index % palette.length]}
                            name={assetMap[key] || key}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
