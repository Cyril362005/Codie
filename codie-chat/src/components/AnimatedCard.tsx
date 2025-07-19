import React from 'react';
import { motion } from 'framer-motion';

const AnimatedCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
