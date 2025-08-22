import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PiggyBank, ReceiptText, Wallet, CircleDollarSign } from "lucide-react";

function CardInfo({ budgetList, incomeList }) {
    const [currentBalance, setCurrentBalance] = useState(0);
    const [totalBudget, setTotalBudget] = useState(0);
    const [totalSpend, setTotalSpend] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const router = useRouter();

    // Set default month and year to the current month and year
    useEffect(() => {
        const currentDate = new Date();
        const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0"); // MM format
        const currentYear = currentDate.getFullYear(); // YYYY format

        setSelectedMonth(currentMonth);
        setSelectedYear(currentYear);
    }, []);

    // Calculate current balance based on all incomes and expenses
    useEffect(() => {
        calculateCurrentBalance();
    }, [budgetList, incomeList]);

    const calculateCurrentBalance = () => {
        const totalIncome_ = incomeList.reduce((sum, income) => sum + Number(income.totalAmount), 0);
        const totalSpend_ = budgetList.reduce((sum, budget) => sum + Number(budget.totalSpend || 0), 0);

        setCurrentBalance(totalIncome_ - totalSpend_);
    };

    // Filter budgets and incomes based on selected month and year
    useEffect(() => {
        if (selectedMonth && selectedYear) {
            applyDateFilter(); // Trigger filtering when selectedMonth or selectedYear changes
        }
    }, [budgetList, incomeList, selectedMonth, selectedYear]);

    const applyDateFilter = () => {
        if (!selectedMonth || !selectedYear) return;

        const startDate = `${selectedYear}-${selectedMonth}-01`;
        const endDate = new Date(selectedYear, parseInt(selectedMonth, 10), 0).toISOString().split("T")[0]; // Last day of the month

        // Filter budgets
        const filteredBudgets = budgetList.filter((budget) => {
            const dueDate = budget.dueDate; // Assuming dueDate is in YYYY-MM-DD format
            return dueDate >= startDate && dueDate <= endDate;
        });

        // Filter incomes
        const filteredIncomes = incomeList.filter((income) => {
            const datePaid = income.datePaid; // Assuming datePaid is in YYYY-MM-DD format
            return datePaid >= startDate && datePaid <= endDate;
        });

        calculateFilteredTotals(filteredBudgets, filteredIncomes);
    };

    const calculateFilteredTotals = (budgets, incomes) => {
        const totalBudget_ = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
        const totalSpend_ = budgets.reduce((sum, budget) => sum + Number(budget.totalSpend || 0), 0);
        const totalIncome_ = incomes.reduce((sum, income) => sum + Number(income.totalAmount), 0);

        setTotalBudget(totalBudget_);
        setTotalSpend(totalSpend_);
        setTotalIncome(totalIncome_);
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card title="Current Balance" amount={currentBalance} icon={Wallet} />
            </div>

            <div className="flex gap-4 pb-7 pt-10">
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
                            const year = new Date().getFullYear() + 1 - i;
                            return <option key={year} value={year}>{year}</option>;
                        })}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card title="Total Budget" amount={totalBudget} icon={PiggyBank} onClick={() => router.push('/dashboard/budgets')} />
                <Card title="Total Income" amount={totalIncome} icon={CircleDollarSign} onClick={() => router.push('/dashboard/incomes')} />
                <Card title="Total Expenses" amount={totalSpend} icon={ReceiptText} onClick={() => router.push('/dashboard/expenses')} />
            </div>
        </div>
    );
}

const Card = ({ title, amount, icon: Icon, onClick }) => (
    <div className="p-7 border rounded-2xl flex items-center justify-between bg-gray-100" onClick={onClick}>
        <div>
            <h2 className="text-sm">{title}</h2>
            <h2 className="font-bold text-2xl">${amount.toFixed(2)}</h2>
        </div>
        <Icon className="bg-blue-800 p-3 h-12 w-12 rounded-full text-white" />
    </div>
);

export default CardInfo;