import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="text-gray-800">

      {/* 1️⃣ Landing Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 bg-gradient-to-br from-blue-50 to-white">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
        >
          Welcome to <span className="text-blue-600">Kingstar</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-8 text-base sm:text-lg text-gray-600 max-w-xl"
        >
          Building a strong community through impactful activities and meaningful connections.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            to="/register"
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700 transition"
          >
            Become a Member
          </Link>
          <Link
            to="/activities"
            className="border border-gray-300 px-6 py-3 rounded-full hover:border-blue-600 hover:text-blue-600 transition"
          >
            Explore Activities
          </Link>
        </motion.div>
      </section>

      {/* 2️⃣ About */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-bold mb-6"
        >
          About Kingstar
        </motion.h2>
        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
          Kingstar is a community-driven organization focused on empowering individuals through events, collaborations, and impactful initiatives.
        </p>
      </section>

      {/* 3️⃣ Activities */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Activities</h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {[1,2,3].map((item) => (
            <motion.div
              key={item}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
              <h3 className="font-semibold text-lg mb-2">Activity Title</h3>
              <p className="text-sm text-gray-600">
                Short description about the activity.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4️⃣ Events */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Upcoming Events</h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {[1,2,3].map((item) => (
            <motion.div
              key={item}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="border rounded-2xl p-6 hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg mb-2">Event Name</h3>
              <p className="text-sm text-gray-500 mb-2">📅 Date</p>
              <p className="text-sm text-gray-500">📍 Location</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5️⃣ Gallery */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">News Gallery</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {[1,2,3,4].map((item) => (
            <motion.div
              key={item}
              whileHover={{ scale: 1.05 }}
              className="h-32 sm:h-40 bg-gray-300 rounded-xl"
            ></motion.div>
          ))}
        </div>
      </section>

      {/* 6️⃣ Testimonials */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-12">What Members Say</h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6 sm:p-8"
        >
          <p className="text-gray-600 italic text-sm sm:text-base">
            "Being part of Kingstar has been an amazing experience. The events and community are truly inspiring."
          </p>
          <h4 className="mt-6 font-semibold text-blue-600">- Member Name</h4>
        </motion.div>
      </section>

      {/* 7️⃣ Registration Logos */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-12">Registrations</h2>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          {[1,2,3,4].map((item) => (
            <motion.div
              key={item}
              whileHover={{ scale: 1.1 }}
              className="w-24 sm:w-28 h-14 sm:h-16 bg-white shadow rounded-lg flex items-center justify-center"
            >
              Logo
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8️⃣ Awards */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-12">Awards & Recognition</h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {[1,2,3].map((item) => (
            <motion.div
              key={item}
              whileHover={{ scale: 1.05 }}
              className="p-6 border rounded-2xl hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-semibold">Award Title</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 9️⃣ CTA */}
      <section className="py-20 sm:py-24 bg-blue-600 text-white text-center px-4">
        <h2 className="text-2xl sm:text-4xl font-bold mb-4">Join Kingstar Today</h2>
        <p className="mb-8 text-base sm:text-lg">Be part of something meaningful.</p>

        <Link
          to="/register"
          className="bg-white text-blue-600 px-6 sm:px-8 py-3 rounded-full font-medium shadow hover:scale-105 transition"
        >
          Become a Member
        </Link>
      </section>

    </div>
  );
}
