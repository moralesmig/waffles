"use client";

import React from "react";
import IncomeList from "./_components/IncomeList";
import { useRouter } from "next/navigation";

function Income() {
  const route = useRouter();

  return (
    <div className="p-10 pb-28">
      <div className="flex">
        <h2 className="font-bold text-3xl">My Income</h2>
      </div>
      <IncomeList />
    </div>
  );
}

export default Income;
