"use client";

import React, { useState } from "react";
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
import { db } from "@/../utils/dbConfig";
import { Budgets } from "@/../utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

function CreateBudget({ refreshData }) {
    const [emojiIcon, setEmojiIcon] = useState("💰");
    const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const { user } = useUser();

    // Handle date change without manual time zone conversion
    const handleDateChange = (e) => {
        setDueDate(e.target.value); // The input gives the date in YYYY-MM-DD format
    };

    // Create New Budget
    const onCreateBudget = async () => {
        // Directly use the dueDate without conversion since it's in YYYY-MM-DD format already
        if (!dueDate || !name || !amount) {
            toast.error("Please fill in all fields.");
            return;
        }

        try {
            const result = await db
                .insert(Budgets)
                .values({
                    name: name,
                    amount: amount,
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    dueDate: dueDate, // Use the dueDate directly
                    icon: emojiIcon,
                })
                .returning({ insertedId: Budgets.id });

            if (result) {
                refreshData();
                toast.success("New Budget Created!");
            }
        } catch (error) {
            console.error("Error creating budget:", error);
            toast.error("Failed to create budget.");
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
                        <h2>Create New Budget</h2>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Budget</DialogTitle>
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
                                    <h2 className="text-black font-medium my-1 text-left pl-2">Name</h2>
                                    <Input
                                        type="text"
                                        placeholder="Description"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="mt-5">
                                    <h2 className="text-black font-medium my-1 text-left pl-2">Amount</h2>
                                    <Input
                                        type="number"
                                        placeholder="$0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="mt-5">
                                    <h2 className="text-black font-medium my-1 text-left pl-2">Due Date (optional)</h2>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={handleDateChange}
                                    />
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button
                                disabled={!(name && amount && dueDate)}
                                onClick={onCreateBudget}
                                className="mt-5 w-full rounded-full"
                            >
                                Create Budget
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CreateBudget;
