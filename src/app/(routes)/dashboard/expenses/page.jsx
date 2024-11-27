"use client"
import { db } from '@/../utils/dbConfig';
import { Budgets, Expenses } from '@/../utils/schema';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react'
import ExpenseListTable from './_components/ExpenseListTable';
import { useUser } from '@clerk/nextjs';
import { useRouter } from "next/navigation";

function ExpensesScreen() {
  const [expensesList, setExpensesList] = useState([]);
  const { user } = useUser();
  const route = useRouter();

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
    <div className='p-10'>
      <div className='flex'>
        <h2 className='font-bold text-3xl'>My Expenses</h2>
        <div className="ml-10 mt-2 pl-8">
        </div>
      </div>

      <ExpenseListTable refreshData={() => getAllExpenses()}
        expensesList={expensesList}
      />
    </div >
  )
}

export default ExpensesScreen;