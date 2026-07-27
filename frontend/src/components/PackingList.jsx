import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Trash2, UserCheck, UserPlus, Package, Filter, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const CATEGORIES = ['General', 'Clothing', 'Gear & Equipment', 'Electronics', 'Documents & Money', 'Toiletries', 'Other'];

const PackingList = ({ tripId, members, currentUser }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('General');
  const [addLoading, setAddLoading] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchPackingItems();
  }, [tripId]);

  const fetchPackingItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/trips/${tripId}/packing/`);
      setItems(response.data);
    } catch (err) {
      console.error("Failed to fetch packing list:", err);
      setError("Failed to load packing items.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      setAddLoading(true);
      const response = await api.post(`/trips/${tripId}/packing/`, {
        item_name: newItemName.trim(),
        category: newItemCategory
      });
      setItems([response.data, ...items]);
      setNewItemName('');
      setNewItemCategory('General');
    } catch (err) {
      console.error("Failed to add packing item:", err);
      alert("Failed to add item. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleTogglePacked = async (item) => {
    const updatedStatus = !item.is_packed;
    // Optimistic UI update
    setItems(items.map(i => i.id === item.id ? { ...i, is_packed: updatedStatus } : i));

    try {
      await api.patch(`/trips/${tripId}/packing/${item.id}/`, {
        is_packed: updatedStatus
      });
    } catch (err) {
      console.error("Failed to update status:", err);
      // Revert on error
      setItems(items.map(i => i.id === item.id ? { ...i, is_packed: item.is_packed } : i));
    }
  };

  const handleClaimToggle = async (item) => {
    const isCurrentlyAssignedToMe = item.assigned_to_username === currentUser?.username;
    const newAssignedTo = isCurrentlyAssignedToMe ? null : currentUser?.id;
    const newAssignedToUsername = isCurrentlyAssignedToMe ? null : currentUser?.username;

    // Optimistic UI update
    setItems(items.map(i => i.id === item.id ? { 
      ...i, 
      assigned_to: newAssignedTo,
      assigned_to_username: newAssignedToUsername 
    } : i));

    try {
      await api.patch(`/trips/${tripId}/packing/${item.id}/`, {
        assigned_to: newAssignedTo
      });
    } catch (err) {
      console.error("Failed to claim item:", err);
      fetchPackingItems();
    }
  };

  const handleDeleteItem = async (itemId) => {
    // Optimistic UI update
    setItems(items.filter(i => i.id !== itemId));

    try {
      await api.delete(`/trips/${tripId}/packing/${itemId}/`);
    } catch (err) {
      console.error("Failed to delete item:", err);
      fetchPackingItems();
    }
  };

  // Calculations
  const packedCount = items.filter(i => i.is_packed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Progress & Overview Card */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-purple-800/30 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-purple-300" />
              <h3 className="text-xl font-bold">Collaborative Packing List</h3>
            </div>
            <p className="text-purple-200 text-sm">
              Claim responsibility for items and check them off together as a team!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-black text-white">{progressPercentage}%</div>
              <div className="text-[11px] font-medium text-purple-200 uppercase tracking-wider">{packedCount} of {totalCount} Packed</div>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-white/15 h-3 rounded-full mt-5 overflow-hidden p-0.5 border border-white/10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full shadow-sm"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Category Filters */}
        <div className="space-y-6 lg:col-span-1">
          {/* Quick Add Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" /> Add Item to Checklist
            </h4>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Item Name</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Camping Tent, Power Bank..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={addLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Item
              </motion.button>
            </form>
          </div>

          {/* Category Filter Pills */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" /> Filter Category
            </h4>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === 'All' 
                    ? 'bg-purple-600 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                All ({items.length})
              </button>
              {CATEGORIES.map(cat => {
                const count = items.filter(i => i.category === cat).length;
                if (count === 0 && selectedCategory !== cat) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategory === cat 
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Items Checklist List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 text-lg">Checklist Items</h4>
            <span className="text-xs font-semibold text-slate-400">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16 text-purple-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-sm">No packing items found.</p>
              <p className="text-xs mt-1">Add items on the left to start planning together!</p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {filteredItems.map(item => {
                  const isAssignedToMe = item.assigned_to_username === currentUser?.username;
                  
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        item.is_packed 
                          ? 'bg-emerald-50/40 border-emerald-100 opacity-75' 
                          : 'bg-white border-slate-200/80 hover:border-purple-200 hover:shadow-sm'
                      }`}
                    >
                      {/* Left: Checkbox & Name */}
                      <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-2">
                        <button
                          onClick={() => handleTogglePacked(item)}
                          className="text-slate-400 hover:text-purple-600 transition-colors cursor-pointer flex-shrink-0"
                        >
                          {item.is_packed ? (
                            <CheckSquare className="w-6 h-6 text-emerald-500 fill-emerald-100" />
                          ) : (
                            <Square className="w-6 h-6 text-slate-300 hover:text-purple-500" />
                          )}
                        </button>

                        <div className="flex flex-col min-w-0">
                          <span className={`font-bold text-sm truncate ${
                            item.is_packed ? 'line-through text-slate-400 font-medium' : 'text-slate-800'
                          }`}>
                            {item.item_name}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Right: Claim Badge & Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Claim / Assigned Badge */}
                        <button
                          onClick={() => handleClaimToggle(item)}
                          title={isAssignedToMe ? "Click to unclaim item" : "Click to claim bringing this item"}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            item.assigned_to_username 
                              ? isAssignedToMe
                                ? 'bg-purple-100 text-purple-700 border border-purple-200/80 hover:bg-purple-200/60'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                              : 'bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100'
                          }`}
                        >
                          {item.assigned_to_username ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                              <span className="truncate max-w-[100px]">
                                {isAssignedToMe ? 'Assigned to Me' : item.assigned_to_username}
                              </span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>Claim</span>
                            </>
                          )}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          title="Delete item"
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackingList;
