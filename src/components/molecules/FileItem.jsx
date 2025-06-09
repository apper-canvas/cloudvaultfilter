import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { format } from 'date-fns';
import Button from '@/components/atoms/Button';

const FileItem = ({ item, type, viewMode, onDoubleClick, onClick, onContextMenu, onShare, delayIndex, getFileIcon, formatFileSize }) => {
    const isGrid = viewMode === 'grid';
    const isFile = type === 'file';

    const renderIcon = () => {
        if (isFile && item.thumbnailUrl) {
            return (
                <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className={`${isGrid ? 'w-12 h-12 mx-auto' : 'w-10 h-10'} object-cover rounded group-hover:scale-105 transition-transform`}
                />
            );
        }
        const iconName = isFile ? getFileIcon(item.mimeType) : 'Folder';
        const iconSize = isGrid ? 40 : 20;
        const iconColor = isFile ? 'text-gray-400' : 'text-primary';
        return (
            <ApperIcon
                name={iconName}
                size={iconSize}
                className={`${iconColor} mx-auto group-hover:scale-105 transition-transform`}
            />
        );
    };

    const handleClick = () => {
        if (isFile) {
            onClick(item);
        }
    };

    const handleDoubleClick = () => {
        if (!isFile) {
            onDoubleClick(item.id);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        onContextMenu(e, item, type);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delayIndex * 0.05 }}
            className={isGrid
                ? 'bg-white rounded-lg p-4 shadow-card hover:shadow-hover cursor-pointer transition-all duration-200 group'
                : 'bg-white rounded-lg p-3 shadow-card hover:shadow-hover cursor-pointer transition-all duration-200 flex items-center space-x-3'
            }
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
        >
            <div className={isGrid ? 'text-center' : 'flex items-center space-x-3 flex-1'}>
                {renderIcon()}
                <div className={isGrid ? 'mt-2' : 'flex-1 min-w-0'}>
                    <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                    {isFile && (
                        <p className="text-xs text-gray-500">
                            {formatFileSize(item.size)}
                            {viewMode === 'list' && (
                                <span className="ml-2">
                                    {format(new Date(item.uploadDate), 'MMM dd, yyyy')}
                                </span>
                            )}
                        </p>
                    )}
                    {!isFile && viewMode === 'list' && (
                        <p className="text-xs text-gray-500">
                            {format(new Date(item.createdDate), 'MMM dd, yyyy')}
                        </p>
                    )}
                </div>

                {isFile && viewMode === 'list' && (
                    <Button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent opening preview modal
                            onShare(item);
                        }}
                        className="p-2 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                        <ApperIcon name="Share2" size={16} />
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default FileItem;