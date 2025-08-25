"use client";
import { Button } from "@/./components/ui/button";
import { PenBox } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/./components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/./components/ui/input";
import { db } from "@/../utils/dbConfig";
import { Budgets, Expenses } from "@/../utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";

function EditBudget({ budgetInfo, refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState(budgetInfo?.icon);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [dueDate, setDate] = useState();
  const [name, setName] = useState();
  const [amount, setAmount] = useState();
  const [expenses, setExpenses] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    if (budgetInfo) {
      setEmojiIcon(budgetInfo?.icon);
      setAmount(budgetInfo.amount);
      setName(budgetInfo.name);
      setDate(budgetInfo.dueDate);
      fetchExpenses();
    }
    // eslint-disable-next-line
  }, [budgetInfo]);

  const fetchExpenses = async () => {
    if (!budgetInfo?.id) return;
    try {
      const result = await db
        .select({
          id: Expenses.id,
          name: Expenses.name,
          amount: Expenses.amount,
          createdAt: Expenses.createdAt,
        })
        .from(Expenses)
        .where(eq(Expenses.budgetId, budgetInfo.id));
      setExpenses(result);
    } catch (error) {
      console.error("Error fetching expenses for budget:", error);
    }
  };

  const onUpdateBudget = async () => {
    const result = await db
      .update(Budgets)
      .set({
        name: name,
        amount: amount,
        dueDate: dueDate,
        icon: emojiIcon,
      })
      .where(eq(Budgets.id, budgetInfo.id))
      .returning();

    if (result) {
      refreshData();
      toast("Budget Updated!");
    }
  };

  return (
    <div>
      <div className="mt-5">
        <Button
          variant="outline"
          className="text-lg"
          onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
        >
          {emojiIcon}
        </Button>
        <div className="absolute z-20">
          <EmojiPicker
            open={openEmojiPicker}
            onEmojiClick={(e) => {
              setEmojiIcon(e.emoji);
              setOpenEmojiPicker(false);
            }}
          />
        </div>
        <div className="mt-2">
          <h2 className="text-black font-medium my-1 text-left pl-2">Name</h2>
          <Input
            placeholder="Description"
            defaultValue={budgetInfo?.name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mt-5">
          <h2 className="text-black font-medium my-1 text-left pl-2">Amount</h2>
          <Input
            type="number"
            defaultValue={budgetInfo?.amount}
            placeholder="$0"
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="mt-5">
          <h2 className="text-black font-medium my-1 text-left pl-2">Due Date (optional)</h2>
          <Input
            type="date"
            defaultValue={budgetInfo?.dueDate}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      <Button
        disabled={!(name && amount)}
        onClick={() => onUpdateBudget()}
        className="mt-5 w-full rounded-full"
      >
        Update Budget
      </Button>
      {/* List of expenses for this budget */}
      <div className="mt-12 pt-10">
        <h3 className="font-bold text-lg mb-2">Expenses for this budget: </h3>
        {expenses.length > 0 ? (
          <ul className="space-y-2">
            {expenses.map((expense) => (
              <li key={expense.id} className="border p-2 rounded">
                <div className="flex justify-between">
                  <span className="font-medium">{expense.name}</span>
                  <span className="text-right">${expense.amount}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {expense.createdAt
                    ? (() => {
                      // If stored as "YYYY-MM-DD", split and reformat
                      const [year, month, day] = expense.createdAt.split("-");
                      return `${month}/${day}/${year}`;
                    })()
                    : ""}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No expenses for this budget.</p>
        )}
      </div>
    </div>
  );
}

export default EditBudget;