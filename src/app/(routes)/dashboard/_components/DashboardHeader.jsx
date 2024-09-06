import { UserButton } from '@clerk/nextjs';
import React from 'react';
import SideNav from './SideNav';
import Image from 'next/image';

function DashboardHeader() {
    return (
        <div className='p-5 shadow-sm border-b flex justify-end'>
            <div className="flex">
                {/* <Image src={"/logo.png"} alt="logo" width={40} height={25} />
                <a className="font-bold text-xl mt-2 mx-2" href="/">Waffles</a> */}

                <UserButton />
            </div>
        </div >
    )
}

export default DashboardHeader