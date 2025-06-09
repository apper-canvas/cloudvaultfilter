import filesData from '../mockData/files.json';
import foldersData from '../mockData/folders.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let files = [...filesData];

const fileService = {
  async getAll() {
    await delay(300);
    return [...files];
  },

  async getById(id) {
    await delay(200);
    const file = files.find(f => f.id === id);
    if (!file) throw new Error('File not found');
    return { ...file };
  },

  async getByFolder(folderId) {
    await delay(250);
    return files.filter(f => f.folderId === folderId).map(f => ({ ...f }));
  },

  async upload(file, folderId = null) {
    await delay(1000); // Simulate upload time
    
    const newFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type.split('/')[0],
      mimeType: file.type,
      uploadDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      folderId: folderId,
      thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      downloadUrl: URL.createObjectURL(file),
      shareLink: null,
      isStarred: false
    };
    
    files = [...files, newFile];
    return { ...newFile };
  },

  async create(fileData) {
    await delay(400);
    const newFile = {
      id: Date.now().toString(),
      uploadDate: new Date().toISOString(),
      modifiedDate: new Date().toISOString(),
      shareLink: null,
      isStarred: false,
      ...fileData
    };
    files = [...files, newFile];
    return { ...newFile };
  },

  async update(id, updates) {
    await delay(300);
    const index = files.findIndex(f => f.id === id);
    if (index === -1) throw new Error('File not found');
    
    const updated = {
      ...files[index],
      ...updates,
      modifiedDate: new Date().toISOString()
    };
    files = [...files.slice(0, index), updated, ...files.slice(index + 1)];
    return { ...updated };
  },

  async delete(id) {
    await delay(250);
    const index = files.findIndex(f => f.id === id);
    if (index === -1) throw new Error('File not found');
    
    const file = files[index];
    const deletedFile = {
      ...file,
      deletedDate: new Date().toISOString(),
      isDeleted: true
    };
    files = [...files.slice(0, index), deletedFile, ...files.slice(index + 1)];
    return true;
  },

  async getDeleted() {
    await delay(300);
    return files.filter(f => f.isDeleted).map(f => ({ ...f }));
  },

  async restore(id) {
    await delay(250);
    const index = files.findIndex(f => f.id === id);
    if (index === -1) throw new Error('File not found');
    
    const restored = {
      ...files[index],
      isDeleted: false,
      deletedDate: null
    };
    files = [...files.slice(0, index), restored, ...files.slice(index + 1)];
    return { ...restored };
  },

  async permanentDelete(id) {
    await delay(250);
    files = files.filter(f => f.id !== id);
    return true;
  },

  async moveToFolder(id, folderId) {
    await delay(300);
    return this.update(id, { folderId });
  },

  async toggleStar(id) {
    await delay(200);
    const file = files.find(f => f.id === id);
    if (!file) throw new Error('File not found');
    return this.update(id, { isStarred: !file.isStarred });
  }
};

export default fileService;