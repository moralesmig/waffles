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
    const [dialogOpen, setDialogOpen] = useState(false); // Track modal open/close
    const { user } = useUser();

    const handleDateChange = (e) => {
        setDueDate(e.target.value);
    };

    const onCreateBudget = async () => {
        if (!dueDate || !name || !amount) {
            toast.error("Please fill in all fields.");
            return;
        }

        try {
            const result = await db
                .insert(Budgets)
                .values({
                    name,
                    amount: Number(amount), // Ensure amount is stored as a number
                    createdBy: user?.primaryEmailAddress?.emailAddress,
                    dueDate,
                    icon: emojiIcon,
                })
                .returning({ insertedId: Budgets.id });

            if (result) {
                setDialogOpen(false); // Close the modal
                setName(""); // Reset fields
                setAmount("");
                setDueDate("");
                refreshData(); // Immediately refresh budget list
                toast.success("New Budget Created!");
            }
        } catch (error) {
            console.error("Error creating budget:", error);
            toast.error("Failed to create budget.");
        }
    };

    return (
        <div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                                {openEmojiPicker && (
                                    <div className="absolute z-20">
                                        <EmojiPicker
                                            open={openEmojiPicker}
                                            onEmojiClick={(e) => {
                                                setEmojiIcon(e.emoji);
                                                setOpenEmojiPicker(false);
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="mt-2">
                                    <h2 className="text-black font-medium my-1 text-left pl-2">Name</h2>
                                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div className="mt-5">
                                    <h2 className="text-black font-medium my-1 text-left pl-2">Amount</h2>
                                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                                </div>
                                <div className="mt-5">
                                    <h2 className="text-black font-medium my-1 text-left pl-2">Due Date</h2>
                                    <Input type="date" value={dueDate} onChange={handleDateChange} />
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button disabled={!(name && amount && dueDate)} onClick={onCreateBudget} className="mt-5 w-full">
                            Create Budget
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CreateBudget;
