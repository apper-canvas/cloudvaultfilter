import shareLinksData from '../mockData/shareLinks.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let shareLinks = [...shareLinksData];

const shareLinkService = {
  async getAll() {
    await delay(250);
    return [...shareLinks];
  },

  async getById(id) {
    await delay(200);
    const shareLink = shareLinks.find(s => s.id === id);
    if (!shareLink) throw new Error('Share link not found');
    return { ...shareLink };
  },

  async getByFileId(fileId) {
    await delay(200);
    const shareLink = shareLinks.find(s => s.fileId === fileId);
    return shareLink ? { ...shareLink } : null;
  },

  async create(shareLinkData) {
    await delay(300);
    
    // Generate a unique share URL
    const shareId = Math.random().toString(36).substring(2, 15);
    const baseUrl = 'https://cloudvault.app/s/';
    
    const newShareLink = {
      id: Date.now().toString(),
      url: `${baseUrl}${shareId}`,
      createdDate: new Date().toISOString(),
      accessCount: 0,
      ...shareLinkData
    };
    
    shareLinks = [...shareLinks, newShareLink];
    return { ...newShareLink };
  },

  async update(id, updates) {
    await delay(250);
    const index = shareLinks.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Share link not found');
    
    const updated = {
      ...shareLinks[index],
      ...updates
    };
    
    shareLinks = [...shareLinks.slice(0, index), updated, ...shareLinks.slice(index + 1)];
    return { ...updated };
  },

  async delete(fileId) {
    await delay(200);
    shareLinks = shareLinks.filter(s => s.fileId !== fileId);
    return true;
  },

  async incrementAccess(id) {
    await delay(100);
    const index = shareLinks.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Share link not found');
    
    const updated = {
      ...shareLinks[index],
      accessCount: shareLinks[index].accessCount + 1
    };
    
    shareLinks = [...shareLinks.slice(0, index), updated, ...shareLinks.slice(index + 1)];
    return { ...updated };
  },

  async getExpired() {
    await delay(200);
    const now = new Date();
    return shareLinks
      .filter(s => s.expiryDate && new Date(s.expiryDate) < now)
      .map(s => ({ ...s }));
  }
};

export default shareLinkService;