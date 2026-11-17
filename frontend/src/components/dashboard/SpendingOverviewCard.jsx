import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';

const DEFAULT_DATA = [
  { name: 'Food & Dining', value: 4960, percentage: 32, color: '#FB7185', id: 'cat-food' },
  { name: 'Shopping', value: 4340, percentage: 28, color: '#A78BFA', id: 'cat-shopping' },
  { name: 'Transport', value: 3100, percentage: 20, color: '#38BDF8', id: 'cat-transport' },
  { name: 'Bills', value: 1860, percentage: 12, color: '#FBBF24', id: 'cat-bills' },
  { name: 'Others', value: 1240, percentage: 8, color: '#C4B5FD', id: 'cat-others-exp' }
];

export default function SpendingOverviewCard({
  breakdown = [],
  totalSpending = 15500,
  currency = 'INR'
}) {
  const navigate = useNavigate();

  const chartData = breakdown.length > 0
    ? breakdown.map((item) => ({
        name: item.name,
        value: parseFloat(item.amount),
        percentage: item.percentage,
        color: item.color || '#A78BFA',
        id: item.category_id
      }))
    : DEFAULT_DATA;

  const handleSliceClick = (entry) => {
    if (entry && entry.id) {
      navigate(`/transactions?category=${entry.id}`);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-5 shadow-card flex flex-col justify-between h-full bg-white/70">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-extrabold text-base text-pastel-dark flex items-center gap-2">
          Spending Overview
        </h3>
        <div className="w-8 h-8 rounded-full bg-pastel-lavender/60 flex items-center justify-center text-pastel-purple">
          <BarChart2 size={16} />
        </div>
      </div>

      {/* Chart & Legend Row */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center flex-1">
        {/* Donut Chart with Centered Value */}
        <div className="sm:col-span-7 h-44 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val, name, props) => [
                  `${formatCurrency(val, currency)} (${props.payload.percentage}%)`,
                  name
                ]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  border: '1px solid #EAE4F5',
                  boxShadow: '0 8px 24px rgba(167, 139, 250, 0.15)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#282044'
                }}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                cornerRadius={6}
                onClick={handleSliceClick}
                className="cursor-pointer outline-none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="none"
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Donut Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-sm font-black text-pastel-dark leading-tight">
              {formatCurrency(totalSpending, currency)}
            </span>
            <span className="text-[10px] font-bold text-pastel-muted">This Month</span>
          </div>
        </div>

        {/* Legend with percentages */}
        <div className="sm:col-span-5 space-y-2">
          {chartData.map((item) => (
            <div
              key={item.name}
              onClick={() => handleSliceClick(item)}
              className="flex items-center justify-between text-xs cursor-pointer hover:bg-pastel-lavender/30 p-1 rounded-xl transition"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-semibold text-pastel-dark truncate text-[11px]">
                  {item.name}
                </span>
              </div>
              <span className="font-extrabold text-pastel-muted text-[11px] ml-1">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
