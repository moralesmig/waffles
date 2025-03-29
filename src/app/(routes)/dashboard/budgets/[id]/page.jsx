"use client";
import { db } from "@/../utils/dbConfig";
import { Budgets } from "@/../utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import { Button } from "@/./components/ui/button";
import { ArrowLeft, Trash } from "lucide-react";
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
import EditBudget from "../_components/EditBudget";

function BudgetScreen({ params }) {
  const { user } = useUser();
  const [budgetInfo, setBudgetInfo] = useState();
  const route = useRouter();

  useEffect(() => {
    if (user) {
      getBudgetInfo();
    }
  }, [user, params.id]); // Add params.id to re-fetch when the budget ID changes

  // Get Budget Information
  const getBudgetInfo = async () => {
    try {
      const result = await db
        .select()
        .from(Budgets)
        .where(eq(Budgets.id, params.id))
        .orderBy(desc(Budgets.id));

      if (result.length > 0) {
        setBudgetInfo(result[0]);
      }
    } catch (error) {
      console.error("Error fetching budget info:", error);
    }
  };

  // Delete Budget
  const deleteBudget = async () => {
    try {
      const deleteBudgetResult = await db
        .delete(Budgets)
        .where(eq(Budgets.id, params.id))
        .returning();

      if (deleteBudgetResult) {
        toast.success("Budget Deleted!");
        route.replace("/dashboard/budgets");
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget.");
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold gap-2 flex justify-between items-center">
        <ArrowLeft onClick={() => route.replace('/dashboard/budgets')} className="cursor-pointer mt-1" />
        <span className="flex gap-2 items-center">
          <p>Edit Budget</p>
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
                  This action cannot be undone and will permanently delete the selected budget.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteBudget()}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-5">
        <EditBudget budgetInfo={budgetInfo} refreshData={getBudgetInfo} />
      </div>
    </div>
  );
}

export default BudgetScreen;
