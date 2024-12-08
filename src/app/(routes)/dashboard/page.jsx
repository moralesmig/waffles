"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import CardInfo from "./_components/CardInfo";
import { db } from "@/../utils/dbConfig";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Budgets, Expenses, Incomes } from "@/../utils/schema";



function Dashboard() {
    const { user } = useUser();
    const [budgetList, setBudgetList] = useState([]);
    const [incomeList, setIncomeList] = useState([]);
    const [expensesList, setExpensesList] = useState([]);

    useEffect(() => {
        user && getBudgetList();
    }, [user]);

    //Get Budget List
    const getBudgetList = async () => {
        const result = await db
            .select({
                ...getTableColumns(Budgets),

                totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
                totalItem: sql`count(${Expenses.id})`.mapWith(Number),
            })
            .from(Budgets)
            .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
            .groupBy(Budgets.id)
            .orderBy(desc(Budgets.id));
        setBudgetList(result);
        getAllExpenses();
        getIncomeList();
    };

    // Get Income List
    const getIncomeList = async () => {
        try {
            const result = await db
                .select({
                    ...getTableColumns(Incomes),
                    totalAmount: sql`SUM(CAST(${Incomes.amount} AS NUMERIC))`.mapWith(
                        Number
                    ),
                })
                .from(Incomes)
                .where(eq(Incomes.createdBy, user?.primaryEmailAddress.emailAddress))
                .groupBy(Incomes.id); // Assuming you want to group by ID or any other relevant column

            setIncomeList(result);
        } catch (error) {
            console.error("Error fetching income list:", error);
        }
    };

    // Get All Expenses
    const getAllExpenses = async () => {
        const result = await db
            .select({
                id: Expenses.id,
                name: Expenses.name,
                amount: Expenses.amount,
                createdAt: Expenses.createdAt,
            })
            .from(Budgets)
            .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
            .orderBy(desc(Expenses.id));
        setExpensesList(result);
    };

    return (
        <div className="p-8 pb-28">
            {/* <h2 className="font-bold text-4xl">Hi, {user?.firstName} 👋</h2> */}
            <p className="text-gray-500">
                Here's what's happenning with your money. Lets manage your expenses.
            </p>

            <CardInfo budgetList={budgetList} incomeList={incomeList} />
        </div>
    );
}

export default Dashboard;