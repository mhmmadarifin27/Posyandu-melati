"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Phone, MessageCircle, MapPin, Users, Heart } from "lucide-react";

export interface iNavItem {
  heading: string;
  href: string;
  subheading?: string;
  imgSrc?: string;
}

interface iNavLinkProps extends iNavItem {
  setIsActive: (isActive: boolean) => void;
  index: number;
}

interface iCurvedNavbarProps {
  setIsActive: (isActive: boolean) => void;
  navItems: iNavItem[];
}

export interface iHeaderProps {
  navItems?: iNavItem[];
  footer?: React.ReactNode;
  className?: string;
}

const MENU_SLIDE_ANIMATION = {
  initial: { x: "calc(100% + 100px)" },
  enter: { x: "0", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const } },
  exit: {
    x: "calc(100% + 100px)",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const },
  },
};

export const defaultPosyanduNavItems: iNavItem[] = [
  {
    heading: "Beranda",
    href: "/",
    subheading: "Halaman Utama Posyandu Melati",
    imgSrc: "/images/hero_posyandu.jpg",
  },
  {
    heading: "Layanan",
    href: "#layanan-opsi",
    subheading: "Balita, Bumil, Busui & Lansia",
    imgSrc: "/images/dok_timbang_balita.jpg",
  },
  {
    heading: "Sasaran",
    href: "#sasaran",
    subheading: "Pendampingan 4 Siklus Warga",
    imgSrc: "/images/dok_bumil_checkup.jpg",
  },
  {
    heading: "Jadwal",
    href: "#jadwal",
    subheading: "Kalender Sesi Posyandu Serentak",
    imgSrc: "/images/hero_posyandu.jpg",
  },
  {
    heading: "Kontak",
    href: "#kontak",
    subheading: "Balai RW 03 & Bidan Desa",
    imgSrc: "/images/dok_bumil_checkup.jpg",
  },
  {
    heading: "Galeri",
    href: "#galeri",
    subheading: "Dokumentasi Suasana Pelayanan",
    imgSrc: "/images/galeri_imunisasi.jpg",
  },
];

const CustomFooter: React.FC = () => {
  return (
    <div className="flex w-full text-xs justify-between items-center text-slate-700 px-8 md:px-16 py-6 border-t border-rose-100 bg-[#fffbfc]">
      <a
        href="https://wa.me/6281278901234?text=Halo%20Posyandu%20Melati"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-rose-700 hover:text-rose-800 font-bold transition-colors"
      >
        <MessageCircle size={18} />
        <span>WhatsApp</span>
      </a>
      <a
        href="tel:081278901234"
        className="flex items-center gap-1.5 text-rose-700 hover:text-rose-800 font-bold transition-colors"
      >
        <Phone size={18} />
        <span>(0812) 7890-1234</span>
      </a>
      <a
        href="#kontak"
        className="flex items-center gap-1.5 text-slate-800 hover:text-rose-600 font-bold transition-colors"
      >
        <MapPin size={18} />
        <span>Balai RW 03</span>
      </a>
    </div>
  );
};

const NavLink: React.FC<iNavLinkProps> = ({
  heading,
  href,
  setIsActive,
  index,
  subheading,
}) => {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleClick = () => {
    setIsActive(false);
  };

  return (
    <motion.div
      onClick={handleClick}
      initial="initial"
      whileHover="whileHover"
      className="group relative flex items-center justify-between border-b border-rose-100 py-3.5 transition-colors duration-500 md:py-5 uppercase"
    >
      <Link
        ref={ref}
        onMouseMove={handleMouseMove}
        href={href}
        className="w-full flex items-center justify-between"
      >
        <div className="relative flex items-center">
          <span className="text-rose-400 font-mono text-xl md:text-2xl font-light mr-3">
            0{index}.
          </span>
          <div>
            <div className="flex flex-row gap-0.5">
              <motion.span
                variants={{
                  initial: { x: 0 },
                  whileHover: { x: -8 },
                }}
                transition={{
                  type: "spring",
                  staggerChildren: 0.04,
                  delayChildren: 0.1,
                }}
                className="relative z-10 block text-2xl sm:text-3xl font-serif font-bold text-slate-900 group-hover:text-rose-600 transition-colors duration-300"
              >
                {heading.split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      initial: { x: 0 },
                      whileHover: { x: 8 },
                    }}
                    transition={{ type: "spring" }}
                    className="inline-block"
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </motion.span>
            </div>
            {subheading && (
              <p className="text-[11px] font-sans lowercase tracking-normal text-slate-400 group-hover:text-rose-400 transition-colors">
                {subheading}
              </p>
            )}
          </div>
        </div>
        <span className="text-slate-300 group-hover:text-rose-500 font-sans text-sm transition-transform group-hover:translate-x-1 duration-300">
          &rarr;
        </span>
      </Link>
    </motion.div>
  );
};

const Curve: React.FC = () => {
  const [height, setHeight] = useState(900);

  useEffect(() => {
    setHeight(window.innerHeight);
    const handleResize = () => setHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initialPath = `M100 0 L200 0 L200 ${height} L100 ${height} Q-100 ${height / 2} 100 0`;
  const targetPath = `M100 0 L200 0 L200 ${height} L100 ${height} Q100 ${height / 2} 100 0`;

  const curve = {
    initial: { d: initialPath },
    enter: {
      d: targetPath,
      transition: { duration: 1, ease: [0.76, 0, 0.24, 1] as const },
    },
    exit: {
      d: initialPath,
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as const },
    },
  };

  return (
    <svg
      className="hidden sm:block absolute top-0 -left-[99px] w-[100px] stroke-none h-full pointer-events-none"
      style={{ fill: "#ffffff" }}
    >
      <motion.path
        variants={curve}
        initial="initial"
        animate="enter"
        exit="exit"
      />
    </svg>
  );
};

const CurvedNavbar: React.FC<
  iCurvedNavbarProps & { footer?: React.ReactNode }
> = ({ setIsActive, navItems, footer }) => {
  return (
    <motion.div
      variants={MENU_SLIDE_ANIMATION}
      initial="initial"
      animate="enter"
      exit="exit"
      className="h-[100dvh] w-screen max-w-[88vw] sm:max-w-md fixed right-0 top-0 z-50 bg-white shadow-2xl border-l border-rose-100 flex flex-col justify-between"
    >
      <div className="h-full pt-8 flex flex-col justify-between overflow-y-auto">
        <div className="flex flex-col gap-2 px-8 md:px-14">
          <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Menu Posyandu Melati
              </p>
            </div>
            <button
              onClick={() => setIsActive(false)}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 p-1 rounded-md hover:bg-rose-50"
              aria-label="Tutup Menu"
            >
              ✕ Tutup
            </button>
          </div>

          <nav className="mt-1">
            <div className="mx-auto w-full">
              {navItems.map((item, index) => (
                <NavLink
                  key={item.href}
                  {...item}
                  setIsActive={setIsActive}
                  index={index + 1}
                />
              ))}
            </div>
          </nav>
        </div>

        {footer}
      </div>
      <Curve />
    </motion.div>
  );
};

export const CurvedMenu: React.FC<iHeaderProps> = ({
  navItems = defaultPosyanduNavItems,
  footer = <CustomFooter />,
}) => {
  const [isActive, setIsActive] = useState(false);

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsActive(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Modern Curved Hamburger Toggle Button */}
      <button
        onClick={() => setIsActive(!isActive)}
        className="w-11 h-11 rounded-full border border-rose-200 bg-white hover:bg-rose-50 flex items-center justify-center cursor-pointer shadow-xs transition-colors group z-40"
        aria-label="Menu Posyandu Melati"
        title="Menu Posyandu Melati"
      >
        <div className="relative w-5 h-4 flex flex-col justify-between items-center">
          <span
            className={`block h-0.5 w-5 bg-slate-800 group-hover:bg-rose-600 transition-transform duration-300 ${
              isActive ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-slate-800 group-hover:bg-rose-600 transition-opacity duration-300 ${
              isActive ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-slate-800 group-hover:bg-rose-600 transition-transform duration-300 ${
              isActive ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </div>
      </button>

      {/* Backdrop overlay */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsActive(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isActive && (
          <CurvedNavbar
            setIsActive={setIsActive}
            navItems={navItems}
            footer={footer}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CurvedMenu;
