"use client";

import React from "react";
import IncomeList from "./_components/IncomeList";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

function Income() {
  const route = useRouter();

  return (
    <div className="p-10">
      <div className="flex">
        <ArrowLeft onClick={() => route.replace('/dashboard')} className="cursor-pointer mt-2 mr-2" />
        <h2 className="font-bold text-3xl">My Income Streams</h2>
      </div>
      <IncomeList />
    </div>
  );
}

export default Income;
