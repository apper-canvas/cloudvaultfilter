import foldersData from '../mockData/folders.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let folders = [...foldersData];

const folderService = {
  async getAll() {
    await delay(250);
    return [...folders];
  },

  async getById(id) {
    await delay(200);
    const folder = folders.find(f => f.id === id);
    if (!folder) throw new Error('Folder not found');
    return { ...folder };
  },

  async getByParent(parentId) {
    await delay(200);
    return folders.filter(f => f.parentId === parentId).map(f => ({ ...f }));
  },

  async create(folderData) {
    await delay(300);
    
    // Generate path
    let path = folderData.name;
    if (folderData.parentId) {
      const parent = folders.find(f => f.id === folderData.parentId);
      if (parent) {
        path = `${parent.path}/${folderData.name}`;
      }
    }
    
    const newFolder = {
      id: Date.now().toString(),
      createdDate: new Date().toISOString(),
      path: path,
      childCount: 0,
      ...folderData
    };
    
    folders = [...folders, newFolder];
    return { ...newFolder };
  },

  async update(id, updates) {
    await delay(250);
    const index = folders.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Folder not found');
    
    const updated = {
      ...folders[index],
      ...updates
    };
    
    // Update path if name changed
    if (updates.name && updates.name !== folders[index].name) {
      const oldPath = folders[index].path;
      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = updates.name;
      updated.path = pathParts.join('/');
    }
    
    folders = [...folders.slice(0, index), updated, ...folders.slice(index + 1)];
    return { ...updated };
  },

  async delete(id) {
    await delay(300);
    // Remove folder and all its children
    const toDelete = [id];
    const findChildren = (parentId) => {
      folders.forEach(f => {
        if (f.parentId === parentId) {
          toDelete.push(f.id);
          findChildren(f.id);
        }
      });
    };
    findChildren(id);
    
    folders = folders.filter(f => !toDelete.includes(f.id));
    return true;
  },

  async getBreadcrumbs(folderId) {
    await delay(100);
    const breadcrumbs = [];
    let currentId = folderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (!folder) break;
      breadcrumbs.unshift({ ...folder });
      currentId = folder.parentId;
    }
    
    return breadcrumbs;
  },

  async getTree() {
    await delay(200);
    const buildTree = (parentId = null) => {
      return folders
        .filter(f => f.parentId === parentId)
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id)
        }));
    };
    
    return buildTree();
  }
};

export default folderService;