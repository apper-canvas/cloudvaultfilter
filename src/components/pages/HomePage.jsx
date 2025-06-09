import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Services
import fileService from '@/services/api/fileService';
import folderService from '@/services/api/folderService';
import shareLinkService from '@/services/api/shareLinkService';

// Organisms
import FileBrowserHeader from '@/components/organisms/FileBrowserHeader';
import FileBrowserContent from '@/components/organisms/FileBrowserContent';
import NewFolderDialog from '@/components/organisms/NewFolderDialog';
import FilePreviewModal from '@/components/organisms/FilePreviewModal';
import ShareLinkModal from '@/components/organisms/ShareLinkModal';
import UploadProgressOverlay from '@/components/organisms/UploadProgressOverlay';
import DragAndDropOverlay from '@/components/organisms/DragAndDropOverlay';
import ItemContextMenu from '@/components/organisms/ItemContextMenu';

const HomePage = () => {
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
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [previewFile, setPreviewFile] = useState(null);
    const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
    const [contextMenu, setContextMenu] = useState(null); // { x, y, item, type }
    const [shareModal, setShareModal] = useState(null); // The file object being shared
    const [shareLink, setShareLink] = useState('');

    const fileInputRef = useRef(null);
    const dragCounter = useRef(0);

    // Utility functions (defined here as they are tightly coupled with file/folder data and ApperIcon)
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

    // Load data
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
                setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => ({
                        ...prev,
                        [fileId]: Math.min((prev[fileId] || 0) + 10, 90)
                    }));
                }, 200);

                const uploadedFile = await fileService.upload(file, currentFolderId);

                clearInterval(progressInterval);
                setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

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
    const handleCreateFolder = async (folderName) => {
        if (!folderName.trim()) return;

        try {
            const folder = await folderService.create({
                name: folderName.trim(),
                parentId: currentFolderId
            });
            setFolders(prev => [...prev, folder]);
            setShowNewFolderDialog(false);
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
        } catch (err) {
            toast.error(`Failed to delete ${type}`);
        } finally {
            setContextMenu(null);
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
            setPreviewFile(null);
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

    const handleFileItemClick = (file) => {
        setPreviewFile(file);
    };

    const handleItemContextMenu = (e, item, type) => {
        setContextMenu({ x: e.clientX, y: e.clientY, item, type });
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`relative h-full ${dragActive ? 'drop-zone-active' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <FileBrowserHeader
                breadcrumbs={breadcrumbs}
                onNavigateToFolder={navigateToFolder}
                onNewFolderClick={() => setShowNewFolderDialog(true)}
                onUploadClick={handleUploadButtonClick}
            />

            <FileBrowserContent
                filteredFiles={filteredFiles}
                filteredFolders={filteredFolders}
                viewMode={viewMode}
                loading={loading}
                error={error}
                onReloadData={loadData}
                onUploadClick={handleUploadButtonClick}
                onNewFolderClick={() => setShowNewFolderDialog(true)}
                onItemClick={handleFileItemClick}
                onFolderDoubleClick={navigateToFolder}
                onItemContextMenu={handleItemContextMenu}
                onShareFile={generateShareLink}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
            />

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

            <UploadProgressOverlay
                uploading={uploading}
                uploadProgress={uploadProgress}
            />

            <DragAndDropOverlay
                dragActive={dragActive}
            />

            <NewFolderDialog
                isOpen={showNewFolderDialog}
                onClose={() => setShowNewFolderDialog(false)}
                onCreateFolder={handleCreateFolder}
            />

            <FilePreviewModal
                file={previewFile}
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
                onGenerateShareLink={generateShareLink}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
            />

            <ShareLinkModal
                file={shareModal}
                isOpen={!!shareModal}
                onClose={() => setShareModal(null)}
                shareLink={shareLink}
                onCopyLink={copyShareLink}
                getFileIcon={getFileIcon}
                formatFileSize={formatFileSize}
            />

            <ItemContextMenu
                contextMenu={contextMenu}
                onClose={() => setContextMenu(null)}
                onRename={renameItem}
                onShare={generateShareLink}
                onDelete={deleteItem}
            />
        </div>
    );
};

export default HomePage;