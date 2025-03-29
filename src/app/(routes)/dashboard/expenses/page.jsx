"use client";

import { db } from '@/../utils/dbConfig';
import { Budgets, Expenses } from '@/../utils/schema';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import ExpenseList from './_components/ExpenseList';
import { useUser } from '@clerk/nextjs';
import CreateExpense from "../expenses/_components/CreateExpense";

function ExpensesScreen({ params }) {
  const [expensesList, setExpensesList] = useState([]);
  const [categories, setCategories] = useState([]); // To store available budget categories
  const { user } = useUser();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredExpensesList, setFilteredExpensesList] = useState([]);
  const [budgetInfo, setbudgetInfo] = useState();
  const [loading, setLoading] = useState(true); // Loading state to show until budgets are fetched
  const [selectedCategory, setSelectedCategory] = useState(""); // State for selected category filter

  // Set start date and end date
  useEffect(() => {
    const currentDate = new Date();
    const firstDayOfTheYear = new Date(currentDate.getFullYear(), 0, 1);
    const lastDayOfTheYear = new Date(currentDate.getFullYear(), 11, 31);
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    setStartDate(firstDayOfTheYear.toISOString().split("T")[0]); // Convert to YYYY-MM-DD format
    setEndDate(lastDayOfTheYear.toISOString().split("T")[0]);
  }, []);

  // Calculate card information on data or date change
  useEffect(() => {
    if (expensesList.length > 0) {
      applyFilters(); // Apply both date and category filter
    }
  }, [expensesList, startDate, endDate, selectedCategory]);

  // Apply date and category filter to expenses
  const applyFilters = () => {
    const filteredExpenses = expensesList.filter((expense) => {
      const expenseDate = new Date(expense.createdAt);
      const matchesDateRange = (!startDate || expenseDate >= new Date(startDate)) &&
        (!endDate || expenseDate <= new Date(endDate));

      const matchesCategory = selectedCategory ? expense.budgetName === selectedCategory : true;

      return matchesDateRange && matchesCategory;
    });

    setFilteredExpensesList(filteredExpenses);
  };

  useEffect(() => {
    user && getBudgetInfo();
    user && getAllExpenses();
  }, [user]);

  // Get Budget Information (including categories)
  const getBudgetInfo = async () => {
    setLoading(true); // Set loading to true while fetching data

    try {
      const result = await db
        .select({
          ...getTableColumns(Budgets),
          totalSpend: sql`sum(${Expenses.amount})`.mapWith(Number),
          totalItem: sql`count(${Expenses.id})`.mapWith(Number),
        })
        .from(Budgets)
        .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
        .where(eq(Budgets.id, params.id))
        .groupBy(Budgets.id);

      setbudgetInfo(result[0]);
      setLoading(false); // Set loading to false once data is fetched

      // Fetch categories (budget names)
      const categoriesResult = await db
        .select({ name: Budgets.name })
        .from(Budgets)
        .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress));

      setCategories(categoriesResult.map((budget) => budget.name)); // Set categories
    } catch (error) {
      console.error("Error fetching expense:", error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  // Get All Expenses
  const getAllExpenses = async () => {
    const result = await db.select({
      id: Expenses.id,
      name: Expenses.name,
      amount: Expenses.amount,
      createdAt: Expenses.createdAt,
      budgetName: Budgets.name // Add budget name for filtering
    }).from(Expenses)
      .rightJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
      .orderBy(desc(Expenses.id));

    setExpensesList(result);
  };

  return (
    <div className='p-10 pb-28'>
      <div className='flex'>
        <h2 className='font-bold text-3xl'>My Expenses</h2>
      </div>

      <div className='grid grid-cols-1
        md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7'>
        <CreateExpense
          budgetId={params.id}
          user={user}
          refreshData={() => getAllExpenses()}
        />
      </div>

      {/* Filter by Date */}
      <p className="font-bold pt-5">Filter by date</p>
      <div className="flex flex-col-2 items-center gap-2 pt-2">
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

      {/* Filter by Category */}
      <p className="font-bold mt-5">Filter by category</p>
      <div className="flex flex-col gap-2 pb-7 pt-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded-md w-full"
        >
          <option value="">All Categories</option>
          {categories.map((category, index) => (
            <option key={index} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && <p className="text-gray-500">Loading expenses...</p>}

      {/* Display Expenses List */}
      <div>
        {filteredExpensesList?.length > 0 ? (
          <ExpenseList refreshData={() => getAllExpenses()} expensesList={filteredExpensesList} />
        ) : (
          !loading && <p className="text-gray-500">No expenses found for the selected date range and category.</p>
        )}
      </div>
    </div>
  );
}

export default ExpensesScreen;
