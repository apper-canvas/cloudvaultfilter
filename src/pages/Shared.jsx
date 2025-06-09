import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '../components/ApperIcon';
import shareLinkService from '../services/api/shareLinkService';
import fileService from '../services/api/fileService';

const Shared = () => {
  const { searchQuery } = useOutletContext();
  const [sharedFiles, setSharedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSharedFiles();
  }, []);

  const loadSharedFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const shareLinks = await shareLinkService.getAll();
      const filesWithShareData = await Promise.all(
        shareLinks.map(async (shareLink) => {
          const file = await fileService.getById(shareLink.fileId);
          return {
            ...file,
            shareLink: shareLink.url,
            sharedDate: shareLink.createdDate,
            accessCount: shareLink.accessCount,
            expiryDate: shareLink.expiryDate
          };
        })
      );
      setSharedFiles(filesWithShareData);
    } catch (err) {
      setError(err.message || 'Failed to load shared files');
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = sharedFiles.filter(file => 
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

  const copyShareLink = (shareLink) => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard');
  };

  const revokeShare = async (fileId) => {
    try {
      await shareLinkService.delete(fileId);
      setSharedFiles(prev => prev.filter(file => file.id !== fileId));
      toast.success('Share link revoked');
    } catch (err) {
      toast.error('Failed to revoke share link');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Shared Files</h1>
          <p className="text-gray-500 mt-1">Files you've shared with others</p>
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
                <div className="w-10 h-10 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
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
            onClick={loadSharedFiles}
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
          <h1 className="text-2xl font-heading font-bold text-gray-900">Shared Files</h1>
          <p className="text-gray-500 mt-1">Files you've shared with others</p>
        </div>
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="Share2" className="w-16 h-16 text-gray-300 mx-auto" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No shared files</h3>
          <p className="mt-2 text-gray-500">
            {searchQuery ? 'No shared files match your search' : 'Share files to collaborate with others'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Shared Files</h1>
        <p className="text-gray-500 mt-1">Files you've shared with others</p>
      </div>

      <div className="space-y-3">
        {filteredFiles.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
            className="bg-white rounded-lg p-4 shadow-card hover:shadow-hover transition-all duration-200 min-w-0"
          >
            <div className="flex items-center space-x-3">
              {file.thumbnailUrl ? (
                <img 
                  src={file.thumbnailUrl} 
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded flex items-center justify-center flex-shrink-0">
                  <ApperIcon 
                    name={getFileIcon(file.mimeType)} 
                    size={24} 
                    className="text-white"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 text-sm truncate break-words">{file.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-1">
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  <p className="text-xs text-gray-500">
                    Shared {format(new Date(file.sharedDate), 'MMM dd, yyyy')}
                  </p>
                  <div className="flex items-center space-x-1">
                    <ApperIcon name="Eye" size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{file.accessCount} views</span>
                  </div>
                </div>
                
                {file.expiryDate && new Date(file.expiryDate) < new Date() && (
                  <div className="flex items-center space-x-1 mt-1">
                    <ApperIcon name="AlertCircle" size={12} className="text-warning" />
                    <span className="text-xs text-warning">Expired</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copyShareLink(file.shareLink)}
                  className="p-2 text-gray-400 hover:text-accent transition-colors"
                  title="Copy link"
                >
                  <ApperIcon name="Copy" size={16} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => revokeShare(file.id)}
                  className="p-2 text-gray-400 hover:text-error transition-colors"
                  title="Revoke access"
                >
                  <ApperIcon name="UserX" size={16} />
                </motion.button>
              </div>
            </div>
            
            {/* Share link preview */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <ApperIcon name="Link" size={14} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={file.shareLink}
                  readOnly
                  className="flex-1 text-xs text-gray-500 bg-gray-50 border-0 rounded px-2 py-1 min-w-0"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyShareLink(file.shareLink)}
                  className="px-3 py-1 text-xs gradient-accent text-white rounded font-medium"
                >
                  Copy
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Shared;