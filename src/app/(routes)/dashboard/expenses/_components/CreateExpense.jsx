"use client";
import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/./components/ui/dialog";
import { Button } from "@/./components/ui/button";
import { Input } from "@/./components/ui/input";
import { db } from "@/../utils/dbConfig";
import { Budgets, Expenses } from "@/../utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { desc, eq, getTableColumns } from 'drizzle-orm';
import { Loader } from "lucide-react";
import moment from "moment";


function CreateExpense({ refreshData }) {
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [budgetId, setBudgetId] = useState("");
    const [createdAt, setCreatedAt] = useState("");
    const [budgetList, setBudgetList] = useState([]);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);


    // Default today's date
    useEffect(() => {
        const getCentralTimeDate = () => {
            const now = new Date();
            const centralTime = new Intl.DateTimeFormat("en-CA", {
                timeZone: "America/Chicago",
                dateStyle: "short",
            }).format(now);

            return centralTime.replace(/\//g, "-"); // Ensures `YYYY-MM-DD` format for input date compatibility
        };

        setCreatedAt(getCentralTimeDate());
    }, []);

    // Fetch the budgets from the database
    useEffect(() => {
        const fetchBudgets = async () => {
            const result = await db.select({
                ...getTableColumns(Budgets)
            }).from(Budgets)
                .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
                .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
                .groupBy(Budgets.id)
                .orderBy(desc(Budgets.id));
            setBudgetList(result);
        };
        fetchBudgets();
    }, []);

    // Create new expense
    const onCreateExpense = async () => {
        if (!budgetId) {
            toast.error("Please select a budget!");
            return;
        }

        setLoading(true);
        const result = await db
            .insert(Expenses)
            .values({
                name: name,
                amount: amount,
                budgetId: budgetId,
                createdAt: moment().format("MM/DD/yyyy"),
            })
            .returning({ insertedId: Budgets.id });

        setAmount("");
        setName("");
        setBudgetId("");
        if (result) {
            setLoading(false);
            refreshData();
            toast("New Expense Added!");
        }
        setLoading(false);
    };

    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="bg-slate-100 p-3 rounded-2xl items-center flex flex-col border-2 border-dashed cursor-pointer hover:shadow-md mb-2" >
                        <h2 className="text-3xl">+</h2>
                        <h2>Create New Expense</h2>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Expense</DialogTitle>
                        <DialogDescription>
                            <div className="mt-5">
                                <div className="mt-2">
                                    <h2 className="text-black font-medium my-1">Name</h2>
                                    <Input
                                        type="text"
                                        placeholder="Description"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="mt-2">
                                    <h2 className="text-black font-medium my-1">Amount</h2>
                                    <Input
                                        type="number"
                                        placeholder="$0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="mt-2">
                                    <h2 className="text-black font-medium my-1">Date</h2>
                                    <Input
                                        type="date"
                                        value={createdAt}
                                        onChange={(e) => setCreatedAt(e.target.value)}
                                    />
                                </div>
                                <div className="mt-2">
                                    <h2 className="text-black font-medium my-1">Select Budget</h2>
                                    <select
                                        value={budgetId}
                                        onChange={(e) => setBudgetId(e.target.value)}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="">Select a Budget</option>
                                        {budgetList.map((budget) => (
                                            <option key={budget.id} value={budget.id}>
                                                {budget.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button
                                disabled={!(name && amount && budgetId) || loading}
                                onClick={onCreateExpense}
                                className="mt-3 w-full rounded-full"
                            >
                                {loading ? <Loader className="animate-spin" /> : "Add New Expense"}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CreateExpense;