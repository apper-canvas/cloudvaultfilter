import React from 'react';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const FileBrowserHeader = ({ breadcrumbs, onNavigateToFolder, onNewFolderClick, onUploadClick }) => {
    return (
        <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm">
                    <button
                        onClick={() => onNavigateToFolder(null)}
                        className="text-gray-500 hover:text-primary transition-colors"
                    >
                        My Files
                    </button>
                    {breadcrumbs.map((crumb) => (
                        <div key={crumb.id} className="flex items-center space-x-2">
                            <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
                            <button
                                onClick={() => onNavigateToFolder(crumb.id)}
                                className="text-gray-500 hover:text-primary transition-colors"
                            >
                                {crumb.name}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onNewFolderClick}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ApperIcon name="FolderPlus" size={16} />
                        <span className="hidden sm:inline">New Folder</span>
                    </Button>

                    <Button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onUploadClick}
                        className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm"
                    >
                        <ApperIcon name="Upload" size={16} />
                        <span className="hidden sm:inline">Upload</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FileBrowserHeader;