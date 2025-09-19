import { useState } from 'react';
import { Button } from './ui/button';

export default function Navbar({ handlePrev, handleNext }: { handlePrev: () => void, handleNext: () => void }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <nav className="w-full fixed left-0 top-0 z-50 bg-white p-4 shadow-md rounded-b-xl">
            <div className="container mx-auto flex items-center justify-between">

                <div className="flex items-center">
                    <a href="#" className="text-xl font-bold text-gray-800">Mechanicus (MHC++)</a>
                </div>

                <div className="hidden md:flex items-center space-x-6">
                    <a href="#" className="text-gray-600 hover:text-gray-800 transition duration-300">Home</a>
                    <a href="#" className="text-gray-600 hover:text-gray-800 transition duration-300">Video</a>
                    <a href="#" className="text-gray-600 hover:text-gray-800 transition duration-300">Report</a>
                    <a href="#" className="text-gray-600 hover:text-gray-800 transition duration-300">Extra</a>
                    <a href="#" className="text-gray-600 hover:text-gray-800 transition duration-300">Credits</a>
                    <div className="flex gap-2">
                        <Button size="sm" onClick={handlePrev} className="cursor-pointer">Previous</Button>
                        <Button size="sm" onClick={handleNext} className="cursor-pointer">Next</Button>
                    </div>
                </div>

                <div className="md:hidden flex gap-2">
                    <Button size="sm" onClick={handlePrev} className="cursor-pointer">←</Button>
                    <Button size="sm" onClick={handleNext} className="cursor-pointer">→</Button>
                    <button
                        id="mobile-menu-button"
                        className="text-gray-600 hover:text-gray-800 focus:outline-none"
                        onClick={toggleMobileMenu}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div id="mobile-menu" className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden mt-4`}>
                <a href="#"
                    className="block py-2 px-4 text-gray-600 hover:bg-gray-200 transition duration-300 rounded-md">Home</a>
                <a href="#"
                    className="block py-2 px-4 text-gray-600 hover:bg-gray-200 transition duration-300 rounded-md">Video</a>
                <a href="#"
                    className="block py-2 px-4 text-gray-600 hover:bg-gray-200 transition duration-300 rounded-md">Report</a>
                <a href="#"
                    className="block py-2 px-4 text-gray-600 hover:bg-gray-200 transition duration-300 rounded-md">Extra</a>
                <a href="#"
                    className="block py-2 px-4 text-gray-600 hover:bg-gray-200 transition duration-300 rounded-md">Credits</a>
            </div>
        </nav>

    )
}