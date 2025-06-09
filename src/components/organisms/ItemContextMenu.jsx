import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const ItemContextMenu = ({ contextMenu, onClose, onRename, onShare, onDelete }) => {
    if (!contextMenu) return null;

    return (
        <AnimatePresence>
            {contextMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
                        style={{
                            left: Math.min(contextMenu.x, window.innerWidth - 200),
                            top: Math.min(contextMenu.y, window.innerHeight - 200)
                        }}
                    >
                        <button
                            onClick={() => {
                                const newName = prompt('Enter new name:', contextMenu.item.name);
                                if (newName !== null && newName.trim() !== '' && newName !== contextMenu.item.name) {
                                    onRename(contextMenu.item, contextMenu.type, newName);
                                }
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <ApperIcon name="Edit2" size={16} />
                            <span>Rename</span>
                        </button>
                        {contextMenu.type === 'file' && (
                            <button
                                onClick={() => {
                                    onShare(contextMenu.item);
                                    onClose();
                                }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                            >
                                <ApperIcon name="Share2" size={16} />
                                <span>Share</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                onDelete(contextMenu.item, contextMenu.type);
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-error flex items-center space-x-2"
                        >
                            <ApperIcon name="Trash2" size={16} />
                            <span>Delete</span>
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ItemContextMenu;