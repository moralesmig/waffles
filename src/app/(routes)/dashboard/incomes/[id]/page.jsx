"use client";
import { db } from "@/../utils/dbConfig";
import { Incomes } from "@/../utils/schema";
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
import EditIncome from "../_components/EditIncome";
import IncomeItem from "../_components/IncomeItem"

function IncomeScreen({ params }) {
  const { user } = useUser();
  const [incomeInfo, setIncomeInfo] = useState();
  const [IncomeList, setIncomeList] = useState([]);
  const route = useRouter();
  useEffect(() => {
    user && getIncomeInfo();
  }, [user]);

  /**
   * Get Income Information
   */
  const getIncomeInfo = async () => {
    const result = await db
      .select()
      .from(Incomes)
      .where(eq(Incomes.id, params.id))
      .orderBy(desc(Incomes.id))

    setIncomeInfo(result[0]);
  };

  /**
 * Used to Delete Income
 */
  const deleteIncome = async () => {
    const deleteIncomeResult = await db
      .delete(Incomes)
      .where(eq(Incomes.id, params.id))
      .returning();

    if (deleteIncomeResult) {
      const result = await db
        .delete(Incomes)
        .where(eq(Incomes.id, params.id))
        .returning();
    }
    toast("Income Deleted!");
    route.replace("/dashboard/incomes");
  };


  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold gap-2 flex justify-between items-center">
        <ArrowLeft onClick={() => route.replace('/dashboard/incomes')} className="cursor-pointer mt-1" />
        <span className="flex gap-2 items-center">
          <p>Edit Income</p>
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
                  This action cannot be undone and will permanenly delete the selected income.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteIncome()}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </h2>


      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-5">
        <EditIncome incomeInfo={incomeInfo} refreshData={() => getIncomeInfo()} />
      </div>

    </div>
  );
}

export default IncomeScreen;
