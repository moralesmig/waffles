"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { UserButton } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

const DashboardNavigation = () => {
    const router = useRouter();
    const pathname = usePathname();

    const dashboard = '/dashboard';
    const budgets = '/dashboard/budgets';
    const expenses = '/dashboard/expenses';
    const incomes = '/dashboard/incomes';

    const handleHomeClick = () => {
        router.push(dashboard);
    };
    const handleBudgetsClick = () => {
        router.push(budgets);
    };
    const handleExpensesClick = () => {
        router.push(expenses);
    };
    const handleIncomeClick = () => {
        router.push(incomes);
    };

    const dashboardActive = (pathname === dashboard);
    const budgetsdActive = (pathname === budgets);
    const expensesActive = (pathname === expenses);
    const incomesActive = (pathname === incomes);

    return (
        <div className='fixed bottom-0 w-full p-5 border-t z-10 bg-zinc-200 shadow-sm'>
            <div className="flex justify-between">
                <Link href="/dashboard" onClick={handleHomeClick}>
                    {dashboardActive ? (<Icon icon="lsicon:home-filled" width="2em" height="2em" />) : (<Icon icon="lsicon:home-outline" width="2em" height="2em" />)}
                </Link>
                <Link href="/dashboard/budgets" onClick={handleBudgetsClick}> {budgetsdActive ? (<span className='font-bold'>Budgets</span>) : (<span>Budgets</span>)} </Link>
                <Link href="/dashboard/expenses" onClick={handleExpensesClick}> {expensesActive ? (<span className='font-bold'>Expenses</span>) : (<span>Expenses</span>)} </Link>
                <Link href="/dashboard/incomes" onClick={handleIncomeClick}>{incomesActive ? (<span className='font-bold'>Income</span>) : (<span>Income</span>)}</Link>
                <UserButton />
            </div>

        </div >
    )
}

export default DashboardNavigation