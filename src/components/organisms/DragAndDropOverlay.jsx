import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const DragAndDropOverlay = ({ dragActive }) => {
    return (
        <AnimatePresence>
            {dragActive && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-30"
                >
                    <div className="text-center">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                        >
                            <ApperIcon name="Upload" className="w-16 h-16 text-primary mx-auto mb-4" />
                        </motion.div>
                        <p className="text-xl font-medium text-primary">Drop files here to upload</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DragAndDropOverlay;