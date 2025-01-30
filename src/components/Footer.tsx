import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-3 px-4 shadow-lg"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center text-sm text-gray-600" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
          <span className="inline-flex items-center gap-2">
            Made with{" "}
            <motion.span
              animate={{
                rotate: [0, 14, -8, 14, -4, 10, 0],
                scale: [1, 1.2, 1, 1.1, 1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 3,
              }}
              className="inline-block"
            >
              ☕️
            </motion.span>{" "}
            by{" "}
            <motion.a
              href="https://github.com/alejandroSejas"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 hover:text-gray-700 underline decoration-dotted underline-offset-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Alejandro Sejas
            </motion.a>
          </span>
        </motion.div>
      </div>
    </motion.footer>
  );
};
