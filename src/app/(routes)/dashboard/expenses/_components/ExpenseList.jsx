"use client";
import React, { useEffect, useState } from "react";
import CreateExpenses from "./CreateExpense";
import { db } from "@/../utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Expenses, Budgets } from "@/../utils/schema";
import { useUser } from "@clerk/nextjs";
import ExpenseItem from "./ExpenseItem";

function ExpenseList() {
    const [expenselist, setExpenselist] = useState([]);
    const { user } = useUser();

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress) {
            getExpenseList();
        }
    }, [user]);

    // Get expenses
    const getExpenseList = async () => {
        try {
            const email = user?.primaryEmailAddress?.emailAddress;
            if (!email) return;

            const result = await db
                .select({
                    id: Expenses.id,
                    name: Expenses.name,
                    amount: Expenses.amount,
                    budgetId: Expenses.budgetId,
                    createdAt: Expenses.createdAt,
                    totalSpend: sql`COALESCE(SUM(${Expenses.amount}), 0)`.as("totalSpend"),
                    totalItem: sql`COUNT(${Expenses.id})`.as("totalItem"),
                })
                .from(Expenses)
                .leftJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
                .where(eq(Budgets.createdBy, email))
                .groupBy(
                    Expenses.id
                )
                .orderBy(desc(Expenses.createdAt));

            setExpenselist(result);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

    return (
        <div className="mt-7 p-0">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {expenselist.length > 0 ? (
                    expenselist.map((expense, index) => (
                        <ExpenseItem expense={expense} key={expense.id || index} />
                    ))
                ) : (
                    [1, 2, 3, 4, 5].map((item, index) => (
                        <div
                            key={index}
                            className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse"
                        ></div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ExpenseList;
