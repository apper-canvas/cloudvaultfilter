import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import fileService from '../services/api/fileService';

const Trash = () => {
  const { searchQuery } = useOutletContext();
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);

  useEffect(() => {
    loadDeletedFiles();
  }, []);

  const loadDeletedFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const files = await fileService.getDeleted();
      setDeletedFiles(files);
    } catch (err) {
      setError(err.message || 'Failed to load deleted files');
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = deletedFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return 'Image';
    if (mimeType?.includes('pdf')) return 'FileText';
    if (mimeType?.startsWith('video/')) return 'Video';
    if (mimeType?.startsWith('audio/')) return 'Music';
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return 'Archive';
    return 'File';
  };

  const restoreFile = async (fileId) => {
    try {
      await fileService.restore(fileId);
      setDeletedFiles(prev => prev.filter(f => f.id !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      toast.success('File restored successfully');
    } catch (err) {
      toast.error('Failed to restore file');
    }
  };

  const permanentlyDelete = async (fileId) => {
    try {
      await fileService.permanentDelete(fileId);
      setDeletedFiles(prev => prev.filter(f => f.id !== fileId));
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
      toast.success('File permanently deleted');
    } catch (err) {
      toast.error('Failed to permanently delete file');
    }
  };

  const restoreSelected = async () => {
    try {
      await Promise.all(selectedFiles.map(fileId => fileService.restore(fileId)));
      setDeletedFiles(prev => prev.filter(f => !selectedFiles.includes(f.id)));
      setSelectedFiles([]);
      toast.success(`${selectedFiles.length} file(s) restored`);
    } catch (err) {
      toast.error('Failed to restore selected files');
    }
  };

  const emptyTrash = async () => {
    try {
      await Promise.all(deletedFiles.map(file => fileService.permanentDelete(file.id)));
      setDeletedFiles([]);
      setSelectedFiles([]);
      setShowEmptyConfirm(false);
      toast.success('Trash emptied successfully');
    } catch (err) {
      toast.error('Failed to empty trash');
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const selectAll = () => {
    setSelectedFiles(filteredFiles.map(f => f.id));
  };

  const clearSelection = () => {
    setSelectedFiles([]);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Trash</h1>
          <p className="text-gray-500 mt-1">Files will be permanently deleted after 30 days</p>
        </div>
        
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-lg p-4 shadow-card"
            >
              <div className="animate-pulse flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDeletedFiles}
            className="px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Trash</h1>
          <p className="text-gray-500 mt-1">Files will be permanently deleted after 30 days</p>
        </div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <ApperIcon name="Trash2" className="w-16 h-16 text-gray-300 mx-auto" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Trash is empty</h3>
          <p className="mt-2 text-gray-500">
            {searchQuery ? 'No deleted files match your search' : 'Deleted files will appear here'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold text-gray-900">Trash</h1>
            <p className="text-gray-500 mt-1">Files will be permanently deleted after 30 days</p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            {selectedFiles.length > 0 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={restoreSelected}
                  className="flex items-center space-x-2 px-3 py-2 gradient-accent text-white rounded-lg font-medium shadow-sm"
                >
                  <ApperIcon name="RotateCcw" size={16} />
                  <span>Restore ({selectedFiles.length})</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearSelection}
                  className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </motion.button>
              </>
            )}
            
            {deletedFiles.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEmptyConfirm(true)}
                className="flex items-center space-x-2 px-3 py-2 text-error border border-error rounded-lg hover:bg-error/5 transition-colors"
              >
                <ApperIcon name="Trash2" size={16} />
                <span>Empty Trash</span>
              </motion.button>
            )}
          </div>
        </div>
        
        {filteredFiles.length > 0 && (
          <div className="flex items-center space-x-4 mt-4">
            <button
              onClick={selectedFiles.length === filteredFiles.length ? clearSelection : selectAll}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              {selectedFiles.length === filteredFiles.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-gray-500">
              {selectedFiles.length} of {filteredFiles.length} selected
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {filteredFiles.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white rounded-lg p-4 shadow-card transition-all duration-200 cursor-pointer min-w-0 ${
              selectedFiles.includes(file.id) 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:shadow-hover'
            }`}
            onClick={() => toggleFileSelection(file.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedFiles.includes(file.id)
                      ? 'bg-primary border-primary'
                      : 'border-gray-300 hover:border-primary'
                  }`}
                >
                  {selectedFiles.includes(file.id) && (
                    <ApperIcon name="Check" size={12} className="text-white" />
                  )}
                </motion.div>
              </div>
              
              {file.thumbnailUrl ? (
                <img 
                  src={file.thumbnailUrl} 
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded flex-shrink-0 opacity-60"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                  <ApperIcon 
                    name={getFileIcon(file.mimeType)} 
                    size={24} 
                    className="text-gray-400"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm truncate break-words">{file.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1">
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  <p className="text-xs text-gray-500">
                    Deleted {format(new Date(file.deletedDate || file.modifiedDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    restoreFile(file.id);
                  }}
                  className="p-2 text-gray-400 hover:text-accent transition-colors"
                  title="Restore file"
                >
                  <ApperIcon name="RotateCcw" size={16} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Permanently delete this file? This cannot be undone.')) {
                      permanentlyDelete(file.id);
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-error transition-colors"
                  title="Delete permanently"
                >
                  <ApperIcon name="X" size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty trash confirmation */}
      <AnimatePresence>
        {showEmptyConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowEmptyConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                    <ApperIcon name="AlertTriangle" size={20} className="text-error" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Empty Trash?</h3>
                </div>
                <p className="text-gray-500 mb-6">
                  This will permanently delete all {deletedFiles.length} file(s) in trash. 
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEmptyConfirm(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={emptyTrash}
                    className="px-4 py-2 bg-error text-white rounded-lg font-medium shadow-sm hover:bg-error/90 transition-colors"
                  >
                    Empty Trash
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Trash;