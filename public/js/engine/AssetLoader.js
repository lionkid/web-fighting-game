export class AssetLoader {
  constructor() {
    this.images = new Map();
    this.loaded = 0;
    this.total = 0;
  }

  addImage(key, src) {
    this.total++;
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        this.loaded++;
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Failed to load: ${src}`));
      img.src = src;
    });
  }

  getImage(key) {
    return this.images.get(key);
  }

  async loadAll(manifest) {
    const promises = manifest.map(({ key, src }) => this.addImage(key, src));
    return Promise.all(promises);
  }

  get progress() {
    return this.total === 0 ? 1 : this.loaded / this.total;
  }
}
