import Link from "next/link";
import React from "react";
import { parseISO, format } from 'date-fns';

function IncomeItem({ income }) {
  // change date paid format
  const parsedDate = parseISO(income?.datePaid);
  const formattedDate = format(parsedDate, 'MMM d, yyyy');


  const calculateProgressPerc = () => {
    const perc = (income.totalSpend / income.amount) * 100;
    return perc > 100 ? 100 : perc.toFixed(2);
  };


  return (
    <Link href={"/dashboard/incomes/" + income?.id}>
      <div
        className="p-5 border rounded-2xl
    hover:shadow-md cursor-pointer h-[100px]"
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
              <h2 className="text-sm text-gray-500">{formattedDate}</h2>
            </div>
          </div>
          <h2 className="font-bold text-primary text-lg"> ${income.amount}</h2>
        </div>
      </div>
    </Link>
  );
}

export default IncomeItem;
