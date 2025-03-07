import { channels, getUniqueCategories, filterChannelsByCategory, searchChannels } from './channels.js';

class ModernTVApp {
  constructor() {
    this.player = document.getElementById('videoPlayer');
    this.categoriesList = document.getElementById('categoriesList');
    this.channelsList = document.getElementById('channelsList');
    this.currentCategory = null;
    this.hls = null;
    this.scroll = new LocomotiveScroll({
      el: document.querySelector('[data-scroll-container]'),
      smooth: true,
      smartphone: { smooth: true },
      tablet: { smooth: true }
    });

    this.channelInfo = document.createElement('div');
    this.channelInfo.className = 'channel-info';
    this.playerContainer = document.querySelector('.player-container');
    this.playerContainer.appendChild(this.channelInfo);
    
    this.playerTransition = document.createElement('div');
    this.playerTransition.className = 'player-transition';
    this.playerContainer.appendChild(this.playerTransition);
    
    this.loading = document.createElement('div');
    this.loading.className = 'channel-loading';
    this.playerContainer.appendChild(this.loading);

    this.searchIcon = document.querySelector('.search-icon');
    this.searchBar = document.querySelector('.search-bar');
    this.searchInput = document.querySelector('.search-input');
    this.searchOverlay = document.querySelector('.search-overlay');
    this.searchClose = document.querySelector('.search-close');
    this.searchResults = document.querySelector('.search-results');
    
    this.deviceId = this.getOrCreateDeviceId();
    this.favorites = this.loadFavorites();

    // Add favorites icon and overlay
    this.favoritesIcon = document.querySelector('.favorites-icon');
    this.favoritesOverlay = document.querySelector('.favorites-overlay');
    this.favoritesClose = document.querySelector('.favorites-close');
    this.favoritesResults = document.querySelector('.favorites-results');

    this.initializeHLS();
    this.initializeCategories();
    this.bindEvents();
    this.initializeEffects();
    this.initializeSearch();
    this.initializeFavorites();
  }

  initializeHLS() {
    if (Hls.isSupported()) {
      this.hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true
      });
      this.hls.attachMedia(this.player);
    }
  }

  initializeCategories = () => {
    const categories = getUniqueCategories();
    categories.forEach((category, index) => {
      const button = document.createElement('button');
      button.className = 'category-button';
      button.textContent = `${category} (${filterChannelsByCategory(category).length})`;
      button.style.animationDelay = `${index * 0.1}s`;
      button.dataset.scroll = true;
      button.dataset.scrollSpeed = "1.1";
      button.addEventListener('click', () => this.selectCategory(category));
      this.categoriesList.appendChild(button);
    });

    if (categories.length > 0) {
      this.selectCategory(categories[0]);
    }
  };

  initializeEffects() {
    // Agregar efectos de parallax y scroll
    this.scroll.on('scroll', (args) => {
      document.body.style.setProperty('--scroll', args.scroll.y);
    });

    // Efecto de resplandor al hacer hover en los elementos
    const addGlowEffect = (element) => {
      element.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = element.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        element.style.setProperty('--x', `${x}%`);
        element.style.setProperty('--y', `${y}%`);
      });
    };

    document.querySelectorAll('.channel-card').forEach(addGlowEffect);
  }

  selectCategory(category) {
    this.currentCategory = category;
    
    document.querySelectorAll('.category-button').forEach(button => {
      button.classList.toggle('active', button.textContent === category);
    });

    const filteredChannels = filterChannelsByCategory(category);
    this.displayChannels(filteredChannels);
  }

  displayChannels(channelsList) {
    this.channelsList.innerHTML = '';
    
    channelsList.forEach((channel, index) => {
      const channelCard = document.createElement('div');
      channelCard.className = 'channel-card';
      channelCard.dataset.scroll = true;
      channelCard.dataset.scrollSpeed = (1 + (index % 3) * 0.1).toFixed(1);
      
      const isFav = this.isFavorite(channel);
      
      channelCard.innerHTML = `
        <div class="heart-icon ${isFav ? 'active' : ''}" data-channel="${channel.name}">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <img 
          class="channel-image" 
          src="${channel.image}" 
          alt="${channel.name}"
          loading="lazy"
        />
        <h3>${channel.name}</h3>
        <div class="channel-info-overlay">
          <span class="channel-country">${channel.country}</span>
          <span class="channel-language">${channel.language}</span>
          ${channel.isLive ? '<span class="live-badge">EN VIVO</span>' : ''}
        </div>
      `;
      
      const heartIcon = channelCard.querySelector('.heart-icon');
      heartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(channel);
      });
      
      channelCard.addEventListener('click', () => this.playChannel(channel));
      this.channelsList.appendChild(channelCard);
    });

    this.scroll.update();
  }

  async playChannel(channel) {
    this.loading.classList.add('active');
    this.playerTransition.classList.add('active');
    
    try {
      if (Hls.isSupported() && channel.url) {
        this.hls.loadSource(channel.url);
      } else if (this.player.canPlayType('application/vnd.apple.mpegurl')) {
        this.player.src = channel.url;
      }
      
      await this.player.play();
      
      this.channelInfo.textContent = channel.name;
      this.channelInfo.classList.add('active');
      
      setTimeout(() => {
        this.loading.classList.remove('active');
        this.playerTransition.classList.remove('active');
      }, 1000);
    } catch (error) {
      console.error('Error playing channel:', error);
      this.loading.classList.remove('active');
      this.playerTransition.classList.remove('active');
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.updateLayout();
    });

    // Añadir efecto de scroll suave para categorías
    this.categoriesList.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        this.categoriesList.scrollLeft += e.deltaY;
      }
    });
  }

  updateLayout() {
    // Implementar ajustes de layout responsive si es necesario
  }

  initializeSearch() {
    this.searchIcon.addEventListener('click', () => {
      this.searchBar.classList.add('active');
      this.searchInput.focus();
    });

    this.searchInput.addEventListener('input', (e) => {
      if (e.target.value.length >= 2) {
        this.showSearchOverlay();
        this.performSearch(e.target.value);
      }
    });

    this.searchClose.addEventListener('click', () => {
      this.hideAllOverlays();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAllOverlays();
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container') && 
          !e.target.closest('.search-overlay')) {
        this.searchBar.classList.remove('active');
      }
    });
  }

  performSearch = (query) => {
    const results = searchChannels(query);
    this.displaySearchResults(results);
  };

  displaySearchResults(results) {
    this.searchResults.innerHTML = '';

    if (results.length === 0) {
      this.searchResults.innerHTML = `
        <div class="no-results">
          No se encontraron canales que coincidan con tu búsqueda
        </div>
      `;
      return;
    }

    results.forEach(channel => {
      const channelCard = document.createElement('div');
      channelCard.className = 'channel-card';
      
      channelCard.innerHTML = `
        <img 
          class="channel-image" 
          src="${channel.image}" 
          alt="${channel.name}"
          loading="lazy"
          onerror="this.src='data:image/svg+xml,${encodeURIComponent(`
            <svg viewBox="0 0 24 24" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
              <rect width="24" height="24" fill="var(--accent-color)" rx="8"/>
              <text x="12" y="12" font-size="8" fill="white" text-anchor="middle" dominant-baseline="middle">
                ${channel.name.substring(0, 2)}
              </text>
            </svg>
          `)}'"/>
        <h3>${channel.name}</h3>
        <div class="channel-country">${channel.country}</div>
      `;

      channelCard.addEventListener('click', () => {
        this.playChannel(channel);
        this.hideSearchOverlay();
      });

      this.searchResults.appendChild(channelCard);
    });
  }

  showSearchOverlay() {
    this.hideAllOverlays();
    this.searchOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  hideSearchOverlay() {
    this.searchOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  initializeFavorites() {
    this.favoritesIcon.addEventListener('click', () => {
      this.showFavoritesOverlay();
      this.displayFavoriteChannels();
    });

    this.favoritesClose.addEventListener('click', () => {
      this.hideAllOverlays();
    });
  }

  showFavoritesOverlay() {
    this.hideAllOverlays();
    this.favoritesOverlay.classList.add('active');
  }

  hideFavoritesOverlay() {
    this.favoritesOverlay.classList.remove('active');
  }

  hideAllOverlays() {
    this.hideSearchOverlay();
    this.hideFavoritesOverlay();
    this.searchBar.classList.remove('active');
    this.searchInput.value = '';
  }

  getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('tvapp_device_id');
    if (!deviceId) {
      deviceId = 'device_' + crypto.randomUUID();
      localStorage.setItem('tvapp_device_id', deviceId);
    }
    return deviceId;
  }

  loadFavorites() {
    const favorites = localStorage.getItem(`favorites_${this.deviceId}`);
    return favorites ? JSON.parse(favorites) : [];
  }

  saveFavorites() {
    localStorage.setItem(`favorites_${this.deviceId}`, JSON.stringify(this.favorites));
  }

  toggleFavorite(channel) {
    const index = this.favorites.findIndex(fav => fav.name === channel.name);
    const heartIcon = document.querySelector(`[data-channel="${channel.name}"] .heart-icon`);
    
    if (index === -1) {
      this.favorites.push(channel);
      heartIcon?.classList.add('active');
    } else {
      this.favorites.splice(index, 1);
      heartIcon?.classList.remove('active');
    }
    
    this.saveFavorites();
    this.displayFavoriteChannels();
  }

  isFavorite(channel) {
    return this.favorites.some(fav => fav.name === channel.name);
  }

  displayFavoriteChannels() {
    this.favoritesResults.innerHTML = '';
    
    if (this.favorites.length === 0) {
      this.favoritesResults.innerHTML = `
        <div class="no-results">
          No tienes canales favoritos
        </div>
      `;
      return;
    }

    this.favorites.forEach(channel => {
      const channelCard = document.createElement('div');
      channelCard.className = 'channel-card';
      
      channelCard.innerHTML = `
        <div class="heart-icon active" data-channel="${channel.name}">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <img 
          class="channel-image" 
          src="${channel.image}" 
          alt="${channel.name}"
          loading="lazy"
        />
        <h3>${channel.name}</h3>
        <div class="channel-country">${channel.country}</div>
      `;

      const heartIcon = channelCard.querySelector('.heart-icon');
      heartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFavorite(channel);
      });

      channelCard.addEventListener('click', () => {
        this.playChannel(channel);
        this.hideFavoritesOverlay();
      });

      this.favoritesResults.appendChild(channelCard);
    });
  }
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
  new ModernTVApp();
});