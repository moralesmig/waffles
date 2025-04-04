"use client";
import { db } from "@/../utils/dbConfig";
import { Expenses } from "@/../utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { Button } from "@/./components/ui/button";
import { ArrowLeft, Pen, PenBox, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/./components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import EditExpense from "../_components/EditExpense";
import ExpenseItem from "../_components/ExpenseItem"

function ExpenseScreen({ params }) {
  const { user } = useUser();
  const [expenseInfo, setExpenseInfo] = useState();
  const [ExpenseList, setExpenseList] = useState([]);
  const route = useRouter();
  useEffect(() => {
    user && getExpenseInfo();
  }, [user]);

  /**
   * Get Expense Information
   */
  const getExpenseInfo = async () => {
    const result = await db
      .select()
      .from(Expenses)
      .where(eq(Expenses.id, params.id))
      .orderBy(desc(Expenses.id))

    setExpenseInfo(result[0]);
  };

  /**
 * Used to Delete Expense
 */
  const deleteExpense = async () => {
    const deleteExpenseResult = await db
      .delete(Expenses)
      .where(eq(Expenses.id, params.id))
      .returning();

    if (deleteExpenseResult) {
      const result = await db
        .delete(Expenses)
        .where(eq(Expenses.id, params.id))
        .returning();
    }
    toast("Expense Deleted!");
    route.replace("/dashboard/expenses");
  };


  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold gap-2 flex justify-between items-center">
        <ArrowLeft onClick={() => route.replace('/dashboard/expenses')} className="cursor-pointer mt-1" />
        <span className="flex gap-2 items-center">
          <p>Edit Expense</p>
        </span>
        <div className="flex gap-2 items-center">


          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="flex gap-2 rounded-full" variant="destructive">
                <Trash className="w-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone and will permanenly delete the selected expense.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteExpense()}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </h2>


      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-5">
        <EditExpense expenseInfo={expenseInfo} refreshData={() => getExpenseInfo()} />
      </div>

    </div>
  );
}

export default ExpenseScreen;
