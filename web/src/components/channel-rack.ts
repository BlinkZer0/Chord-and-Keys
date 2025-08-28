import { SynthPreset, organizePresets, searchPresets } from '../engine/synth-presets';

export interface ChannelRackOptions {
  onPresetSelect?: (preset: SynthPreset) => void;
  onPresetPreview?: (preset: SynthPreset) => void;
  defaultPresets?: string[];
}

export class ChannelRack {
  private container: HTMLElement;
  private options: ChannelRackOptions;
  private searchInput!: HTMLInputElement;
  private treeContainer!: HTMLElement;
  private selectedPreset: SynthPreset | null = null;
  private expandedCategories = new Set<string>();
  private expandedSubcategories = new Set<string>();

  constructor(container: HTMLElement, options: ChannelRackOptions = {}) {
    this.container = container;
    this.options = options;
    this.render();
  }

  private render() {
    this.container.innerHTML = '';
    this.container.className = 'channel-rack bg-slate-800 border border-slate-700 rounded-lg p-4 h-full overflow-hidden flex flex-col';

    // Header
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between mb-4';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold text-slate-200';
    title.textContent = 'Synth Presets';
    
    const presetCount = document.createElement('span');
    presetCount.className = 'text-sm text-slate-400';
    presetCount.textContent = `${organizePresets().flatMap(cat => cat.subcategories).reduce((sum, sub) => sum + sub.presets.length, 0)} presets`;
    
    header.appendChild(title);
    header.appendChild(presetCount);

    // Search bar
    const searchContainer = document.createElement('div');
    searchContainer.className = 'relative mb-4';
    
    this.searchInput = document.createElement('input');
    this.searchInput.type = 'text';
    this.searchInput.placeholder = 'Search presets...';
    this.searchInput.className = 'w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';
    
    const searchIcon = document.createElement('div');
    searchIcon.className = 'absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400';
    searchIcon.innerHTML = '🔍';
    
    searchContainer.appendChild(this.searchInput);
    searchContainer.appendChild(searchIcon);

    // Tree container
    this.treeContainer = document.createElement('div');
    this.treeContainer.className = 'flex-1 overflow-y-auto space-y-2';

    // Add event listeners
    this.searchInput.addEventListener('input', () => this.handleSearch());
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.searchInput.value = '';
        this.handleSearch();
      }
    });

    // Assemble
    this.container.appendChild(header);
    this.container.appendChild(searchContainer);
    this.container.appendChild(this.treeContainer);

    // Render initial tree
    this.renderTree();
  }

  private handleSearch() {
    const query = this.searchInput.value.trim();
    if (query === '') {
      this.renderTree();
    } else {
      this.renderSearchResults(query);
    }
  }

  private renderSearchResults(query: string) {
    const results = searchPresets(query);
    this.treeContainer.innerHTML = '';

    if (results.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'text-center py-8 text-slate-400';
      noResults.textContent = 'No presets found';
      this.treeContainer.appendChild(noResults);
      return;
    }

    // Group results by category
    const grouped = results.reduce((acc, preset) => {
      if (!acc[preset.category]) {
        acc[preset.category] = [];
      }
      acc[preset.category].push(preset);
      return acc;
    }, {} as Record<string, SynthPreset[]>);

    Object.entries(grouped).forEach(([category, presets]) => {
      const categoryElement = this.createCategoryElement(category, presets, true);
      this.treeContainer.appendChild(categoryElement);
    });
  }

  private renderTree() {
    this.treeContainer.innerHTML = '';
    const categories = organizePresets();

    categories.forEach(category => {
      const categoryElement = this.createCategoryElement(category.name, category.subcategories.flatMap(sub => sub.presets));
      this.treeContainer.appendChild(categoryElement);
    });
  }

  private createCategoryElement(categoryName: string, presets: SynthPreset[], isSearchResult = false) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-item';

    const categoryHeader = document.createElement('div');
    categoryHeader.className = 'flex items-center justify-between p-2 bg-slate-700 rounded-md cursor-pointer hover:bg-slate-600 transition-colors';
    
    const categoryTitle = document.createElement('span');
    categoryTitle.className = 'font-medium text-slate-200';
    categoryTitle.textContent = categoryName;

    const presetCount = document.createElement('span');
    presetCount.className = 'text-sm text-slate-400';
    presetCount.textContent = `${presets.length}`;

    const expandIcon = document.createElement('span');
    expandIcon.className = 'text-slate-400 transition-transform';
    expandIcon.textContent = this.expandedCategories.has(categoryName) ? '▼' : '▶';

    categoryHeader.appendChild(categoryTitle);
    categoryHeader.appendChild(presetCount);
    categoryHeader.appendChild(expandIcon);

    const subcategoriesContainer = document.createElement('div');
    subcategoriesContainer.className = 'ml-4 mt-2 space-y-1';

    if (isSearchResult) {
      // For search results, show all presets directly
      presets.forEach(preset => {
        const presetElement = this.createPresetElement(preset);
        subcategoriesContainer.appendChild(presetElement);
      });
    } else {
      // For normal view, group by subcategory
      const subcategories = organizePresets().find(cat => cat.name === categoryName)?.subcategories || [];
      subcategories.forEach(subcategory => {
        const subcategoryElement = this.createSubcategoryElement(subcategory.name, subcategory.presets);
        subcategoriesContainer.appendChild(subcategoryElement);
      });
    }

    // Toggle expansion
    categoryHeader.addEventListener('click', () => {
      const isExpanded = this.expandedCategories.has(categoryName);
      if (isExpanded) {
        this.expandedCategories.delete(categoryName);
        expandIcon.textContent = '▶';
        subcategoriesContainer.style.display = 'none';
      } else {
        this.expandedCategories.add(categoryName);
        expandIcon.textContent = '▼';
        subcategoriesContainer.style.display = 'block';
      }
    });

    // Set initial state
    if (this.expandedCategories.has(categoryName)) {
      subcategoriesContainer.style.display = 'block';
    } else {
      subcategoriesContainer.style.display = 'none';
    }

    categoryDiv.appendChild(categoryHeader);
    categoryDiv.appendChild(subcategoriesContainer);

    return categoryDiv;
  }

  private createSubcategoryElement(subcategoryName: string, presets: SynthPreset[]) {
    const subcategoryDiv = document.createElement('div');
    subcategoryDiv.className = 'subcategory-item';

    const subcategoryHeader = document.createElement('div');
    subcategoryHeader.className = 'flex items-center justify-between p-1 bg-slate-600 rounded cursor-pointer hover:bg-slate-500 transition-colors';
    
    const subcategoryTitle = document.createElement('span');
    subcategoryTitle.className = 'text-sm font-medium text-slate-200';
    subcategoryTitle.textContent = subcategoryName;

    const presetCount = document.createElement('span');
    presetCount.className = 'text-xs text-slate-400';
    presetCount.textContent = `${presets.length}`;

    const expandIcon = document.createElement('span');
    expandIcon.className = 'text-slate-400 text-xs transition-transform';
    expandIcon.textContent = this.expandedSubcategories.has(subcategoryName) ? '▼' : '▶';

    subcategoryHeader.appendChild(subcategoryTitle);
    subcategoryHeader.appendChild(presetCount);
    subcategoryHeader.appendChild(expandIcon);

    const presetsContainer = document.createElement('div');
    presetsContainer.className = 'ml-4 mt-1 space-y-1';

    presets.forEach(preset => {
      const presetElement = this.createPresetElement(preset);
      presetsContainer.appendChild(presetElement);
    });

    // Toggle expansion
    subcategoryHeader.addEventListener('click', () => {
      const isExpanded = this.expandedSubcategories.has(subcategoryName);
      if (isExpanded) {
        this.expandedSubcategories.delete(subcategoryName);
        expandIcon.textContent = '▶';
        presetsContainer.style.display = 'none';
      } else {
        this.expandedSubcategories.add(subcategoryName);
        expandIcon.textContent = '▼';
        presetsContainer.style.display = 'block';
      }
    });

    // Set initial state
    if (this.expandedSubcategories.has(subcategoryName)) {
      presetsContainer.style.display = 'block';
    } else {
      presetsContainer.style.display = 'none';
    }

    subcategoryDiv.appendChild(subcategoryHeader);
    subcategoryDiv.appendChild(presetsContainer);

    return subcategoryDiv;
  }

  private createPresetElement(preset: SynthPreset) {
    const presetDiv = document.createElement('div');
    presetDiv.className = 'preset-item flex items-center justify-between p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600 transition-colors group';

    const presetInfo = document.createElement('div');
    presetInfo.className = 'flex-1 min-w-0';

    const presetName = document.createElement('div');
    presetName.className = 'font-medium text-slate-200 truncate';
    presetName.textContent = preset.name;

    const presetDescription = document.createElement('div');
    presetDescription.className = 'text-xs text-slate-400 truncate';
    presetDescription.textContent = preset.description;

    presetInfo.appendChild(presetName);
    presetInfo.appendChild(presetDescription);

    const presetActions = document.createElement('div');
    presetActions.className = 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity';

    // Preview button
    const previewBtn = document.createElement('button');
    previewBtn.className = 'p-1 text-slate-400 hover:text-blue-400 transition-colors';
    previewBtn.innerHTML = '🔊';
    previewBtn.title = 'Preview preset';
    previewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.options.onPresetPreview?.(preset);
    });

    // Type indicator
    const typeIndicator = document.createElement('div');
    typeIndicator.className = `px-2 py-1 text-xs rounded-full ${
      preset.type === 'synth' ? 'bg-blue-600 text-blue-100' :
      preset.type === 'drum' ? 'bg-red-600 text-red-100' :
      'bg-green-600 text-green-100'
    }`;
    typeIndicator.textContent = preset.type;

    presetActions.appendChild(previewBtn);
    presetActions.appendChild(typeIndicator);

    presetDiv.appendChild(presetInfo);
    presetDiv.appendChild(presetActions);

    // Select preset
    presetDiv.addEventListener('click', () => {
      this.selectedPreset = preset;
      this.options.onPresetSelect?.(preset);
      
      // Update visual selection
      this.treeContainer.querySelectorAll('.preset-item').forEach(item => {
        item.classList.remove('ring-2', 'ring-blue-500');
      });
      presetDiv.classList.add('ring-2', 'ring-blue-500');
    });

    return presetDiv;
  }

  public getSelectedPreset(): SynthPreset | null {
    return this.selectedPreset;
  }

  public selectPreset(presetId: string) {
    const preset = organizePresets()
      .flatMap(cat => cat.subcategories)
      .flatMap(sub => sub.presets)
      .find(p => p.id === presetId);
    
    if (preset) {
      this.selectedPreset = preset;
      this.options.onPresetSelect?.(preset);
    }
  }

  public expandCategory(categoryName: string) {
    this.expandedCategories.add(categoryName);
    this.renderTree();
  }

  public collapseCategory(categoryName: string) {
    this.expandedCategories.delete(categoryName);
    this.renderTree();
  }

  public expandAll() {
    organizePresets().forEach(category => {
      this.expandedCategories.add(category.name);
      category.subcategories.forEach(sub => {
        this.expandedSubcategories.add(sub.name);
      });
    });
    this.renderTree();
  }

  public collapseAll() {
    this.expandedCategories.clear();
    this.expandedSubcategories.clear();
    this.renderTree();
  }
}
