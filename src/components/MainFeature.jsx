import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import ApperIcon from './ApperIcon';
import fileService from '../services/api/fileService';
import folderService from '../services/api/folderService';
import shareLinkService from '../services/api/shareLinkService';
import { format } from 'date-fns';

const MainFeature = () => {
  const { viewMode, searchQuery } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Core state
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // UI state
  const [selectedItems, setSelectedItems] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [shareLink, setShareLink] = useState('');
  
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  // Load data
  useEffect(() => {
    loadData();
  }, [currentFolderId]);

  // Handle URL path changes
  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments[0] === 'files' && pathSegments.length > 1) {
      const folderId = pathSegments[pathSegments.length - 1];
      setCurrentFolderId(folderId);
    } else {
      setCurrentFolderId(null);
    }
  }, [location.pathname]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [filesData, foldersData] = await Promise.all([
        fileService.getByFolder(currentFolderId),
        folderService.getByParent(currentFolderId)
      ]);
      setFiles(filesData);
      setFolders(foldersData);
      
      if (currentFolderId) {
        const currentFolder = await folderService.getById(currentFolderId);
        setBreadcrumbs(await folderService.getBreadcrumbs(currentFolderId));
      } else {
        setBreadcrumbs([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load files');
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  // File upload handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragActive(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const uploadFiles = async (fileList) => {
    setUploading(true);
    const newProgress = {};
    
    try {
      for (const file of fileList) {
        const fileId = Date.now() + Math.random();
        newProgress[fileId] = 0;
        setUploadProgress({ ...newProgress });

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          newProgress[fileId] = Math.min(newProgress[fileId] + 10, 90);
          setUploadProgress({ ...newProgress });
        }, 200);

        const uploadedFile = await fileService.upload(file, currentFolderId);
        
        clearInterval(progressInterval);
        newProgress[fileId] = 100;
        setUploadProgress({ ...newProgress });
        
        setFiles(prev => [...prev, uploadedFile]);
      }
      
      toast.success(`${fileList.length} file(s) uploaded successfully`);
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress({}), 1000);
    }
  };

  // Folder operations
  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const folder = await folderService.create({
        name: newFolderName.trim(),
        parentId: currentFolderId
      });
      setFolders(prev => [...prev, folder]);
      setShowNewFolderDialog(false);
      setNewFolderName('');
      toast.success('Folder created successfully');
    } catch (err) {
      toast.error('Failed to create folder');
    }
  };

  const navigateToFolder = (folderId) => {
    const path = folderId ? `/files/${folderId}` : '/';
    navigate(path);
  };

  // File operations
  const deleteItem = async (item, type) => {
    try {
      if (type === 'file') {
        await fileService.delete(item.id);
        setFiles(prev => prev.filter(f => f.id !== item.id));
      } else {
        await folderService.delete(item.id);
        setFolders(prev => prev.filter(f => f.id !== item.id));
      }
      toast.success(`${type} deleted successfully`);
      setContextMenu(null);
    } catch (err) {
      toast.error(`Failed to delete ${type}`);
    }
  };

  const renameItem = async (item, type, newName) => {
    try {
      if (type === 'file') {
        const updated = await fileService.update(item.id, { name: newName });
        setFiles(prev => prev.map(f => f.id === item.id ? updated : f));
      } else {
        const updated = await folderService.update(item.id, { name: newName });
        setFolders(prev => prev.map(f => f.id === item.id ? updated : f));
      }
      toast.success(`${type} renamed successfully`);
    } catch (err) {
      toast.error(`Failed to rename ${type}`);
    }
  };

  const generateShareLink = async (file) => {
    try {
      const shareData = await shareLinkService.create({
        fileId: file.id,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
      setShareLink(shareData.url);
      setShareModal(file);
    } catch (err) {
      toast.error('Failed to generate share link');
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Link copied to clipboard');
  };

  // Filter items based on search
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
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

  // Loading state
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

  // Error state
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
            onClick={loadData}
            className="px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm"
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full ${dragActive ? 'drop-zone-active' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header with breadcrumbs and actions */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigateToFolder(null)}
              className="text-gray-500 hover:text-primary transition-colors"
            >
              My Files
            </button>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.id} className="flex items-center space-x-2">
                <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
                <button
                  onClick={() => navigateToFolder(crumb.id)}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {crumb.name}
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNewFolderDialog(true)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ApperIcon name="FolderPlus" size={16} />
              <span className="hidden sm:inline">New Folder</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm"
            >
              <ApperIcon name="Upload" size={16} />
              <span className="hidden sm:inline">Upload</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Empty state */}
        {filteredFiles.length === 0 && filteredFolders.length === 0 && !loading && (
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm"
              >
                <ApperIcon name="Upload" size={16} />
                <span>Upload Files</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewFolderDialog(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ApperIcon name="FolderPlus" size={16} />
                <span>Create Folder</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Files and folders grid/list */}
        {(filteredFiles.length > 0 || filteredFolders.length > 0) && (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
            : 'space-y-2'
          }>
            {/* Folders */}
            {filteredFolders.map((folder, index) => (
              <motion.div
                key={folder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={viewMode === 'grid' 
                  ? 'bg-white rounded-lg p-4 shadow-card hover:shadow-hover cursor-pointer transition-all duration-200 group'
                  : 'bg-white rounded-lg p-3 shadow-card hover:shadow-hover cursor-pointer transition-all duration-200 flex items-center space-x-3'
                }
                onDoubleClick={() => navigateToFolder(folder.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, item: folder, type: 'folder' });
                }}
              >
                <div className={viewMode === 'grid' ? 'text-center' : 'flex items-center space-x-3 flex-1'}>
                  <ApperIcon 
                    name="Folder" 
                    size={viewMode === 'grid' ? 40 : 20} 
                    className="text-primary mx-auto group-hover:scale-105 transition-transform"
                  />
                  <div className={viewMode === 'grid' ? 'mt-2' : ''}>
                    <p className="font-medium text-gray-900 text-sm truncate">{folder.name}</p>
                    {viewMode === 'list' && (
                      <p className="text-xs text-gray-500">
                        {format(new Date(folder.createdDate), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Files */}
            {filteredFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (filteredFolders.length + index) * 0.05 }}
                className={viewMode === 'grid' 
                  ? 'bg-white rounded-lg p-4 shadow-card hover:shadow-hover cursor-pointer transition-all duration-200 group'
                  : 'bg-white rounded-lg p-3 shadow-card hover:shadow-hover cursor-pointer transition-all duration-200 flex items-center space-x-3'
                }
                onClick={() => setPreviewFile(file)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, item: file, type: 'file' });
                }}
              >
                <div className={viewMode === 'grid' ? 'text-center' : 'flex items-center space-x-3 flex-1'}>
                  {file.thumbnailUrl ? (
                    <img 
                      src={file.thumbnailUrl} 
                      alt={file.name}
                      className={`${viewMode === 'grid' ? 'w-12 h-12 mx-auto' : 'w-10 h-10'} object-cover rounded group-hover:scale-105 transition-transform`}
                    />
                  ) : (
                    <ApperIcon 
                      name={getFileIcon(file.mimeType)} 
                      size={viewMode === 'grid' ? 40 : 20} 
                      className="text-gray-400 mx-auto group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className={viewMode === 'grid' ? 'mt-2' : 'flex-1 min-w-0'}>
                    <p className="font-medium text-gray-900 text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                      {viewMode === 'list' && (
                        <span className="ml-2">
                          {format(new Date(file.uploadDate), 'MMM dd, yyyy')}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  {viewMode === 'list' && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        generateShareLink(file);
                      }}
                      className="p-2 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ApperIcon name="Share2" size={16} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upload progress overlay */}
      <AnimatePresence>
        {uploading && Object.keys(uploadProgress).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-hover p-4 z-40"
          >
            <div className="flex items-center space-x-3 mb-2">
              <ApperIcon name="Upload" size={20} className="text-primary" />
              <span className="font-medium">Uploading files...</span>
            </div>
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="w-64 bg-gray-200 rounded-full h-2 mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="gradient-primary h-2 rounded-full"
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag overlay */}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-30"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <ApperIcon name="Upload" className="w-16 h-16 text-primary mx-auto mb-4" />
              </motion.div>
              <p className="text-xl font-medium text-primary">Drop files here to upload</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            uploadFiles(Array.from(e.target.files));
          }
        }}
      />

      {/* New folder dialog */}
      <AnimatePresence>
        {showNewFolderDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowNewFolderDialog(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
                <input
                  type="text"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  autoFocus
                />
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowNewFolderDialog(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={createFolder}
                    disabled={!newFolderName.trim()}
                    className="px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* File preview modal */}
      <AnimatePresence>
        {previewFile && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50"
              onClick={() => setPreviewFile(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <ApperIcon name={getFileIcon(previewFile.mimeType)} size={20} className="text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900">{previewFile.name}</h3>
                      <p className="text-sm text-gray-500">{formatFileSize(previewFile.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => generateShareLink(previewFile)}
                      className="p-2 text-gray-500 hover:text-primary transition-colors"
                    >
                      <ApperIcon name="Share2" size={20} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open(previewFile.downloadUrl, '_blank')}
                      className="p-2 text-gray-500 hover:text-primary transition-colors"
                    >
                      <ApperIcon name="Download" size={20} />
                    </motion.button>
                    <button
                      onClick={() => setPreviewFile(null)}
                      className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <ApperIcon name="X" size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
                  {previewFile.mimeType?.startsWith('image/') ? (
                    <img 
                      src={previewFile.downloadUrl} 
                      alt={previewFile.name}
                      className="max-w-full h-auto mx-auto"
                    />
                  ) : (
                    <div className="text-center py-12">
                      <ApperIcon name={getFileIcon(previewFile.mimeType)} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Preview not available for this file type</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.open(previewFile.downloadUrl, '_blank')}
                        className="mt-4 px-4 py-2 gradient-primary text-white rounded-lg font-medium shadow-sm"
                      >
                        Download File
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {shareModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShareModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Share File</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <ApperIcon name={getFileIcon(shareModal.mimeType)} size={20} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{shareModal.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(shareModal.size)}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Share Link</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={shareLink}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={copyShareLink}
                        className="px-4 py-2 gradient-accent text-white rounded-r-lg font-medium shadow-sm"
                      >
                        <ApperIcon name="Copy" size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShareModal(null)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setContextMenu(null)}
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
                  if (newName && newName !== contextMenu.item.name) {
                    renameItem(contextMenu.item, contextMenu.type, newName);
                  }
                  setContextMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
              >
                <ApperIcon name="Edit2" size={16} />
                <span>Rename</span>
              </button>
              {contextMenu.type === 'file' && (
                <button
                  onClick={() => {
                    generateShareLink(contextMenu.item);
                    setContextMenu(null);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                >
                  <ApperIcon name="Share2" size={16} />
                  <span>Share</span>
                </button>
              )}
              <button
                onClick={() => deleteItem(contextMenu.item, contextMenu.type)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-error flex items-center space-x-2"
              >
                <ApperIcon name="Trash2" size={16} />
                <span>Delete</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MainFeature;