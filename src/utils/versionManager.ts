export interface Version {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  commit?: string;
  data: {
    activeTab: string;
    generationTopic: string;
    brandDescription: string;
    productUrl: string;
    extractedData: string;
    generationResults: Record<string, string>;
    selectedFields: string[];
    trafficSettings: {
      yandexAndroid: number;
      googleAndroid: number;
      other: number;
      targetYandex: number;
      optimizeChannel: boolean;
    };
  };
}

const STORAGE_KEY = 'seo-generator-versions';
const CURRENT_VERSION_KEY = 'seo-generator-current-version';

export const versionManager = {
  saveVersion(name: string, description: string, data: Version['data'], commit?: string): Version {
    const versions = this.getAllVersions();
    
    const newVersion: Version = {
      id: `v_${Date.now()}`,
      name,
      description,
      timestamp: Date.now(),
      commit,
      data
    };
    
    versions.push(newVersion);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
    localStorage.setItem(CURRENT_VERSION_KEY, newVersion.id);
    
    return newVersion;
  },

  getAllVersions(): Version[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getVersion(id: string): Version | null {
    const versions = this.getAllVersions();
    return versions.find(v => v.id === id) || null;
  },

  getCurrentVersionId(): string | null {
    return localStorage.getItem(CURRENT_VERSION_KEY);
  },

  setCurrentVersion(id: string): Version | null {
    const version = this.getVersion(id);
    if (version) {
      localStorage.setItem(CURRENT_VERSION_KEY, id);
      return version;
    }
    return null;
  },

  deleteVersion(id: string): boolean {
    const versions = this.getAllVersions();
    const filtered = versions.filter(v => v.id !== id);
    
    if (filtered.length === versions.length) {
      return false;
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    if (this.getCurrentVersionId() === id) {
      localStorage.removeItem(CURRENT_VERSION_KEY);
    }
    
    return true;
  },

  exportVersion(id: string): string | null {
    const version = this.getVersion(id);
    if (!version) return null;
    
    return JSON.stringify(version, null, 2);
  },

  importVersion(jsonString: string): Version | null {
    try {
      const version: Version = JSON.parse(jsonString);
      
      if (!version.id || !version.name || !version.data) {
        return null;
      }
      
      const versions = this.getAllVersions();
      version.id = `v_${Date.now()}`;
      versions.push(version);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
      
      return version;
    } catch (error) {
      console.error('Import error:', error);
      return null;
    }
  }
};