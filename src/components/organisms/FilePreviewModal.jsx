import React from 'react';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const FilePreviewModal = ({ file, isOpen, onClose, onGenerateShareLink, getFileIcon, formatFileSize }) => {
    if (!file) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                    <ApperIcon name={getFileIcon(file.mimeType)} size={20} className="text-gray-400" />
                    <div>
                        <h3 className="font-medium text-gray-900">{file.name}</h3>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onGenerateShareLink(file)}
                        className="p-2 text-gray-500 hover:text-primary transition-colors"
                    >
                        <ApperIcon name="Share2" size={20} />
                    </Button>
                    <Button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open(file.downloadUrl, '_blank')}
                        className="p-2 text-gray-500 hover:text-primary transition-colors"
                    >
                        <ApperIcon name="Download" size={20} />
                    </Button>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ApperIcon name="X" size={20} />
                    </button>
                </div>
            </div>
            <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
                {file.mimeType?.startsWith('image/') ? (
                    <img
                        src={file.downloadUrl}
                        alt={file.name}
                        className="max-w-full h-auto mx-auto"
                    />
                ) : (
                    <div className="text-center py-12">
                        <ApperIcon name={getFileIcon(file.mimeType)} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Preview not available for this file type</p>
                        <Button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.open(file.downloadUrl, '_blank')}
                            className="mt-4 px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm"
                        >
                            Download File
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default FilePreviewModal;