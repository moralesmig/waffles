"use client";

import React, { useEffect, useState } from "react";
import IncomeList from "./_components/IncomeList";
import CreateIncomes from "./_components/CreateIncomes";
import { db } from "@/../utils/dbConfig";
import { Incomes } from "@/../utils/schema";

function Income({ params }) {
  const [incomeList, setIncomeList] = useState([]); // All income records
  const [filteredIncomeList, setFilteredIncomeList] = useState([]); // To hold the filtered income list
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false); // Default to false to avoid unnecessary "Loading..." message

  // Set default month and year to the current month and year
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0"); // MM format
    const currentYear = currentDate.getFullYear(); // YYYY format

    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, []);

  // Apply filters whenever the income list, selected month, or selected year changes
  useEffect(() => {
    applyDateFilter();
  }, [incomeList, selectedMonth, selectedYear]);

  // Fetch all income records when the component mounts
  useEffect(() => {
    getAllIncome();
  }, []);

  // Fetch income data from the database
  const getAllIncome = async () => {
    setLoading(true); // Set loading to true while fetching data

    try {
      const result = await db
        .select({
          id: Incomes.id,
          name: Incomes.name,
          amount: Incomes.amount,
          datePaid: Incomes.datePaid,
        })
        .from(Incomes)
        .orderBy(Incomes.datePaid);

      setIncomeList(result);
      setLoading(false); // Set loading to false once data is fetched
    } catch (error) {
      console.error("Error fetching income:", error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  // Apply date filter to incomes
  const applyDateFilter = () => {
    if (!selectedMonth || !selectedYear) {
      setFilteredIncomeList(incomeList); // If no month or year is selected, show all incomes
      return;
    }

    // Calculate startDate and endDate for the selected month and year
    const startDate = new Date(`${selectedYear}-${selectedMonth}-01`);
    const endDate = new Date(selectedYear, parseInt(selectedMonth, 10), 0); // Last day of the month

    const filteredIncomes = incomeList.filter((income) => {
      const incomeDate = new Date(income.datePaid); // Convert datePaid to a Date object
      return incomeDate >= startDate && incomeDate <= endDate;
    });

    setFilteredIncomeList(filteredIncomes);
  };

  return (
    <div className="p-10 pb-28">
      <div className="flex">
        <h2 className="font-bold text-3xl">My Income</h2>
      </div>

      <div
        className="grid grid-cols-1
        md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7"
      >
        <CreateIncomes incomesId={params.id} refreshData={() => getAllIncome()} />
      </div>

      {/* Filter by Date */}
      <div className="flex gap-4 pb-7 pt-7">
        <div>
          <label className="block text-sm font-bold">Select Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="p-2 border rounded-md w-full"
          >
            <option value="">Select Month</option>
            {Array.from({ length: 12 }, (_, i) => {
              const month = new Date(0, i).toLocaleString("default", {
                month: "long",
              });
              return (
                <option key={i} value={String(i + 1).padStart(2, "0")}>
                  {month}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold">Select Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="p-2 border rounded-md w-full"
          >
            <option value="">Select Year</option>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() + 1 - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading income...</p>}

      {/* Display Income List */}
      <div>
        {filteredIncomeList?.length > 0 ? (
          <IncomeList
            refreshData={() => getAllIncome()}
            incomeList={filteredIncomeList}
          />
        ) : (
          !loading && (
            <p className="text-gray-500">
              No income found for the selected date range.
            </p>
          )
        )}
      </div>
    </div>
  );
}

export default Income;