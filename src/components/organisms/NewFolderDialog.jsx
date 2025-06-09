import React, { useState } from 'react';
import Modal from '@/components/molecules/Modal';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';

const NewFolderDialog = ({ isOpen, onClose, onCreateFolder }) => {
    const [newFolderName, setNewFolderName] = useState('');

    const handleCreate = () => {
        onCreateFolder(newFolderName);
        setNewFolderName('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
            <Input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                autoFocus
            />
            <div className="flex justify-end space-x-3 mt-6">
                <Button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </Button>
                <Button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCreate}
                    disabled={!newFolderName.trim()}
                    className="px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Create
                </Button>
            </div>
        </Modal>
    );
};

export default NewFolderDialog;