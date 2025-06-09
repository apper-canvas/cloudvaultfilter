import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FileItem from '@/components/molecules/FileItem';

const FileBrowserContent = ({
    filteredFiles,
    filteredFolders,
    viewMode,
    loading,
    error,
    onReloadData,
    onUploadClick,
    onNewFolderClick,
    onItemClick,
    onFolderDoubleClick,
    onItemContextMenu,
    onShareFile,
    getFileIcon,
    formatFileSize,
}) => {
    if (loading) {
        return (
            <div className="p-6">
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-lg p-4 shadow-card"
                        >
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-8"
                >
                    <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <Button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onReloadData}
                        className="px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm"
                    >
                        Try Again
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (filteredFiles.length === 0 && filteredFolders.length === 0) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12"
            >
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                >
                    <ApperIcon name="Cloud" className="w-16 h-16 text-gray-300 mx-auto" />
                </motion.div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No files yet</h3>
                <p className="mt-2 text-gray-500">Upload your first file or create a folder to get started</p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onUploadClick}
                        className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm"
                    >
                        <ApperIcon name="Upload" size={16} />
                        <span>Upload Files</span>
                    </Button>
                    <Button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNewFolderClick}
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ApperIcon name="FolderPlus" size={16} />
                        <span>Create Folder</span>
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                : 'space-y-2'
            }>
                {filteredFolders.map((folder, index) => (
                    <FileItem
                        key={folder.id}
                        item={folder}
                        type="folder"
                        viewMode={viewMode}
                        onDoubleClick={onFolderDoubleClick}
                        onContextMenu={onItemContextMenu}
                        delayIndex={index}
                        getFileIcon={getFileIcon}
                        formatFileSize={formatFileSize}
                    />
                ))}

                {filteredFiles.map((file, index) => (
                    <FileItem
                        key={file.id}
                        item={file}
                        type="file"
                        viewMode={viewMode}
                        onClick={onItemClick}
                        onContextMenu={onItemContextMenu}
                        onShare={onShareFile}
                        delayIndex={filteredFolders.length + index}
                        getFileIcon={getFileIcon}
                        formatFileSize={formatFileSize}
                    />
                ))}
            </div>
        </div>
    );
};

export default FileBrowserContent;