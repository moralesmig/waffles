"use client";
import { Button } from "@/./components/ui/button";
import React, { useEffect, useState } from "react";
import { Input } from "@/./components/ui/input";
import { db } from "@/../utils/dbConfig";
import { Expenses } from "@/../utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";

function EditExpense({ expenseInfo, refreshData }) {
    const [name, setName] = useState();
    const [amount, setAmount] = useState();
    const [createdAt, setDate] = useState();

    useEffect(() => {
        if (expenseInfo) {
            setName(expenseInfo.name);
            setAmount(expenseInfo.amount);
            // Format the date to "YYYY-MM-DD"
            const formattedDate = new Date(expenseInfo.createdAt).toISOString().split("T")[0];
            setDate(formattedDate);
        }
    }, [expenseInfo]);

    const onUpdateExpense = async () => {
        const result = await db
            .update(Expenses)
            .set({
                name: name,
                amount: amount,
                createdAt: createdAt,
            })
            .where(eq(Expenses.id, expenseInfo.id))
            .returning();

        if (result) {
            refreshData();
            toast("Expense Updated!");
        }
    };

    return (
        <div>
            <div className="mt-5">
                <div className="mt-2">
                    <h2 className="text-black font-medium my-1">Name</h2>
                    <Input
                        placeholder="e.g. Home Decor"
                        defaultValue={expenseInfo?.name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="mt-2">
                    <h2 className="text-black font-medium my-1">Amount</h2>
                    <Input
                        type="number"
                        defaultValue={expenseInfo?.amount}
                        placeholder="e.g. $5000"
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <div className="mt-2">
                    <h2 className="text-black font-medium my-1">Date</h2>
                    <Input
                        type="date"
                        value={createdAt}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>
            <Button
                disabled={!(name && amount)}
                onClick={() => onUpdateExpense()}
                className="mt-5 w-full rounded-full"
            >
                Update Expense
            </Button>
        </div>
    );
}

export default EditExpense;
