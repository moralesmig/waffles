"use client";
import { Button } from "@/./components/ui/button";
import React, { useEffect, useState } from "react";
import { Input } from "@/./components/ui/input";
import { db } from "@/../utils/dbConfig";
import { Expenses, Budgets } from "@/../utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

function EditExpense({ expenseInfo, refreshData }) {
    const [name, setName] = useState();
    const [amount, setAmount] = useState();
    const [createdAt, setDate] = useState();
    const [budgetId, setBudgetId] = useState();
    const [budgets, setBudgets] = useState([]);
    const { user } = useUser(); // <-- Add this line for user context


    // Fetch all budgets for dropdown
    const fetchBudgets = async () => {
        try {
            const result = await db
                .select({ id: Budgets.id, name: Budgets.name })
                .from(Budgets)
                .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));
            setBudgets(result);
        } catch (error) {
            console.error("Error fetching budgets:", error);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    useEffect(() => {
        if (expenseInfo) {
            setName(expenseInfo.name);
            setAmount(expenseInfo.amount);
            const formattedDate = new Date(expenseInfo.createdAt).toISOString().split("T")[0];
            setDate(formattedDate);
            setBudgetId(expenseInfo.budgetId); // Default to the expense's budgetId
        }
    }, [expenseInfo]);

    const onUpdateExpense = async () => {
        const result = await db
            .update(Expenses)
            .set({
                name: name,
                amount: amount,
                createdAt: createdAt,
                budgetId: budgetId,
            })
            .where(eq(Expenses.id, expenseInfo.id))
            .returning();

        if (result) {
            refreshData();
            toast("Expense Updated!");
        }
    };

    // Sort budgets alphabetically by name
    const sortedBudgets = budgets.slice().sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div>
            <div className="mt-5">
                <div className="mt-2">
                    <h2 className="text-black font-medium my-1">Name</h2>
                    <Input
                        placeholder="e.g. Home Decor"
                        value={name || ""}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="mt-2">
                    <h2 className="text-black font-medium my-1">Amount</h2>
                    <Input
                        type="number"
                        value={amount || ""}
                        placeholder="e.g. $5000"
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <div className="mt-2">
                    <h2 className="text-black font-medium my-1">Date</h2>
                    <Input
                        type="date"
                        value={createdAt || ""}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
                <div className="mt-2">
                    <h2 className="text-black font-medium my-1">Budget</h2>
                    <select
                        value={budgetId || ""}
                        onChange={(e) => setBudgetId(Number(e.target.value))}
                        className="p-2 border rounded-md w-full"
                    >
                        <option value="">Select Budget</option>
                        {sortedBudgets.map((budget) => (
                            <option key={budget.id} value={budget.id}>
                                {budget.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <Button
                disabled={!(name && amount && budgetId)}
                onClick={onUpdateExpense}
                className="mt-5 w-full rounded-full"
            >
                Update Expense
            </Button>
        </div>
    );
}

export default EditExpense;