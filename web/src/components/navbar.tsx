import { formatTitle } from "@/lib/utils";
import { useEffect, useState } from "react";

type NavbarProps = {
  sections: string[];
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
};

export default function Navbar({ sections, setCurrentIndex }: NavbarProps) {
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
    <nav className="w-full fixed left-0 top-0 z-50 bg-white p-3 shadow-md rounded-b-xl">
      <div className="container mx-auto flex items-center justify-between">
        <div>
          <button
            className="text-xl font-bold text-gray-800 flex flex-row gap-4 items-center cursor-pointer"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setCurrentIndex(0);
            }}
          >
            <span className="bg-[#F1421C] text-white p-2 rounded">MHC++</span>
            <div className="flex flex-row items-center">
              <img src="mechanicus.png" className="w-10 h-10" />
              <span>Mechanicus</span>
            </div>
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-2">
          {sections.map((sec, idx) => (
            <button
              key={sec}
              onClick={() => setCurrentIndex(idx)}
              className={`nav-link ${sec === activeSection ? "active" : ""}`}
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
            onClick={() => {
              setCurrentIndex(idx);
              toggleMobileMenu();
            }}
            className={`nav-link ${sec === activeSection ? "active" : ""}`}
          >
            {formatTitle(sec)}
          </button>
        ))}
      </div>
    </nav>
  );
}
