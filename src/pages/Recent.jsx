import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { format, isToday, isYesterday, subDays } from 'date-fns';
import ApperIcon from '../components/ApperIcon';
import fileService from '../services/api/fileService';

const Recent = () => {
  const { searchQuery } = useOutletContext();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const allFiles = await fileService.getAll();
      const recentFiles = allFiles
        .sort((a, b) => new Date(b.modifiedDate) - new Date(a.modifiedDate))
        .slice(0, 50);
      setFiles(recentFiles);
    } catch (err) {
      setError(err.message || 'Failed to load recent files');
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(file => 
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

  const getDateLabel = (date) => {
    const fileDate = new Date(date);
    if (isToday(fileDate)) return 'Today';
    if (isYesterday(fileDate)) return 'Yesterday';
    if (fileDate > subDays(new Date(), 7)) return format(fileDate, 'EEEE');
    return format(fileDate, 'MMM dd, yyyy');
  };

  const groupFilesByDate = (files) => {
    const groups = {};
    files.forEach(file => {
      const dateLabel = getDateLabel(file.modifiedDate);
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(file);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-gray-900">Recent Files</h1>
          <p className="text-gray-500 mt-1">Files you've accessed recently</p>
        </div>
        
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
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
            onClick={loadRecentFiles}
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
          <h1 className="text-2xl font-heading font-bold text-gray-900">Recent Files</h1>
          <p className="text-gray-500 mt-1">Files you've accessed recently</p>
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
            <ApperIcon name="Clock" className="w-16 h-16 text-gray-300 mx-auto" />
          </motion.div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No recent files</h3>
          <p className="mt-2 text-gray-500">
            {searchQuery ? 'No files match your search' : 'Start accessing files to see them here'}
          </p>
        </motion.div>
      </div>
    );
  }

  const groupedFiles = groupFilesByDate(filteredFiles);

  return (
    <div className="p-6 max-w-full overflow-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-gray-900">Recent Files</h1>
        <p className="text-gray-500 mt-1">Files you've accessed recently</p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedFiles).map(([dateLabel, files], groupIndex) => (
          <motion.div
            key={dateLabel}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="max-w-full overflow-hidden"
          >
            <h3 className="text-sm font-medium text-gray-500 mb-3 break-words">{dateLabel}</h3>
            <div className="space-y-2">
              {files.map((file, fileIndex) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (groupIndex * 0.1) + (fileIndex * 0.05) }}
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
                  className="bg-white rounded-lg p-4 shadow-card hover:shadow-hover cursor-pointer transition-all duration-200 flex items-center space-x-3 min-w-0"
                >
                  {file.thumbnailUrl ? (
                    <img 
                      src={file.thumbnailUrl} 
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <ApperIcon 
                      name={getFileIcon(file.mimeType)} 
                      size={20} 
                      className="text-gray-400 flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate break-words">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • Modified {format(new Date(file.modifiedDate), 'h:mm a')}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle download
                      }}
                    >
                      <ApperIcon name="Download" size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle share
                      }}
                    >
                      <ApperIcon name="Share2" size={16} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Recent;