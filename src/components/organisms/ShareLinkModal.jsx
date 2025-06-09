import React from 'react';
import Modal from '@/components/molecules/Modal';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const ShareLinkModal = ({ file, isOpen, onClose, shareLink, onCopyLink, getFileIcon, formatFileSize }) => {
    if (!file) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Share File</h3>
            <div className="flex items-center space-x-3 mb-4">
                <ApperIcon name={getFileIcon(file.mimeType)} size={20} className="text-gray-400" />
                <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                    <div className="flex">
                        <Input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                        />
                        <Button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onCopyLink}
                            className="px-4 py-2 gradient-accent text-white rounded-r-lg font-medium shadow-sm"
                        >
                            <ApperIcon name="Copy" size={16} />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <Button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Done
                </Button>
            </div>
        </Modal>
    );
};

export default ShareLinkModal;