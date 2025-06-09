import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ onClick, children, className, type = 'button', disabled, whileHover, whileTap }) => {
    return (
        <motion.button
            type={type}
            onClick={onClick}
            className={className}
            disabled={disabled}
            whileHover={whileHover}
            whileTap={whileTap}
        >
            {children}
        </motion.button>
    );
};

export default Button;