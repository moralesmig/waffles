import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from 'next/link';
import MobileMenuButton from './MobileMenuButton';
import MobileDrawer from './MobileDrawer';

function MobileNavBar() {

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const handleDrawerToggle = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    return (
        <div>
            <MobileMenuButton onClick={handleDrawerToggle} />
            <MobileDrawer isOpen={isDrawerOpen} onClose={handleDrawerToggle} />
        </div >
    );
};


export default MobileNavBar;