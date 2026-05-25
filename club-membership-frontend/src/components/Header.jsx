import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/KING.webp";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = ["Home", "Activities", "Committee", "About"];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-[0_2px_20px_rgba(0,0,0,0.08)]"
          : "bg-white/80 backdrop-blur-md border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-5 sm:px-8 py-3.5">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <motion.img
            src={logo}
            alt="Kingstar Logo"
            className="h-9 sm:h-11 w-auto object-contain"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 text-gray-600 font-medium">
          {navLinks.map((item, i) => (
            <NavLink key={i} item={item} />
          ))}
        </nav>

        {/* Right Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/login"
              className="px-4 py-2 text-blue-600 font-semibold text-sm rounded-full border border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
            >
              Login
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/register"
              className="relative overflow-hidden bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all duration-200 group"
            >
              <span className="relative z-10">Become a Member</span>
              {/* shine sweep on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X size={22} className="text-gray-700" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={22} className="text-gray-700" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-white border-t border-gray-100"
          >
            <div className="px-5 pt-4 pb-6 space-y-1">
              {navLinks.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -16, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.07, ease: "easeOut" }}
                >
                  <Link
                    to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                    className="flex items-center gap-2 px-3 py-3 rounded-xl text-gray-700 font-medium text-base hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ x: -16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: navLinks.length * 0.07 + 0.05 }}
                className="pt-4 mt-2 border-t border-gray-100 space-y-3"
              >
                <Link
                  to="/login"
                  className="block text-center px-4 py-3 rounded-xl border border-blue-200 text-blue-600 font-semibold text-base hover:bg-blue-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="block bg-blue-600 text-white text-center py-3 rounded-xl font-semibold text-base shadow-md shadow-blue-200 hover:bg-blue-700 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Become a Member
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ── Desktop nav link with animated underline indicator ── */
function NavLink({ item }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative"
    >
      <Link
        to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
        className="relative px-3.5 py-2 text-sm rounded-lg hover:text-blue-600 transition-colors duration-150 block"
      >
        {/* Pill bg on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.span
              className="absolute inset-0 bg-blue-50 rounded-lg"
              layoutId="nav-hover-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>
        <span className="relative z-10">{item}</span>
      </Link>
    </motion.div>
  );
}
