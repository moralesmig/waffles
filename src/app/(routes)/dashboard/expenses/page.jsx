"use client";

import { db } from '@/../utils/dbConfig';
import { Budgets, Expenses } from '@/../utils/schema';
import { desc, eq, sql } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import ExpenseList from './_components/ExpenseList';
import { useUser } from '@clerk/nextjs';
import CreateExpense from "../expenses/_components/CreateExpense";

function ExpensesScreen({ params }) {
  const [expensesList, setExpensesList] = useState([]);
  const [categories, setCategories] = useState([]); // Available budget categories
  const [filteredExpensesList, setFilteredExpensesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(""); // Selected category filter
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const { user } = useUser();

  // Set default month and year to the current month and year
  useEffect(() => {
    const currentDate = new Date();
    setSelectedMonth(String(currentDate.getMonth() + 1).padStart(2, "0")); // MM format
    setSelectedYear(currentDate.getFullYear().toString()); // YYYY format
  }, []);

  // Fetch data when the component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchBudgetCategories();
      fetchAllExpenses();
    }
  }, [user]);

  // Apply filters whenever the expenses list, selected month, year, or category changes
  useEffect(() => {
    if (expensesList.length > 0) {
      applyFilters();
    }
  }, [expensesList, selectedMonth, selectedYear, selectedCategory]);

  // Fetch budget categories
  const fetchBudgetCategories = async () => {
    setLoading(true);
    try {
      const result = await db
        .select({ id: Budgets.id, name: Budgets.name })
        .from(Budgets)
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));

      setCategories(result); // Ensure categories contain both id and name
      console.log("Fetched Categories:", result);
    } catch (error) {
      console.error("Error fetching budget categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all expenses
  const fetchAllExpenses = async () => {
    setLoading(true);
    try {
      const result = await db
        .select({
          id: Expenses.id,
          name: Expenses.name,
          amount: Expenses.amount,
          budgetId: Expenses.budgetId,
          createdAt: Expenses.createdAt,
        })
        .from(Expenses)
        .leftJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(Expenses.createdAt));

      setExpensesList(result);
      console.log("Fetched Expenses:", result);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to the expenses list
  const applyFilters = () => {
    let filteredExpenses = expensesList;

    // Filter by category
    if (selectedCategory) {
      const selectedBudget = categories.find(
        (category) => category?.name?.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
      );
      const selectedBudgetId = selectedBudget?.id;
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.budgetId === selectedBudgetId
      );
    }

    // Filter by month and year
    if (selectedMonth && selectedYear) {
      filteredExpenses = filteredExpenses.filter((expense) => {
        if (!expense.createdAt) return false;
        // createdAt is a string "YYYY-MM-DD"
        const [year, month] = expense.createdAt.split("-");
        // month is "08" for August, year is "2025"
        return month === selectedMonth && year === selectedYear;
      });
    }

    setFilteredExpensesList(filteredExpenses);
  };

  return (
    <div className="p-10 pb-28">
      <div className="flex">
        <h2 className="font-bold text-3xl">My Expenses</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7">
        <CreateExpense
          budgetId={params.id}
          user={user}
          refreshData={() => fetchAllExpenses()}
        />
      </div>

      {/* Filter by Date */}
      <div className="flex gap-4 pb-7 pt-7">
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
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Filter by Category */}
      <p className="font-bold mt-5">Filter by budget</p>
      <div className="flex flex-col gap-2 pb-7 pt-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-md w-full"
        >
          <option value="">All Categories</option>
          {categories
            .slice() // create a copy to avoid mutating state
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading expenses...</p>}

      {/* Display Expenses List */}
      <div>
        {filteredExpensesList?.length > 0 ? (
          <ExpenseList refreshData={() => fetchAllExpenses()} expensesList={filteredExpensesList} />
        ) : (
          !loading && <p className="text-gray-500">No expenses found for the selected filters.</p>
        )}
      </div>
    </div>
  );
}

export default ExpensesScreen;