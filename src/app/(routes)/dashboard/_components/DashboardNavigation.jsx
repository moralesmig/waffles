"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { UserButton } from '@clerk/nextjs';

const DashboardNavigation = () => {
    const router = useRouter();

    const handleHomeClick = () => {
        router.push('/dashboard');
    };
    const handleBudgetsClick = () => {
        router.push('/dashboard/budgets');
    };
    const handleExpensesClick = () => {
        router.push('/dashboard/expenses');
    };
    const handleIncomeClick = () => {
        router.push('/dashboard/income');
    };


    return (
        <div className='fixed bottom-0 w-full p-5 border-t z-10 bg-zinc-100 shadow-sm'>
            <div className="flex justify-between">
                <Link href="/dashboard" onClick={handleHomeClick}>Home</Link>
                <Link href="/dashboard/budgets" onClick={handleBudgetsClick}>Budgets</Link>
                <Link href="/dashboard/expenses" onClick={handleExpensesClick}>Expenses</Link>
                <Link href="/dashboard/incomes" onClick={handleIncomeClick}>Incomes</Link>
                <UserButton />
            </div>

        </div >
    )
}

export default DashboardNavigation