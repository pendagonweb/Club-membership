import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/KING.webp"
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center">
  <img
    src={logo}   // 👈 put your logo path here
    alt="Kingstar Logo"
    className="h-8 sm:h-10 w-auto object-contain"
  />
</Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          {["Home", "Activities", "Committee", "About"].map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="hover:text-blue-600 transition"
              >
                {item}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Right Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-5 py-2 rounded-full shadow hover:bg-blue-700 transition"
            >
              Become a Member
            </Link>
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu with Animation */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t px-6 py-6 space-y-5 shadow-lg"
          >
            {["Home", "Activities", "Committee", "About"].map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className="block text-gray-700 font-medium text-lg"
                  onClick={() => setOpen(false)}
                >
                  {item}
                </Link>
              </motion.div>
            ))}

            <div className="pt-4 border-t space-y-4">
              <Link
                to="/login"
                className="block text-blue-600 font-medium text-lg"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="block bg-blue-600 text-white text-center py-3 rounded-full font-medium"
                onClick={() => setOpen(false)}
              >
                Become a Member
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}