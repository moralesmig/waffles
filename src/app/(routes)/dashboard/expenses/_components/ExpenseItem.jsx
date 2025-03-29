import Link from "next/link";
import React, { useEffect, useState } from "react";
import { parseISO, format } from "date-fns";
import { db } from "@/../utils/dbConfig"; // Assuming db is configured here
import { Budgets } from "@/../utils/schema"; // Assuming Budgets schema is available
import { eq } from "drizzle-orm";

function ExpenseItem({ expense }) {
    // change date paid format
    const parsedDate = parseISO(expense?.createdAt);
    const formattedDate = format(parsedDate, "MMM d, yyyy");

    const [budgetCategory, setBudgetCategory] = useState(null);

    useEffect(() => {
        // Fetch the budget name using the budgetId from the expense
        if (expense?.budgetId) {
            const fetchBudgetCategory = async () => {
                const budgetResult = await db
                    .select()
                    .from(Budgets)
                    .where(eq(Budgets.id, expense.budgetId))
                    .limit(1); // Assuming each expense belongs to one budget

                if (budgetResult.length > 0) {
                    setBudgetCategory(budgetResult[0]?.name); // Set the budget name as category
                }
            };

            fetchBudgetCategory();
        }
    }, [expense?.budgetId]); // Only fetch when expense.budgetId is available

    return (
        <Link href={"/dashboard/expenses/" + expense?.id}>
            <div className="p-5 border rounded-2xl hover:shadow-md cursor-pointer h-[100px]">
                <div className="flex gap-2 items-center justify-between">
                    <div className="flex gap-2 items-center">
                        <div>
                            <h2 className="font-bold">{expense.name}</h2>
                            {budgetCategory && (
                                <h2 className="text-sm text-gray-500">{budgetCategory}</h2>
                            )}
                            <h2 className="text-sm text-gray-500">{formattedDate}</h2>
                        </div>
                    </div>
                    <h2 className="font-bold text-primary text-lg">${expense.amount}</h2>
                </div>
            </div>
        </Link>
    );
}

export default ExpenseItem;
