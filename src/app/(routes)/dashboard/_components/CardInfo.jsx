import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PiggyBank, ReceiptText, Wallet, CircleDollarSign } from "lucide-react";

function CardInfo({ budgetList, incomeList }) {
    const [currentBalance, setCurrentBalance] = useState(0);
    const [totalBudget, setTotalBudget] = useState(0);
    const [totalSpend, setTotalSpend] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const router = useRouter();

    useEffect(() => {
        const currentDate = new Date();
        const firstDayOfTheYear = new Date(currentDate.getFullYear(), 0, 1);
        const lastDayOfTheYear = new Date(currentDate.getFullYear(), 11, 31);

        setStartDate(firstDayOfTheYear.toISOString().split("T")[0]);
        setEndDate(lastDayOfTheYear.toISOString().split("T")[0]);
    }, []);

    useEffect(() => {
        applyDateFilter();
        calculateCurrentBalance();
    }, [budgetList, incomeList, startDate, endDate]);

    const calculateCurrentBalance = () => {
        let totalSpend_ = budgetList.reduce((sum, budget) => sum + budget.totalSpend, 0);
        let totalIncome_ = incomeList.reduce((sum, income) => sum + income.totalAmount, 0);
        setCurrentBalance(totalIncome_ - totalSpend_);
    };

    const applyDateFilter = () => {
        const filteredBudgets = budgetList.filter((budget) => {
            const budgetDate = new Date(budget.dueDate);
            return (!startDate || budgetDate >= new Date(startDate)) &&
                (!endDate || budgetDate <= new Date(endDate));
        });

        const filteredIncomes = incomeList.filter((income) => {
            const incomeDate = new Date(income.datePaid);
            return (!startDate || incomeDate >= new Date(startDate)) &&
                (!endDate || incomeDate <= new Date(endDate));
        });

        calculateCardInfo(filteredBudgets, filteredIncomes);
    };

    const calculateCardInfo = (budgets, incomes) => {
        let totalBudget_ = budgets.reduce((sum, budget) => sum + Number(budget.amount), 0);
        let totalSpend_ = budgets.reduce((sum, budget) => sum + budget.totalSpend, 0);
        let totalIncome_ = incomes.reduce((sum, income) => sum + income.totalAmount, 0);

        setTotalBudget(totalBudget_);
        setTotalSpend(totalSpend_);
        setTotalIncome(totalIncome_);
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <Card title="Current Balance" amount={currentBalance} icon={Wallet} />
            </div>
            <p className="font-bold pt-5">Filter by date</p>
            <div className="flex gap-2 pb-7 pt-2">
                <div>
                    <label className="block text-sm font-medium">Start Date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 border rounded-md w-full" />
                </div>
                <div>
                    <label className="block text-sm font-medium">End Date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 border rounded-md w-full" />
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
