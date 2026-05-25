// components/ActivitiesSection.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const ActivitiesSection = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/activities`,
        );
        if (!res.data.success) throw new Error(res.data.message);
        setActivities(res.data.data);
        setActivities(
          res.data.data.filter((act) => new Date(act.date) <= new Date()),
        );
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  return (
    <section className="py-20 sm:py-10 px-5 sm:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4">
            What We Do
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold">Our Activities</h2>
        </motion.div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse"
              >
                <div className="h-44 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-sm">
              Could not load activities. Please try again later.
            </p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && activities.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">No activities yet. Check back soon!</p>
          </div>
        )}

        {/* Cards */}
        {!loading && !error && activities.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {activities.map((act, i) => (
              <motion.div
                key={act._id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.65,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 group"
                >
                  <div className="relative overflow-hidden h-44">
                    {act.image ? (
                      <img
                        src={act.image}
                        alt={act.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center text-blue-300 text-4xl">
                        📌
                      </div>
                    )}
                    {act.tag && (
                      <span className="absolute top-3 left-3 text-xs font-semibold bg-white/90 backdrop-blur px-3 py-1 rounded-full text-blue-600">
                        {act.tag}
                      </span>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-lg mb-1">{act.title}</h3>
                      {act.date && (
                        <p className="text-xs text-blue-500 font-medium mb-2">
                          {new Date(act.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivitiesSection;
