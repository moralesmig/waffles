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
import { Budgets } from "@/../utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
function EditBudget({ budgetInfo, refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState(budgetInfo?.icon);
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [dueDate, setDate] = useState();
  const [name, setName] = useState();
  const [amount, setAmount] = useState();
  const { user } = useUser();

  useEffect(() => {
    if (budgetInfo) {
      setEmojiIcon(budgetInfo?.icon);
      setAmount(budgetInfo.amount);
      setName(budgetInfo.name);
      setDate(budgetInfo.dueDate);
    }
  }, [budgetInfo]);
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
    </div>
  );
}

export default EditBudget;
