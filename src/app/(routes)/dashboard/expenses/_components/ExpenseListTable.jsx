import { db } from "@/../utils/dbConfig";
import { Expenses } from "@/../utils/schema";
import { eq } from "drizzle-orm";
import React, { useState } from "react";
import { Button } from "@/./components/ui/button";
import { toast } from "sonner";
import { Trash } from "lucide-react";
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

function ExpenseListTable({ expensesList, refreshData }) {
  const [showAlert, setShowAlert] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });


  const handleButtonClick = () => {
    setShowAlert(true);
  };

  const deleteExpense = async (expense) => {
    const result = await db
      .delete(Expenses)
      .where(eq(Expenses.id, expense.id))
      .returning();

    if (result) {
      toast("Expense Deleted!");
      refreshData();
    }

    setShowAlert(false);
  };

  const handleSort = (column) => {
    let direction = 'asc';
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: column, direction });
  };

  const sortedExpenses = [...expensesList].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (direction === 'asc') {
      if (key === 'amount') {
        return a[key] - b[key]; // For numeric sorting (Amount)
      }
      return a[key].localeCompare(b[key]); // For string sorting (Name, Date)
    } else {
      if (key === 'amount') {
        return b[key] - a[key];
      }
      return b[key].localeCompare(a[key]);
    }
  });




  return (
    <div className="mt-3">
      <div className="grid grid-cols-4 rounded-tl-xl rounded-tr-xl bg-slate-200 p-2 mt-3">
        <h2 className="font-bold cursor-pointer" onClick={() => handleSort('name')}>Name</h2>
        <h2 className="font-bold cursor-pointer" onClick={() => handleSort('amount')}>Amount</h2>
        <h2 className="font-bold ml-5 cursor-pointer" onClick={() => handleSort('createdAt')}>Date</h2>
        <h2 className="font-bold ml-5">Delete</h2>
      </div>
      {sortedExpenses.map((expenses, index) => (
        <div key={index} className="grid grid-cols-4 bg-slate-50 rounded-bl-xl rounded-br-xl p-2">
          <h2>{expenses.name}</h2>
          <h2>${expenses.amount}</h2>
          <h2>{expenses.createdAt}

          </h2>
          <h2>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Trash
                  className="text-red-500 cursor-pointer ml-10"
                  onClick={handleButtonClick}
                />
              </AlertDialogTrigger>

              <div>
                {showAlert && (
                  <div>
                    {
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteExpense(expenses)}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    }
                  </div>
                )}
              </div>
            </AlertDialog>
          </h2>
        </div>
      ))}
    </div>
  )
};

export default ExpenseListTable;