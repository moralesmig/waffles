import Link from "next/link";
import React from "react";

function IncomeItem({ income }) {
  const calculateProgressPerc = () => {
    const perc = (income.totalSpend / income.amount) * 100;
    return perc > 100 ? 100 : perc.toFixed(2);
  };
  return (
    <Link href={"/dashboard/incomes/" + income?.id}>
      <div
        className="p-5 border rounded-2xl
    hover:shadow-md cursor-pointer h-[170px]"
      >
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <h2
              className="text-2xl p-3 px-4
              bg-slate-100 rounded-full 
              "
            >
              {income?.icon}
            </h2>
            <div>
              <h2 className="font-bold">{income.name}</h2>
              <h2 className="text-sm text-gray-500">{income.totalItem} Item</h2>
            </div>
          </div>
          <h2 className="font-bold text-primary text-lg"> ${income.amount}</h2>
        </div>
      </div>
    </Link>
  );
}

export default IncomeItem;
