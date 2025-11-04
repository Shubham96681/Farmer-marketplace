// frontend/src/components/StatsCard.jsx
import React from 'react';

const StatsCard = ({ title, value, change, changeType, icon: Icon, description }) => {
  const changeColor = {
    positive: 'text-green-600 bg-green-50 border-green-200',
    negative: 'text-red-600 bg-red-50 border-red-200',
    neutral: 'text-gray-600 bg-gray-50 border-gray-200'
  }[changeType] || 'text-gray-600 bg-gray-50 border-gray-200';

  return (
    <div className="bg-white rounded-xl p-6 border border-blue-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className="flex items-center space-x-2 mt-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${changeColor}`}>
              {change}
            </span>
            <span className="text-xs text-gray-500">{description}</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;