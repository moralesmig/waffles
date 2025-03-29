"use client";

import React, { useEffect, useState } from "react";
import IncomeList from "./_components/IncomeList";
import CreateIncomes from "./_components/CreateIncomes";
import { db } from "@/../utils/dbConfig";
import { Incomes } from '@/../utils/schema';


function Income({ params }) {
  const [startDate, setStartDate] = useState(""); // State for start date filter
  const [endDate, setEndDate] = useState(""); // State for end date filter
  const [filteredIncomeList, setFilteredIncomeList] = useState([]); // To hold the filtered income list
  const [incomeList, setIncomeList] = useState([]); // All income records
  const [loading, setLoading] = useState(true); // Loading state to show until budgets are fetched


  // Set start date and end date
  useEffect(() => {
    const currentDate = new Date();
    const firstDayOfTheYear = new Date(currentDate.getFullYear(), 0, 1);
    const lastDayOfTheYear = new Date(currentDate.getFullYear(), 11, 31);
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    setStartDate(firstDayOfTheYear.toISOString().split("T")[0]); // Convert to YYYY-MM-DD format
    setEndDate(lastDayOfTheYear.toISOString().split("T")[0]);
  }, []);

  // Apply date filters to the income list
  useEffect(() => {
    applyDateFilter();
  }, [startDate, endDate, incomeList]);

  const applyDateFilter = () => {
    const filteredIncomes = incomeList.filter((income) => {
      const incomeDate = new Date(income.datePaid);
      const matchesStartDate = !startDate || incomeDate >= new Date(startDate);
      const matchesEndDate = !endDate || incomeDate <= new Date(endDate);
      return matchesStartDate && matchesEndDate;
    });
    setFilteredIncomeList(filteredIncomes);
  };

  // Fetch all income records when the component mounts
  useEffect(() => {
    getAllIncome();
  }, []);

  // Fetch income data from the database
  const getAllIncome = async () => {
    setLoading(true); // Set loading to true while fetching data

    try {
      const result = await db.select({
        id: Incomes.id,
        name: Incomes.name,
        amount: Incomes.amount,
        datePaid: Incomes.datePaid
      }).from(Incomes)
        .orderBy(Incomes.datePaid);
      setIncomeList(result);
      setLoading(false); // Set loading to false once data is fetched

    } catch (error) {
      console.error("Error fetching income:", error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  return (
    <div className="p-10 pb-28">
      <div className="flex">
        <h2 className="font-bold text-3xl">My Income</h2>
      </div>

      <div className='grid grid-cols-1
        md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7'>
        <CreateIncomes
          incomesId={params.id}
          refreshData={() => getAllIncome()}
        />
      </div>


      {/* Filter by Date */}
      <p className="font-bold pt-7">Filter by date</p>
      <div className="flex flex-col-2 items-center gap-2 pb-7 pt-2">
        <div className="">
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded-md w-full"
          />
        </div>
        <div className="">
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded-md w-full"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading income...</p>}

      {/* Display Income List */}
      <div>
        {filteredIncomeList?.length > 0 ? (
          <IncomeList refreshData={() => getAllIncome()} incomeList={filteredIncomeList} />
        ) : (
          !loading && <p className="text-gray-500">No income found for the selected date range.</p>
        )}
      </div>
    </div>
  );
}

export default Income;
