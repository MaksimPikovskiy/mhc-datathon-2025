import { formatTitle } from "@/lib/utils";
import { useEffect, useState } from "react";

type NavbarProps = {
  sections: string[];
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
};

export default function Navbar({
  sections,
  currentIndex,
  setCurrentIndex,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentSection = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  return (
    <nav className="w-full fixed left-0 top-0 z-50 bg-white p-4 shadow-md rounded-b-xl">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <a href="#" className="text-xl font-bold text-gray-800">
            <span className="bg-[#F1421C] text-white p-2 rounded">MHC++</span>{" "}
            Mechanicus{" "}
          </a>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          {sections.map((sec, idx) => (
            <button
              key={sec}
              onClick={() => setCurrentIndex(idx)}
              className={`text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded p-1 transition duration-30 cursor-pointer ${
                sec === activeSection ? "underline underline-offset-2" : ""
              }`}
            >
              {formatTitle(sec)}
            </button>
          ))}
        </div>

        <div className="md:hidden flex gap-2">
          <button
            id="mobile-menu-button"
            className="text-gray-600 hover:text-gray-800 focus:outline-none cursor-pointer hover:bg-gray-50 rounded-full p-1"
            onClick={toggleMobileMenu}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`${
          isMobileMenuOpen ? "flex flex-col items-end" : "hidden"
        } md:hidden mt-4 justify-end`}
      >
        {sections.map((sec, idx) => (
          <button
            key={sec}
            onClick={() => setCurrentIndex(idx)}
            className={`block py-2 px-4 text-gray-600 hover:bg-gray-200 transition duration-300 rounded-md cursor-pointer ${
              idx === currentIndex ? "underline underline-offset-2" : ""
            }`}
          >
            {formatTitle(sec)}
          </button>
        ))}
      </div>
    </nav>
  );
}
