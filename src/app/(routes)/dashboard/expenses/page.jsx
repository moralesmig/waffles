"use client"
import { db } from '@/../utils/dbConfig';
import { Budgets, Expenses } from '@/../utils/schema';
import { desc, eq, getTableColumns, sql } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import ExpenseListTable from './_components/ExpenseListTable';
import { useUser } from '@clerk/nextjs';
import { useRouter } from "next/navigation";
import CreateExpense from "..//expenses/_components/CreateExpense";

function ExpensesScreen({ params }) {
  const [expensesList, setExpensesList] = useState([]);
  const { user } = useUser();
  const [budgetInfo, setbudgetInfo] = useState();
  const route = useRouter();

  useEffect(() => {
    user && getBudgetInfo();
  }, [user]);

  /**
 * Get Budget Information
 */
  const getBudgetInfo = async () => {
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
  };


  useEffect(() => {
    user && getAllExpenses();
  }, [user])
  /**
 * Used to get All expenses belong to users
 */
  const getAllExpenses = async () => {
    const result = await db.select({
      id: Expenses.id,
      name: Expenses.name,
      amount: Expenses.amount,
      createdAt: Expenses.createdAt
    }).from(Budgets)
      .rightJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
      .where(eq(Budgets.createdBy, user?.primaryEmailAddress.emailAddress))
      .orderBy(desc(Expenses.id));
    setExpensesList(result);

  }
  return (
    <div className='p-10  pb-28'>
      <div className='flex'>
        <h2 className='font-bold text-3xl'>My Expenses</h2>
        <div className="ml-10 mt-2 pl-8">
        </div>
      </div>


      <div className='grid grid-cols-1
        md:grid-cols-2 lg:grid-cols-3 gap-5 mt-7'>
        <CreateExpense
          budgetId={params.id}
          user={user}
          refreshData={() => getAllExpenses()}
        />
      </div>


      <ExpenseListTable refreshData={() => getAllExpenses()}
        expensesList={expensesList}
      />
    </div >
  )
}

export default ExpensesScreen;