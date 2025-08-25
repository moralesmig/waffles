"use client";
import React, { useState } from "react"; // Import useState
import ExpenseItem from "./ExpenseItem";

function ExpenseList({ expensesList }) {
    const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for descending, 'asc' for ascending
    const [sortField, setSortField] = useState('amount'); // 'amount' or 'createdAt'

    // Sort expenses by selected field
    const sortedExpenses = [...expensesList].sort((a, b) => {
        let valA = sortField === 'amount' ? a.amount : new Date(a.createdAt);
        let valB = sortField === 'amount' ? b.amount : new Date(b.createdAt);
        if (sortOrder === 'desc') {
            return valB - valA;
        } else {
            return valA - valB;
        }
    });

    return (
        <div className="mt-7 p-0">
            {/* Sorting Controls */}
            <div className="flex items-center mb-4 gap-2">
                <span className="block text-sm font-bold">Order by</span>
                <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="p-2 border rounded-md text-sm font-bold"
                >
                    <option value="amount">Amount</option>
                    <option value="createdAt">Date</option>
                </select>
                <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="p-2 border rounded-md w-auto text-sm font-bold hover:bg-gray-100"
                    title={sortOrder === 'desc' ? 'Descending' : 'Ascending'}
                >
                    {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
            </div>

            {/* Render Sorted Expenses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sortedExpenses.length > 0 ? (
                    sortedExpenses.map((expense, index) => (
                        <ExpenseItem expense={expense} key={expense.id || index} />
                    ))
                ) : (
                    <p className="text-gray-500">No expenses found for the selected filters.</p>
                )}
            </div>
        </div>
    );
}

export default ExpenseList;