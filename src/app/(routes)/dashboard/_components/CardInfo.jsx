import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    PiggyBank,
    ReceiptText,
    Wallet,
    CircleDollarSign
} from "lucide-react";

function CardInfo({ budgetList, incomeList }) {
    const [currentBalance, setCurrentBalance] = useState(0);
    const [totalBudget, setTotalBudget] = useState(0);
    const [totalSpend, setTotalSpend] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [filteredBudgetList, setFilteredBudgetList] = useState([]);
    const [filteredIncomeList, setFilteredIncomeList] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const router = useRouter();

    // Set startDate to the first day of the current month and endDate to the last day of the current month
    useEffect(() => {
        const currentDate = new Date();
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const lastDayOfTheYear = new Date(currentDate.getFullYear(), 11, 31);


        setStartDate(firstDay.toISOString().split("T")[0]); // Convert to YYYY-MM-DD format
        setEndDate(lastDayOfTheYear.toISOString().split("T")[0]);
    }, []);

    // Calculate card information on data or date change
    useEffect(() => {
        if (budgetList.length > 0 || incomeList.length > 0) {
            applyDateFilter(); // Filter data by date
        }
    }, [budgetList, incomeList, startDate, endDate]);

    // Apply date filter to budgets and incomes
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

        setFilteredBudgetList(filteredBudgets);
        setFilteredIncomeList(filteredIncomes);
        calculateCardInfo(filteredBudgets, filteredIncomes);
    };

    // Calculate totals based on filtered data
    const calculateCardInfo = (budgets, incomes) => {
        let totalBudget_ = 0;
        let totalSpend_ = 0;
        let totalIncome_ = 0;

        budgets.forEach((budget) => {
            totalBudget_ += Number(budget.amount);
            totalSpend_ += budget.totalSpend;
        });

        incomes.forEach((income) => {
            totalIncome_ += income.totalAmount;
        });

        const currentBalance_ = totalIncome_ - totalSpend_;

        setTotalBudget(totalBudget_);
        setTotalSpend(totalSpend_);
        setTotalIncome(totalIncome_);
        setCurrentBalance(currentBalance_);
    };

    return (
        <div>
            {/* Date Filter Inputs
            <p className="font-bold pt-5">Filter by date</p>
            <div className="flex flex-col-2 items-center gap-2 pb-7 pt-2">
                <div className="">
                    <label className="block text-sm font-medium">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border rounded-md w-full"
                    />
                </div>
                <div className="">
                    <label className="block text-sm font-medium">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border rounded-md w-full"
                    />
                </div>
            </div>
            */}

            {/* Cards Section */}
            {filteredBudgetList?.length > 0 || filteredIncomeList?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div className="p-7 border rounded-2xl flex items-center justify-between bg-gray-100">
                        <div>
                            <h2 className="text-sm">Current Balance</h2>
                            <h2 className="font-bold text-2xl">
                                ${currentBalance.toFixed(2)}
                            </h2>
                        </div>
                        <Wallet className="bg-blue-800 p-3 h-12 w-12 rounded-full text-white" />
                    </div>

                    <div className="p-7 border rounded-2xl flex items-center justify-between" onClick={() => router.push('/dashboard/budgets')}>
                        <div>
                            <h2 className="text-sm">Total Budget</h2>
                            <h2 className="font-bold text-2xl">
                                ${totalBudget.toFixed(2)}
                            </h2>
                        </div>
                        <PiggyBank className="bg-blue-800 p-3 h-12 w-12 rounded-full text-white" />
                    </div>

                    <div className="p-7 border rounded-2xl flex items-center justify-between" onClick={() => router.push('/dashboard/incomes')}>
                        <div>
                            <h2 className="text-sm">Total Income</h2>
                            <h2 className="font-bold text-2xl">
                                ${totalIncome.toFixed(2)}
                            </h2>
                        </div>
                        <CircleDollarSign className="bg-blue-800 p-3 h-12 w-12 rounded-full text-white" />
                    </div>

                    <div className="p-7 border rounded-2xl flex items-center justify-between" onClick={() => router.push('/dashboard/expenses')}>
                        <div>
                            <h2 className="text-sm">Total Expenses</h2>
                            <h2 className="font-bold text-2xl">
                                ${totalSpend.toFixed(2)}
                            </h2>
                        </div>
                        <ReceiptText className="bg-blue-800 p-3 h-12 w-12 rounded-full text-white" />
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((item, index) => (
                        <div
                            className="h-[110px] w-full bg-slate-200 animate-pulse rounded-lg"
                            key={index}
                        ></div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CardInfo;
