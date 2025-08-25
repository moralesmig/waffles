import React, { useMemo } from "react";

function BudgetsSummary({ budgets, selectedMonth, selectedYear }) {
    // Calculate total amount for budgets with dueDate <= 15th of selected month/year
    const totalAmount = useMemo(() => {
        if (!budgets || !selectedMonth || !selectedYear) return 0;
        return budgets
            .filter((budget) => {
                if (!budget.dueDate) return false;
                // dueDate format: "YYYY-MM-DD"
                const [year, month, day] = budget.dueDate.split("-");
                return (
                    year === selectedYear &&
                    month === selectedMonth &&
                    Number(day) <= 15
                );
            })
            .reduce((sum, budget) => sum + Number(budget.amount || 0), 0);
    }, [budgets, selectedMonth, selectedYear]);

    return (
        <div className="mb-4">
            <h3 className="font-bold text-lg">Budgets Due on or Before 15th</h3>
            <div className="text-xl font-semibold">
                Total Amount: ${totalAmount.toLocaleString()}
            </div>
        </div>
    );
}

export default BudgetsSummary;