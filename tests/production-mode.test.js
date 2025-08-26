// Production Mode Tests
describe('Production Mode', () => {
  beforeEach(() => {
    // Reset to basic mode
    productionMode = false;
    document.getElementById('productionModeHost').classList.add('hidden');
  });

  test('Production mode toggle should work', () => {
    const toggle = document.getElementById('productionModeToggle');
    const indicator = document.getElementById('modeIndicator');
    const prodHost = document.getElementById('productionModeHost');
    
    // Initial state
    expect(productionMode).toBe(false);
    expect(indicator.textContent).toBe('Basic Mode');
    expect(prodHost.classList.contains('hidden')).toBe(true);
    
    // Toggle to production mode
    toggle.click();
    expect(productionMode).toBe(true);
    expect(indicator.textContent).toBe('Production Mode');
    expect(prodHost.classList.contains('hidden')).toBe(false);
    
    // Toggle back to basic mode
    toggle.click();
    expect(productionMode).toBe(false);
    expect(indicator.textContent).toBe('Basic Mode');
    expect(prodHost.classList.contains('hidden')).toBe(true);
  });

  test('Channel rack should be created', () => {
    productionMode = true;
    initializeProductionMode();
    
    const rack = document.getElementById('channelRack');
    expect(rack).toBeTruthy();
    expect(rack.children.length).toBeGreaterThan(0);
  });

  test('Pattern loading should work', () => {
    const pattern = PRODUCTION_PATTERNS['four-on-floor'];
    expect(pattern).toBeTruthy();
    expect(pattern.name).toBe('Four on Floor');
    expect(pattern.tracks.length).toBeGreaterThan(0);
  });

  test('Empty state should show when no notes', () => {
    // Clear all notes
    song.tracks.forEach(track => {
      track.clips[0].notes = [];
    });
    
    updateEmptyState();
    const emptyState = document.getElementById('emptyStateMessage');
    expect(emptyState.classList.contains('hidden')).toBe(false);
  });

  test('Empty state should hide when notes exist', () => {
    // Add a note
    song.tracks[0].clips[0].notes.push({
      tick: 0,
      dur: 48,
      midi: 60,
      vel: 0.8
    });
    
    updateEmptyState();
    const emptyState = document.getElementById('emptyStateMessage');
    expect(emptyState.classList.contains('hidden')).toBe(true);
  });
});
