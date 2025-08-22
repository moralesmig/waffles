"use client";

import React, { useState, useEffect } from "react";
import BudgetList from "./_components/BudgetList";
import CreateBudget from "./_components/CreateBudget";
import { useUser } from "@clerk/nextjs";

function Budget() {
    const { user } = useUser();
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

    return (
        <div className="p-10 pb-28">
            <div className="flex">
                <h2 className="font-bold text-3xl mt-0 mb-7">My Budgets</h2>
            </div>

            {/* Pass getFilteredBudgets as refreshData to CreateBudget */}
            <CreateBudget refreshData={() => setLoading(true)} />

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
                            const month = new Date(0, i).toLocaleString("default", { month: "long" });
                            return <option key={i} value={String(i + 1).padStart(2, "0")}>{month}</option>;
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
                            const year = new Date().getFullYear() - i;
                            return <option key={year} value={year}>{year}</option>;
                        })}
                    </select>
                </div>
            </div>

            {loading ? (
                <p className="text-gray-500">Loading budgets...</p>
            ) : (
                <BudgetList
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    setLoading={setLoading}
                />
            )}
        </div>
    );
}

export default Budget;