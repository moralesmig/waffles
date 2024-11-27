"use client";

import React from 'react';
import BudgetList from './_components/BudgetList';
import { useRouter } from "next/navigation";

function Budget() {
    const route = useRouter();

    return (
        <div className='p-10'>
            <div className='flex'>
                <h2 className='font-bold text-3xl ml-3 mt-0'>My Budgets</h2>
            </div>
            <BudgetList />
        </div>
    )
}

export default Budget;