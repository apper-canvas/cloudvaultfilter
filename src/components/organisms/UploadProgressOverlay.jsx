import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const UploadProgressOverlay = ({ uploading, uploadProgress }) => {
    return (
        <AnimatePresence>
            {uploading && Object.keys(uploadProgress).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="fixed bottom-4 right-4 bg-white rounded-lg shadow-hover p-4 z-40"
                >
                    <div className="flex items-center space-x-3 mb-2">
                        <ApperIcon name="Upload" size={20} className="text-primary" />
                        <span className="font-medium">Uploading files...</span>
                    </div>
                    {Object.entries(uploadProgress).map(([fileId, progress]) => (
                        <div key={fileId} className="w-64 bg-gray-200 rounded-full h-2 mb-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="gradient-primary h-2 rounded-full"
                            />
                        </div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UploadProgressOverlay;