"use client";
import React, { useState, useEffect } from "react";
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
import { Button } from "@/./components/ui/button";
import { Input } from "@/./components/ui/input";
import { db } from "@/../utils/dbConfig"
import { Incomes } from "@/../utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

function CreateIncomes({ refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState("💵");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState();
  const [amount, setAmount] = useState();
  const [datePaid, setDate] = useState();
  const { user } = useUser();

  // Default today's date
  useEffect(() => {
    const getCentralTimeDate = () => {
      const now = new Date();
      const centralTime = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Chicago",
        dateStyle: "short",
      }).format(now);

      return centralTime.replace(/\//g, "-"); // Ensures `YYYY-MM-DD` format for input date compatibility
    };

    setDate(getCentralTimeDate());
  }, []);

  // Create New Budget
  const onCreateIncomes = async () => {

    const result = await db
      .insert(Incomes)
      .values({
        name: name,
        amount: amount,
        icon: emojiIcon,
        createdBy: user?.primaryEmailAddress?.emailAddress,
        datePaid: datePaid,
      })
      .returning({ insertedId: Incomes.id });

    if (result) {
      refreshData();
      toast("New Income Source Created!");
    }
  };
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <div
            className="bg-slate-100 p-3 rounded-2xl
            items-center flex flex-col border-2 border-dashed
            cursor-pointer hover:shadow-md"
          >
            <h2 className="text-3xl">+</h2>
            <h2>Create New Income Source</h2>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Income Source</DialogTitle>
            <DialogDescription>
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
                  <h2 className="text-black font-medium my-1">Name</h2>
                  <Input
                    placeholder="Description"
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="mt-2">
                  <h2 className="text-black font-medium my-1">Amount</h2>
                  <Input
                    type="number"
                    placeholder="$0"
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="mt-2">
                  <h2 className="text-black font-medium my-1">Pay Date</h2>
                  <Input
                    type="date"
                    value={datePaid}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button
                disabled={!(name && amount)}
                onClick={() => onCreateIncomes()}
                className="mt-5 w-full rounded-full"
              >
                Create Income Source
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateIncomes;
