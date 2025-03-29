"use client";

import React, { useState, useEffect } from "react";
import BudgetList from "./_components/BudgetList";
import CreateBudget from "./_components/CreateBudget";
import { useUser } from "@clerk/nextjs";
import { db } from "@/../utils/dbConfig";
import { getTableColumns, sql, eq, desc } from "drizzle-orm";
import { Budgets, Expenses } from "@/../utils/schema";

function Budget() {
    const { user } = useUser();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [budgetsList, setBudgetList] = useState([]);
    const [filteredBudgetsList, setFilteredBudgetsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentDate = new Date();
        const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
        const lastDayOfYear = new Date(currentDate.getFullYear(), 11, 31);

        setStartDate(firstDayOfYear.toISOString().split("T")[0]);
        setEndDate(lastDayOfYear.toISOString().split("T")[0]);
    }, []);

    useEffect(() => {
        if (user) {
            getBudgetList();
        }
    }, [user]);

    // Get All Budgets
    const getBudgetList = async () => {
        if (!user?.primaryEmailAddress?.emailAddress) return;
        setLoading(true);

        try {
            const result = await db
                .select({
                    ...getTableColumns(Budgets),
                    totalSpend: sql`COALESCE(SUM(${Expenses.amount}), 0)`.mapWith(Number),
                    totalItem: sql`COUNT(${Expenses.id})`.mapWith(Number),
                })
                .from(Budgets)
                .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
                .where(eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress))
                .groupBy(Budgets.id)
                .orderBy(desc(Budgets.id));

            setBudgetList(result);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching budgets:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        applyDateFilter();
    }, [budgetsList, startDate, endDate]);

    const applyDateFilter = () => {
        const filteredBudgets = budgetsList.filter((budget) => {
            const budgetDate = new Date(budget.dueDate);
            return (
                (!startDate || budgetDate >= new Date(startDate)) &&
                (!endDate || budgetDate <= new Date(endDate))
            );
        });
        setFilteredBudgetsList(filteredBudgets);
    };

    return (
        <div className="p-10 pb-28">
            <div className="flex">
                <h2 className="font-bold text-3xl mt-0 mb-7">My Budgets</h2>
            </div>

            {/* Pass getBudgetList as refreshData to CreateBudget */}
            <CreateBudget refreshData={getBudgetList} />

            <p className="font-bold pt-7">Filter by date</p>
            <div className="flex flex-wrap gap-2 pb-7 pt-2">
                <div>
                    <label className="block text-sm font-medium">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border rounded-md w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border rounded-md w-full"
                    />
                </div>
            </div>

            {loading && <p className="text-gray-500">Loading budgets...</p>}

            <div>
                {filteredBudgetsList.length > 0 ? (
                    <BudgetList budgetsList={filteredBudgetsList} refreshData={getBudgetList} />
                ) : (
                    !loading && <p className="text-gray-500">No budgets found for the selected date range.</p>
                )}
            </div>
        </div>
    );
}

export default Budget;
