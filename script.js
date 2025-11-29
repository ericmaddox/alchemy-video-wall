// Configuration
const CONFIG = {
  maxConcurrentPlayers: 8,
  autoSaveKey: 'videowall_state',
  autoSaveEnabled: true
};

// Toast system
class Toast {
  constructor() { this.element = document.getElementById('toast'); }
  show(msg, dur = 3000) {
    this.element.textContent = msg;
    this.element.classList.add('show');
    setTimeout(() => this.hide(), dur);
  }
  hide() { this.element.classList.remove('show'); }
}

// Video player class
class VideoPlayer {
  constructor(url, container) {
    this.url = url;
    this.container = container;
    this.hls = null;
    this.render();
  }

  render() {
    this.container.innerHTML = `<div class="loading"><div class="spinner"></div><div>Loading stream...</div></div>`;
    const video = document.createElement('video');
    video.muted = true;

    if (Hls.isSupported()) {
      this.hls = new Hls();
      this.hls.loadSource(this.url);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    } else if (video.canPlayType('application/x-mpegURL')) {
      video.src = this.url;
      video.addEventListener('loadedmetadata', () => video.play());
    } else {
      this.container.innerHTML = `<div class="error">HLS not supported</div>`;
      return;
    }

    setTimeout(() => this.container.appendChild(video), 100);
  }

  play() { const v = this.container.querySelector('video'); v?.play(); }
  pause() { const v = this.container.querySelector('video'); v?.pause(); }
  mute() { const v = this.container.querySelector('video'); if (v) v.muted = true; }
  unmute() { const v = this.container.querySelector('video'); if (v) v.muted = false; }
  destroy() { this.hls?.destroy(); }
}

// Main app
class VideoWall {
  constructor() {
    this.urls = [];
    this.players = new Map();
    this.toast = new Toast();
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadFromStorage();
    this.updateGrid();
  }

  bindEvents() {
    document.getElementById('addBtn').addEventListener('click', () => this.addUrl());
    document.getElementById('urlInput').addEventListener('keypress', e => {
      if (e.key === 'Enter') this.addUrl();
    });
    document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());
    document.getElementById('playAllBtn').addEventListener('click', () => this.playAll());
    document.getElementById('pauseAllBtn').addEventListener('click', () => this.pauseAll());
    document.getElementById('muteAllBtn').addEventListener('click', () => this.muteAll());
    document.getElementById('unmuteAllBtn').addEventListener('click', () => this.unmuteAll());
    document.getElementById('exportBtn').addEventListener('click', () => this.exportJSON());
    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', (e) => this.importJSON(e));
    document.getElementById('gridSize').addEventListener('change', (e) => this.updateGridSize(e.target.value));
  }

  addUrl() {
    const input = document.getElementById('urlInput');
    const url = input.value.trim();
    if (!url.endsWith('.m3u8')) return this.toast.show('Enter valid m3u8 URL');
    if (this.urls.includes(url)) return this.toast.show('Already added');
    this.urls.push(url);
    input.value = '';
    this.updateGrid();
    this.saveWall();
  }

  updateGrid() {
    const grid = document.getElementById('videoGrid');
    if (!this.urls.length) {
      grid.innerHTML = `<div class="empty-state"><h3>No streams added</h3></div>`;
      return;
    }

    grid.innerHTML = '';
    this.urls.forEach(url => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <div class="video-wrapper"></div>
        <div class="video-controls">
          <div class="video-info">
            <div class="video-url" title="${url}">${url}</div>
          </div>
          <div class="video-actions">
            <button class="btn-mute">🔊</button>
            <button class="btn-remove">✕</button>
          </div>
        </div>`;
      grid.appendChild(card);

      const player = new VideoPlayer(url, card.querySelector('.video-wrapper'));
      this.players.set(url, player);

      card.querySelector('.btn-remove').addEventListener('click', () => this.removeUrl(url));
      card.querySelector('.btn-mute').addEventListener('click', e => {
        const video = card.querySelector('video');
        if (!video) return;
        video.muted = !video.muted;
        e.target.textContent = video.muted ? '🔇' : '🔊';
      });
    });
  }

  playAll() { this.players.forEach(p => p.play()); }
  pauseAll() { this.players.forEach(p => p.pause()); }
  muteAll() { this.players.forEach(p => p.mute()); }
  unmuteAll() { this.players.forEach(p => p.unmute()); }

  removeUrl(url) {
    this.urls = this.urls.filter(u => u !== url);
    this.players.get(url)?.destroy();
    this.players.delete(url);
    this.updateGrid();
    this.saveWall();
  }

  clearAll() {
    this.players.forEach(p => p.destroy());
    this.urls = [];
    this.updateGrid();
    localStorage.removeItem(CONFIG.autoSaveKey);
  }

  saveWall() {
    localStorage.setItem(CONFIG.autoSaveKey, JSON.stringify(this.urls));
  }

  loadFromStorage() {
    const saved = localStorage.getItem(CONFIG.autoSaveKey);
    if (saved) this.urls = JSON.parse(saved);
  }

  updateGridSize(columns) {
    const grid = document.getElementById('videoGrid');
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  }

  exportJSON() {
    const data = {
      urls: this.urls,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `videowall_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.show('Exported successfully');
  }

  importJSON(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.urls && Array.isArray(data.urls)) {
          this.urls = data.urls;
          this.updateGrid();
          this.saveWall();
          this.toast.show(`Imported ${data.urls.length} streams`);
        } else {
          this.toast.show('Invalid JSON format');
        }
      } catch (err) {
        this.toast.show('Error reading file');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  }
}

const videoWall = new VideoWall();
