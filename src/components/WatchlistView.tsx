import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Sliders, 
  Search,
  Filter,
  Copy,
  ToggleLeft,
  ToggleRight,
  Info,
  CreditCard,
  Edit2,
  AlertTriangle,
  ArrowUpDown,
  CheckSquare,
  Square,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { WatchlistItem } from '../types';

interface WatchlistViewProps {
  watchlist: WatchlistItem[];
  onAddRule: (rule: Omit<WatchlistItem, 'id' | 'detectionCount'>) => void;
  onUpdateRule: (id: string, updatedFields: Partial<WatchlistItem>) => void;
  onDeleteRule: (id: string) => void;
  onDuplicateRule: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkToggleActive?: (ids: string[], active: boolean) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  watchlist,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  onDuplicateRule,
  onBulkDelete,
  onBulkToggleActive
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'price' | 'detections'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form states for adding/editing
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [keyword, setKeyword] = useState('');
  const [matchType, setMatchType] = useState<'contains' | 'exact'>('contains');
  const [excludeKeywords, setExcludeKeywords] = useState('');
  const [autoPurchase, setAutoPurchase] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(85);
  const [maxPrice, setMaxPrice] = useState<number>(499);
  const [quantity, setQuantity] = useState<number>(1);
  const [codToggle, setCodToggle] = useState<boolean>(true);
  const [notes, setNotes] = useState('');

  // Bulk Actions states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleEditClick = (item: WatchlistItem) => {
    setEditingId(item.id);
    setName(item.name);
    setKeyword(item.keyword);
    setMatchType(item.matchType);
    setExcludeKeywords(item.excludeKeywords.join(', '));
    setAutoPurchase(item.autoPurchase);
    setPriority(item.priority);
    setSimilarityThreshold(item.similarityThreshold);
    setMaxPrice(item.maxPrice);
    setQuantity(item.quantity);
    setCodToggle(item.codToggle);
    setNotes(item.notes);
    setShowForm(true);
  };

  const handleCreateNewClick = () => {
    setEditingId(null);
    setName('');
    setKeyword('');
    setMatchType('contains');
    setExcludeKeywords('');
    setAutoPurchase(false);
    setPriority('high');
    setSimilarityThreshold(85);
    setMaxPrice(499);
    setQuantity(1);
    setCodToggle(true);
    setNotes('');
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !keyword.trim()) return;

    const parsedExclude = excludeKeywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const ruleData = {
      name,
      keyword,
      matchType,
      excludeKeywords: parsedExclude,
      autoPurchase,
      active: true,
      priority,
      similarityThreshold,
      maxPrice,
      quantity,
      codToggle,
      notes
    };

    if (editingId) {
      onUpdateRule(editingId, ruleData);
    } else {
      onAddRule(ruleData);
    }

    setShowForm(false);
    setEditingId(null);
  };

  // Bulk operations
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} items from watchlist?`)) {
      if (onBulkDelete) {
        onBulkDelete(selectedIds);
      } else {
        selectedIds.forEach(id => onDeleteRule(id));
      }
      setSelectedIds([]);
    }
  };

  const handleBulkToggleActive = (active: boolean) => {
    if (onBulkToggleActive) {
      onBulkToggleActive(selectedIds, active);
    } else {
      selectedIds.forEach(id => onUpdateRule(id, { active }));
    }
    setSelectedIds([]);
  };

  // Filter and Sort items
  const filteredItems = watchlist.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.keyword.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && item.active) || 
                          (statusFilter === 'inactive' && !item.active);

    return matchesSearch && matchesPriority && matchesStatus;
  }).sort((a, b) => {
    let comp = 0;
    if (sortBy === 'name') {
      comp = a.name.localeCompare(b.name);
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      comp = priorityOrder[a.priority] - priorityOrder[b.priority];
    } else if (sortBy === 'price') {
      comp = a.maxPrice - b.maxPrice;
    } else if (sortBy === 'detections') {
      comp = a.detectionCount - b.detectionCount;
    }
    return sortOrder === 'asc' ? comp : -comp;
  });

  const toggleSort = (field: 'name' | 'priority' | 'price' | 'detections') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EEF5FF] overflow-hidden">
      {/* View Header */}
      <div className="px-6 py-5 bg-white/80 backdrop-blur-md flex items-center justify-between border-b border-blue-50">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-800 flex items-center space-x-2.5">
            <Sliders className="h-5 w-5 text-blue-500" />
            <span>Product Watchlist Manager</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            Specify fine collection rules and map custom automated checkout pathways.
          </p>
        </div>

        <button
          onClick={handleCreateNewClick}
          id="btn-trigger-add-rule"
          className="win-btn-primary px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-md shadow-blue-500/15"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Add Monitored Product</span>
        </button>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left main: Watchlist content table */}
        <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
          
          {/* Controls Strip (Search, Priority filters, etc.) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[20px] border border-blue-50/50 shadow-sm">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by keyword or catalog target name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 pl-10 pr-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-mono"
              />
            </div>

            {/* Filtering parameters */}
            <div className="flex items-center space-x-4 text-xs font-mono text-slate-650">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-bold">PRIORITY:</span>
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value as any)}
                  className="bg-slate-50/50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-400 focus:bg-white"
                >
                  <option value="all">ALL</option>
                  <option value="high">HIGH</option>
                  <option value="medium">MEDIUM</option>
                  <option value="low">LOW</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-bold">STATUS:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50/50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-blue-400 focus:bg-white"
                >
                  <option value="all">ALL</option>
                  <option value="active">ACTIVE</option>
                  <option value="inactive">INACTIVE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions Menu (Visible when items selected) */}
          {selectedIds.length > 0 && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-850 text-white p-3 px-4 rounded-[16px] flex items-center justify-between text-xs shadow-md shadow-slate-900/10">
              <div className="flex items-center space-x-2.5 font-mono">
                <span className="font-bold text-blue-400 bg-slate-800 px-2.5 py-1 rounded-lg">{selectedIds.length}</span>
                <span>items selected</span>
              </div>

              <div className="flex items-center space-x-2 font-mono">
                <button
                  onClick={() => handleBulkToggleActive(true)}
                  className="bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition cursor-pointer"
                >
                  BULK ENABLE
                </button>
                <button
                  onClick={() => handleBulkToggleActive(false)}
                  className="bg-white hover:bg-slate-50 text-slate-800 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition cursor-pointer"
                >
                  BULK DISABLE
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase transition cursor-pointer shadow-sm shadow-rose-500/10"
                >
                  BULK DELETE
                </button>
              </div>
            </div>
          )}

          {/* Watchlist Table */}
          <div className="flex-1 bg-white/95 backdrop-blur-sm rounded-[24px] border border-blue-50/50 overflow-hidden flex flex-col shadow-sm">
            <div className="flex-1 overflow-auto">
              {filteredItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-24 text-center px-4">
                  <AlertTriangle className="h-10 w-10 text-slate-400 mb-3" />
                  <p className="font-display font-bold text-base text-slate-800">No monitored items found</p>
                  <p className="text-[11px] text-slate-400 mt-2 max-w-sm font-mono leading-relaxed">
                    No items matched your current search parameters. Create or customize your monitored products.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs min-w-[900px]">
                  <thead className="bg-slate-50 border-b border-blue-50 sticky top-0 z-10 font-mono text-[10px] text-slate-400 select-none">
                    <tr>
                      <th className="py-3.5 px-4 w-8">
                        <button onClick={toggleSelectAll} className="text-slate-500 hover:text-slate-800 transition cursor-pointer">
                          {selectedIds.length === filteredItems.length ? (
                            <CheckSquare className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
                      <th className="py-3.5 px-3 w-12 text-center">STATE</th>
                      <th className="py-3.5 px-4 cursor-pointer hover:text-slate-700" onClick={() => toggleSort('name')}>
                        PRODUCT / KEYWORD <ArrowUpDown className="h-3 w-3 inline ml-1 text-slate-300" />
                      </th>
                      <th className="py-3.5 px-3 cursor-pointer hover:text-slate-700" onClick={() => toggleSort('priority')}>
                        PRIORITY <ArrowUpDown className="h-3 w-3 inline ml-1 text-slate-300" />
                      </th>
                      <th className="py-3.5 px-3">SIMILARITY</th>
                      <th className="py-3.5 px-3 cursor-pointer hover:text-slate-700" onClick={() => toggleSort('price')}>
                        MAX PRICE <ArrowUpDown className="h-3 w-3 inline ml-1 text-slate-300" />
                      </th>
                      <th className="py-3.5 px-3">CHECKOUT</th>
                      <th className="py-3.5 px-3 cursor-pointer hover:text-slate-700" onClick={() => toggleSort('detections')}>
                        DETECTIONS <ArrowUpDown className="h-3 w-3 inline ml-1 text-slate-300" />
                      </th>
                      <th className="py-3.5 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-50/40">
                    {filteredItems.map(item => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <tr 
                          key={item.id} 
                          className={`transition ${
                            !item.active ? 'opacity-50' : ''
                          } ${isSelected ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}
                        >
                          {/* Selection Checkbox */}
                          <td className="py-3.5 px-4">
                            <button 
                              onClick={() => toggleSelectItem(item.id)} 
                              className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4 text-blue-500" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </td>

                          {/* Toggle Active Switch */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() => onUpdateRule(item.id, { active: !item.active })}
                              className="transition cursor-pointer focus:outline-none"
                            >
                              {item.active ? (
                                <ToggleRight className="h-6 w-6 text-blue-500" />
                              ) : (
                                <ToggleLeft className="h-6 w-6 text-slate-300" />
                              )}
                            </button>
                          </td>

                          {/* Item details */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-display font-bold text-slate-800 text-[13px]">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1 truncate" title={item.keyword}>
                              Phrase: "{item.keyword}" ({item.matchType})
                            </div>
                            {item.notes && (
                              <div className="text-[9px] text-slate-400 mt-1 italic max-w-[200px] truncate" title={item.notes}>
                                Note: {item.notes}
                              </div>
                            )}
                          </td>

                          {/* Priority Badge */}
                          <td className="py-3.5 px-3 font-mono">
                            <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase ${
                              item.priority === 'high' 
                                ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                                : item.priority === 'medium'
                                ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                : 'bg-slate-50 text-slate-500 border border-slate-200'
                            }`}>
                              {item.priority}
                            </span>
                          </td>

                          {/* Similarity Threshold */}
                          <td className="py-3.5 px-3 font-mono text-slate-500">
                            {item.similarityThreshold}% match
                          </td>

                          {/* Price Guard */}
                          <td className="py-3.5 px-3 font-mono text-slate-800 font-bold">
                            ₹{item.maxPrice}
                          </td>

                          {/* Auto Purchase & COD status */}
                          <td className="py-3.5 px-3">
                            <div className="flex flex-col space-y-1">
                              <span className={`text-[9px] font-bold font-mono ${item.autoPurchase ? 'text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 max-w-max' : 'text-slate-400'}`}>
                                {item.autoPurchase ? 'AUTO-BUY' : 'MANUAL'}
                              </span>
                              <span className="text-[8px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded max-w-max uppercase font-bold">
                                COD PRIMARY
                              </span>
                            </div>
                          </td>

                          {/* Last detection & count */}
                          <td className="py-3.5 px-3 font-mono">
                            <div className="text-slate-800 font-bold">{item.detectionCount} hits</div>
                            {item.lastDetected ? (
                              <div className="text-[9px] text-slate-400">
                                {new Date(item.lastDetected).toLocaleTimeString()}
                              </div>
                            ) : (
                              <div className="text-[9px] text-slate-400">Never</div>
                            )}
                          </td>

                          {/* Action triggers */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleEditClick(item)}
                                className="p-1.5 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-lg transition cursor-pointer"
                                title="Edit item fields"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => onDuplicateRule(item.id)}
                                className="p-1.5 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-lg transition cursor-pointer"
                                title="Duplicate rule"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteRule(item.id)}
                                className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition cursor-pointer"
                                title="Delete product"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* Right slide-out or fixed Panel: Configuration Form */}
        {showForm && (
          <div className="w-80 bg-white border-l border-blue-50 p-6 flex flex-col justify-between overflow-y-auto shrink-0 select-none shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="border-b border-blue-50 pb-4 flex justify-between items-center">
                <span className="font-display font-bold text-sm text-slate-800">
                  {editingId ? 'Edit Product Specification' : 'New Product Definition'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">FORM M.5</span>
              </div>

              {/* Title Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">Friendly Label Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Skyline R34 Super TH"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-mono"
                />
              </div>

              {/* Match Phrase / Keyword */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">Scrape Phrase / Keyword</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Skyline GT-R"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all font-mono"
                />
              </div>

              {/* Match Phrase Type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">Matching Strategy</label>
                <select
                  value={matchType}
                  onChange={e => setMatchType(e.target.value as any)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-2.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all font-mono font-bold"
                >
                  <option value="contains">Contains (Case Insensitive)</option>
                  <option value="exact">Exact Phrase Match</option>
                </select>
              </div>

              {/* Exclude Keywords */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">Exclusion Keywords (Comma split)</label>
                <input 
                  type="text"
                  placeholder="e.g. loose, damaged, boxless"
                  value={excludeKeywords}
                  onChange={e => setExcludeKeywords(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white transition-all font-mono"
                />
              </div>

              {/* Priority & Quantity (Grid) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as any)}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-2.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white font-mono font-bold"
                  >
                    <option value="high">HIGH</option>
                    <option value="medium">MEDIUM</option>
                    <option value="low">LOW</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">Max Qty</label>
                  <input 
                    type="number"
                    min="1"
                    max="5"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Price Guard & Similarity Threshold (Grid) */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">Max Price (₹)</label>
                  <input 
                    type="number"
                    min="1"
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">Similarity %</label>
                  <input 
                    type="number"
                    min="50"
                    max="100"
                    value={similarityThreshold}
                    onChange={e => setSimilarityThreshold(Number(e.target.value))}
                    className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Auto Checkout Toggle */}
              <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-100/50 space-y-3.5 font-mono">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex flex-col font-sans">
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Automated Checkout</span>
                    <span className="text-[9px] text-slate-400 font-mono">Execute auto check-out instantly</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoPurchase}
                    onChange={e => setAutoPurchase(e.target.checked)}
                    className="accent-blue-500 h-4 w-4 rounded-md"
                  />
                </label>

                <div className="pt-3 border-t border-blue-50 flex items-center justify-between">
                  <div className="flex flex-col font-sans">
                    <span className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Cash on Delivery Only</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Stealth checkout pathway forced</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-emerald-100/80 text-emerald-700 px-2 py-0.5 rounded-md uppercase">
                    MANDATORY
                  </span>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wide">Collector Notes</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Check variant condition..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-400 focus:bg-white font-mono"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-2 pt-3 font-mono">
                <button
                  type="submit"
                  id="btn-add-rule-save"
                  className="flex-1 win-btn-primary text-white text-xs font-bold py-3 uppercase tracking-wider transition rounded-full cursor-pointer text-center"
                >
                  {editingId ? 'Apply Edit' : 'Add Rule'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 text-xs font-bold py-3 px-4.5 transition rounded-full cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>

            <div className="mt-5 bg-blue-50/40 border border-blue-100/50 p-3 rounded-xl text-[10px] text-slate-450 flex items-start space-x-2 leading-relaxed select-text font-mono">
              <Info className="h-4 w-4 text-blue-500 shrink-0" />
              <span>Watchlist filters utilize real-time string distance matches over the Instamart titles instantly inside the native PySide6 runtime.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
