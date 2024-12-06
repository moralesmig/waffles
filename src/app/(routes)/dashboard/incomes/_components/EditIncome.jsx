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
import { Incomes } from "@/../utils/schema";
import { eq } from "drizzle-orm";
import { toast } from "sonner";
function EditIncome({ incomeInfo, refreshData }) {
    const [emojiIcon, setEmojiIcon] = useState(incomeInfo?.icon);
    const [openEmojiPicker, setOpenEmojiPicker] = useState(false);

    const [name, setName] = useState();
    const [amount, setAmount] = useState();
    const [datePaid, setDate] = useState();

    const { user } = useUser();

    useEffect(() => {
        if (incomeInfo) {
            setEmojiIcon(incomeInfo?.icon);
            setAmount(incomeInfo.amount);
            setName(incomeInfo.name);
            setDate(incomeInfo.datePaid);
        }
    }, [incomeInfo]);
    const onUpdateIncome = async () => {
        const result = await db
            .update(Incomes)
            .set({
                name: name,
                amount: amount,
                datePaid: datePaid,
                icon: emojiIcon,
            })
            .where(eq(Incomes.id, incomeInfo.id))
            .returning();

        if (result) {
            refreshData();
            toast("Income Updated!");
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
                    <h2 className="text-black font-medium my-1">Name</h2>
                    <Input
                        placeholder="e.g. Home Decor"
                        defaultValue={incomeInfo?.name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="mt-2">
                    <h2 className="text-black font-medium my-1">Amount</h2>
                    <Input
                        type="number"
                        defaultValue={incomeInfo?.amount}
                        placeholder="e.g. $5000"
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <div className="mt-2">
                    <h2 className="text-black font-medium my-1">Pay Date</h2>
                    <Input
                        type="date"
                        defaultValue={incomeInfo?.datePaid}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
            </div>
            <Button
                disabled={!(name && amount)}
                onClick={() => onUpdateIncome()}
                className="mt-5 w-full rounded-full"
            >
                Update Income
            </Button>
        </div>
    );
}

export default EditIncome;
