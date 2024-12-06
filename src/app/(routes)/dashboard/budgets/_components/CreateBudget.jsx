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
    const [name, setName] = useState();
    const [amount, setAmount] = useState();
    const [dueDate, setDate] = useState("");
    const { user } = useUser();

    // Adjust and format the date for Central Time
    const formatDateToCentralTime = (dateString) => {
        if (!dateString) return null;

        // Parse the date as UTC
        const date = new Date(dateString + "T00:00:00Z");

        // Adjust the date to Central Time Zone (America/Chicago)
        const offset = -6; // Central Time Zone offset in hours (Note: consider Daylight Saving Time, if applicable)
        date.setHours(date.getHours() + offset);

        // Return the date formatted as YYYY-MM-DD
        return date.toISOString().split('T')[0]; // Keeps only the date part
    };

    // Handle date change and format the date before saving
    const handleDateChange = (e) => {
        const selectedDate = e.target.value; // the raw date string from the input
        const formattedDate = formatDateToCentralTime(selectedDate); // format it to Central Time
        setDate(formattedDate); // set the formatted date to state
    };

    // Create New Budget
    const onCreateBudget = async () => {
        const result = await db
            .insert(Budgets)
            .values({
                name: name,
                amount: amount,
                createdBy: user?.primaryEmailAddress?.emailAddress,
                dueDate: dueDate,
                icon: emojiIcon,
            })
            .returning({ insertedId: Budgets.id });

        if (result) {
            refreshData();
            toast("New Budget Created!");
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
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="mt-5">
                                    <h2 className="text-black font-medium my-1 text-left pl-2">Amount</h2>
                                    <Input
                                        type="number"
                                        placeholder="$0"
                                        onChange={(e) => setAmount(e.target.value)}
                                    />
                                </div>
                                <div className="mt-5">
                                    <h2 className="text-black font-medium my-1 text-left pl-2">Due Date (optional)</h2>
                                    <Input
                                        type="date"
                                        onChange={handleDateChange}
                                    />
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button
                                disabled={!(name && amount)}
                                onClick={() => onCreateBudget()}
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