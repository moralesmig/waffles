"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@/./components/ui/button";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

function Header() {
    const { user, isSignedIn } = useUser();

    return (
        <div className="p-5 flex justify-between items-center border shadow-sm">
            <div className="flex flex-row items-center">
                <Image src={"/logo.png"} alt="logo" width={40} height={25} />
                <span className="ml-2 font-bold text-xl">Waffles</span>
            </div>

            {isSignedIn ?
                // If user is signed in, show Dashboard and User profile
                (<div>
                    <div className="flex">
                        <div className="mr-3">
                            <Link href="/dashboard">
                                <Button variant="outline" className="rounded-full">Dashboard</Button>
                            </Link>
                        </div>
                        <UserButton />
                    </div>
                </div>) :
                // Else, show Get started button
                (<div className="flex gap-3 items-center">
                    <Link href="/sign-in">
                        <Button className="rounded-full">Get started</Button>
                    </Link>
                </div>
                )
            }
        </div>
    );
}

export default Header;