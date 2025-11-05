export interface StorageAdapter {
  getUploadUrl(key: string, contentType: string): Promise<{ url: string; fields?: Record<string, string> }>;
  save(buffer: Buffer, key: string, contentType: string): Promise<string>;
  delete(key: string): Promise<void>;
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private readonly baseDir = 'public/uploads') {}

  async getUploadUrl(key: string) {
    return { url: `/uploads/${key}` };
  }

  async save(buffer: Buffer, key: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), this.baseDir, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);
    return `/uploads/${key}`;
  }

  async delete(key: string): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const filePath = path.join(process.cwd(), this.baseDir, key);
    await fs.rm(filePath, { force: true });
  }
}
