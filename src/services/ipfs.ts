// IPFS service for storing bank statement files
interface IPFSConfig {
  gateway: string;
  apiEndpoint: string;
  projectId?: string;
  projectSecret?: string;
}

interface IPFSUploadResult {
  hash: string;
  size: number;
  url: string;
}

class IPFSService {
  private config: IPFSConfig;

  constructor() {
    this.config = {
      gateway: 'https://ipfs.io/ipfs/',
      apiEndpoint: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      projectId: import.meta.env.VITE_PINATA_API_KEY || '',
      projectSecret: import.meta.env.VITE_PINATA_SECRET_KEY || ''
    };
  }

  // Upload file to IPFS via Pinata
  async uploadFile(
    file: ArrayBuffer, 
    filename: string, 
    metadata?: any
  ): Promise<IPFSUploadResult> {
    try {
      const formData = new FormData();
      const blob = new Blob([file], { type: 'application/pdf' });
      formData.append('file', blob, filename);

      if (metadata) {
        formData.append('pinataMetadata', JSON.stringify({
          name: filename,
          keyvalues: metadata
        }));
      }

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'pinata_api_key': this.config.projectId,
          'pinata_secret_api_key': this.config.projectSecret
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`IPFS upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        hash: result.IpfsHash,
        size: result.PinSize,
        url: `${this.config.gateway}${result.IpfsHash}`
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error('Failed to upload file to IPFS');
    }
  }

  // Upload JSON metadata to IPFS
  async uploadJSON(data: any, name: string): Promise<IPFSUploadResult> {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const arrayBuffer = await blob.arrayBuffer();
      
      return this.uploadFile(arrayBuffer, `${name}.json`, {
        type: 'metadata',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('JSON upload error:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  }

  // Get file from IPFS
  async getFile(hash: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(`${this.config.gateway}${hash}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      return response.arrayBuffer();
    } catch (error) {
      console.error('IPFS fetch error:', error);
      throw new Error('Failed to fetch file from IPFS');
    }
  }

  // Get JSON from IPFS
  async getJSON(hash: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.gateway}${hash}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('IPFS JSON fetch error:', error);
      throw new Error('Failed to fetch JSON from IPFS');
    }
  }

  // Check if file exists on IPFS
  async fileExists(hash: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.gateway}${hash}`, {
        method: 'HEAD'
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Get file URL
  getFileUrl(hash: string): string {
    return `${this.config.gateway}${hash}`;
  }

  // Pin file to ensure persistence
  async pinFile(hash: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinByHash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.config.projectId,
          'pinata_secret_api_key': this.config.projectSecret
        },
        body: JSON.stringify({
          hashToPin: hash,
          pinataMetadata: {
            name: `Pinned-${hash}`,
            keyvalues: {
              pinned_at: new Date().toISOString()
            }
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Pin file error:', error);
      return false;
    }
  }
}

// Create singleton instance
export const ipfsService = new IPFSService();

export type { IPFSConfig, IPFSUploadResult };