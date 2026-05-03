import React from "react";

const BudgetCard = ({ icon, name, amount, spent, itemsCount }) => {
  const remaining = amount - spent;
  const percent = Math.min((spent / amount) * 100, 100); // clamp at 100%

  // Color based on usage
  let barColor = "bg-green-500";
  let alertMessage = null;

  if (percent >= 100) {
    barColor = "bg-red-500";
    alertMessage = "❌ You’ve exceeded your budget!";
  } else if (percent >= 80) {
    barColor = "bg-yellow-500";
    alertMessage = `⚠️ You have used ${percent.toFixed(0)}% of your budget.`;
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-5 flex flex-col gap-4">
      {/* Header: Icon + Name + Amount */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 w-10 h-10 rounded-full flex items-center justify-center text-xl">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium text-gray-800">{name}</span>
            <span className="text-sm text-gray-500">Items: {itemsCount}</span>
          </div>
        </div>
        <span className="text-lg font-bold text-gray-900">RM {amount.toFixed(2)}</span>
      </div>

      {/* Details */}
      <div className="text-sm text-gray-600">
        <p>Spent: RM {spent.toFixed(2)}</p>
        <p>Remaining: RM {remaining.toFixed(2)}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-700 ease-in-out ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Alert message */}
      {alertMessage && (
        <div
          className={`text-sm font-medium mt-2 animate-pulse ${
            percent >= 100 ? "text-red-600" : "text-yellow-600"
          }`}
        >
          {alertMessage}
        </div>
      )}
    </div>
  );
};

export default BudgetCard;
