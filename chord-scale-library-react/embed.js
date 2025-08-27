// Chord & Scale Library Embed Script
// Usage: Include this script in your HTML page and add <div id="chord-scale-library"></div>

(function() {
  'use strict';
  
  // Configuration
  const CONFIG = {
    containerId: 'chord-scale-library',
    defaultHeight: '600px',
    defaultWidth: '100%',
    theme: 'skin-default'
  };
  
  // Create container if it doesn't exist
  function createContainer() {
    let container = document.getElementById(CONFIG.containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = CONFIG.containerId;
      container.style.width = CONFIG.defaultWidth;
      container.style.height = CONFIG.defaultHeight;
      container.style.border = 'none';
      container.style.borderRadius = '8px';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
    }
    return container;
  }
  
  // Load the app
  function loadApp() {
    const container = createContainer();
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = window.location.origin + '/chord-scale-library-react/';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.title = 'Chord & Scale Library';
    iframe.allow = 'microphone; midi';
    
    // Clear container and add iframe
    container.innerHTML = '';
    container.appendChild(iframe);
    
    // Handle resize
    function resizeIframe() {
      iframe.style.height = container.offsetHeight + 'px';
    }
    
    window.addEventListener('resize', resizeIframe);
    resizeIframe();
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadApp);
  } else {
    loadApp();
  }
  
  // Expose API for external control
  window.ChordScaleLibrary = {
    // Change theme
    setTheme: function(theme) {
      const iframe = document.querySelector(`#${CONFIG.containerId} iframe`);
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'SET_THEME',
          theme: theme
        }, '*');
      }
    },
    
    // Load specific scale
    loadScale: function(key, mode) {
      const iframe = document.querySelector(`#${CONFIG.containerId} iframe`);
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'LOAD_SCALE',
          key: key,
          mode: mode
        }, '*');
      }
    },
    
    // Load specific chord
    loadChord: function(root, quality) {
      const iframe = document.querySelector(`#${CONFIG.containerId} iframe`);
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'LOAD_CHORD',
          root: root,
          quality: quality
        }, '*');
      }
    },
    
    // Resize container
    resize: function(width, height) {
      const container = document.getElementById(CONFIG.containerId);
      if (container) {
        if (width) container.style.width = width;
        if (height) container.style.height = height;
      }
    }
  };
  
})();
