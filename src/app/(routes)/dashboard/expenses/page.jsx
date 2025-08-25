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
  const [categories, setCategories] = useState([]); // To store available budget categories
  const [filteredExpensesList, setFilteredExpensesList] = useState([]);
  const [budgetInfo, setbudgetInfo] = useState();
  const [selectedCategory, setSelectedCategory] = useState(""); // State for selected category filter
  const { user } = useUser();

  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false); // Default to false to avoid unnecessary "Loading..." message

  // Set default month and year to the current month and year
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0"); // MM format
    const currentYear = currentDate.getFullYear(); // YYYY format

    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
  }, []);

  // Apply filters whenever the expenses list, selected month, year, or category changes
  useEffect(() => {
    if (expensesList.length > 0) {
      applyFilters(); // Apply both date and category filters
    }
  }, [expensesList, selectedMonth, selectedYear, selectedCategory]);

  // Apply date and category filters to expenses
  const applyFilters = () => {
    let filteredExpenses = [];
    if (selectedCategory) {
      // Find the budgetId for the selected Budgets.name from categories (which should be Budgets)
      const selectedBudgetObj = budgetInfo && budgetInfo.name && budgetInfo.id
        ? { name: budgetInfo.name, id: budgetInfo.id }
        : null;
      // If categories is an array of budget objects, find by name
      // Otherwise, fallback to searching in expensesList
      let selectedBudgetId = null;
      if (Array.isArray(categories) && categories.length && typeof categories[0] === 'object' && categories[0].name && categories[0].id) {
        selectedBudgetId = categories.find(
          (cat) => cat.name && cat.name.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
        )?.id;
      } else if (selectedBudgetObj && selectedBudgetObj.name.trim().toLowerCase() === selectedCategory.trim().toLowerCase()) {
        selectedBudgetId = selectedBudgetObj.id;
      } else {
        selectedBudgetId = expensesList.find(
          (expense) => expense.budgetName && expense.budgetName.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
        )?.budgetId;
      }
      console.log('Selected Category:', selectedCategory);
      console.log('Selected BudgetId:', selectedBudgetId);
      console.log('All Expenses:', expensesList);
      filteredExpenses = expensesList.filter((expense) => {
        if (!expense.budgetId) return false;
        const matchesCategory = expense.budgetId === selectedBudgetId;
        if (!matchesCategory) return false;
        if (selectedMonth && selectedYear) {
          if (!expense.createdAt) return false;
          const expenseDate = new Date(expense.createdAt);
          const expenseMonth = String(expenseDate.getMonth() + 1).padStart(2, "0");
          const expenseYear = expenseDate.getFullYear();
          return expenseMonth === selectedMonth && expenseYear === parseInt(selectedYear, 10);
        }
        return true;
      });
      console.log('Filtered Expenses:', filteredExpenses);
    } else if (selectedMonth && selectedYear) {
      // Filter by month/year if no category selected
      filteredExpenses = expensesList.filter((expense) => {
        if (!expense.createdAt) return false;
        const expenseDate = new Date(expense.createdAt);
        const expenseMonth = String(expenseDate.getMonth() + 1).padStart(2, "0");
        const expenseYear = expenseDate.getFullYear();
        return expenseMonth === selectedMonth && expenseYear === parseInt(selectedYear, 10);
      });
      console.log('Filtered Expenses by Month/Year:', filteredExpenses);
    } else {
      // If nothing selected, show nothing
      filteredExpenses = [];
      console.log('No selection, showing nothing.');
    }
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
          id: Budgets.id,
          name: Budgets.name,
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

  setCategories(categoriesResult.map((budget) => budget.name).sort((a, b) => a.localeCompare(b))); // Set categories alphabetically
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
      budgetId: Expenses.budgetId,
      createdAt: Expenses.createdAt,
    }).from(Expenses)
      .leftJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress?.emailAddress))
      .orderBy(desc(Expenses.createdAt));

    // Only include expenses that have a valid budgetName and budgetId
    setExpensesList(result.filter(exp => exp.budgetName && exp.budgetId));
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
              const year = new Date().getFullYear() + 1 - i;
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