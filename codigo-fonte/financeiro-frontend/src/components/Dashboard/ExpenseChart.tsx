import React from 'react';

interface ExpenseChartProps {
  data: { category: string; amount: number; color: string }[];
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Gastos por Categoria</h3>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.amount / total) * 100 : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.category}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(item.amount)}
                  </span>
                  <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseChart;