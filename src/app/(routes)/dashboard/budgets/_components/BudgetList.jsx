"use client";
import React, { useEffect, useState } from "react";
import { db } from "@/../utils/dbConfig";
import { desc, eq, sql, and, gte, lte } from "drizzle-orm";
import { Budgets, Expenses } from "@/../utils/schema";
import { useUser } from "@clerk/nextjs";
import BudgetItem from "./BudgetItem";

function BudgetList({ selectedMonth, selectedYear, setLoading }) {
    const [budgetList, setBudgetList] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        if (user && selectedMonth && selectedYear) {
            getBudgetList(); // Fetch budgets when user, selectedMonth, or selectedYear changes
        }
    }, [user, selectedMonth, selectedYear]);

    /**
     * Fetch budgets filtered by the selected month and year
     */
    const getBudgetList = async () => {
        if (!user?.primaryEmailAddress?.emailAddress || !selectedMonth || !selectedYear) return;

        try {
            setLoading(true);

            // Calculate the start and end dates for the selected month and year
            const startDate = `${selectedYear}-${selectedMonth}-01`;
            const endDate = new Date(selectedYear, parseInt(selectedMonth, 10), 0).toISOString().split("T")[0]; // Last day of the month

            // Replace getTableColumns with hardcoded columns
            const result = await db
                .select({
                    id: Budgets.id,
                    name: Budgets.name,
                    amount: Budgets.amount,
                    icon: Budgets.icon,
                    createdBy: Budgets.createdBy,
                    dueDate: Budgets.dueDate,
                    totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
                    totalItem: sql`count(${Expenses.id})`.mapWith(Number),
                })
                .from(Budgets)
                .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
                .where(
                    and(
                        eq(Budgets.createdBy, user.primaryEmailAddress.emailAddress),
                        gte(Budgets.dueDate, startDate),
                        lte(Budgets.dueDate, endDate)
                    )
                )
                .groupBy(Budgets.id)
                .orderBy(desc(Budgets.dueDate));

            setBudgetList(result); // Update the budget list with filtered results
        } catch (error) {
            console.error("Error fetching filtered budgets:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-7">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {budgetList?.length > 0 ? (
                    budgetList.map((budget, index) => (
                        <BudgetItem budget={budget} key={index} />
                    ))
                ) : (
                    <p className="text-gray-500">No budgets found for the selected month and year.</p>
                )}
            </div>
        </div>
    );
}

export default BudgetList;