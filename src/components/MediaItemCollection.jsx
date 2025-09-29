import { useEffect, useState, useCallback } from "react";
import { Edit3, Trash2, Plus, AlertCircle, RefreshCw, CheckCircle, X, ChevronsUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { api } from "../MediaAPI.js"; 
import MediaItemForm from "./MediaItemForm";

// Utility component for the sortable table headers
const SortableHeader = ({ children, column, sortColumn, sortDirection, onSort }) => {
  const isSorted = sortColumn === column;
  const isAsc = isSorted && sortDirection === 'asc';
  const isDesc = isSorted && sortDirection === 'desc';

  const handleClick = () => {
    onSort(column);
  };

  return (
    <th 
      className="p-4 text-left cursor-pointer hover:bg-white/10 transition-colors duration-200 sticky top-0 bg-black/80 backdrop-blur-sm z-10"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-white uppercase text-sm tracking-wider">{children}</span>
        {isSorted ? (
          isAsc ? <ChevronUp size={16} className="text-pink-400" /> : <ChevronDown size={16} className="text-pink-400" />
        ) : (
          <ChevronsUpDown size={16} className="text-white/50" />
        )}
      </div>
    </th>
  );
};


// Media Table Component (Replaces the Card Grid)
const MediaTable = ({ items, onEdit, onDelete, getStatusBadgeStyles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');

  // Handle Search
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(item.releaseYear).includes(searchTerm)
  );

  // Handle Sort
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Handle Sorting logic
  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-2xl font-bold text-white mb-4">No Media Items Found</h3>
        <p className="text-white/80">Use the form on the left to add your first item!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/20">
        <input
          type="text"
          placeholder="Search media by title, genre, or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/10">
              <SortableHeader column="title" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Title</SortableHeader>
              <SortableHeader column="releaseYear" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Year</SortableHeader>
              <SortableHeader column="genre" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Genre</SortableHeader>
              <SortableHeader column="rating" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Rating</SortableHeader>
              <SortableHeader column="status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Status</SortableHeader>
              <th className="p-4 text-center sticky top-0 bg-black/80 backdrop-blur-sm z-10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-white/70">No results found for "{searchTerm}"</td>
              </tr>
            ) : (
              sortedItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-b border-white/10 hover:bg-white/5 transition-colors duration-150 group"
                >
                  <td className="p-4 font-medium text-white group-hover:text-yellow-200 transition-colors max-w-[200px] truncate">{item.title}</td>
                  <td className="p-4 text-white/80">{item.releaseYear}</td>
                  <td className="p-4 text-white/80">{item.genre}</td>
                  <td className="p-4 text-white/80">
                    <span className="font-semibold text-yellow-400">{item.rating}</span>/10
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeStyles(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-3">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-full border border-blue-400/50 text-blue-200 hover:text-white transition-all duration-200"
                      title="Edit"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full border border-red-400/50 text-red-200 hover:text-white transition-all duration-200"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// Toast Component (Unchanged)
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); 

    return () => clearTimeout(timer);
  }, [onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/90 border-green-400/50 text-green-100';
      case 'error':
        return 'bg-red-500/90 border-red-400/50 text-red-100';
      case 'info':
        return 'bg-blue-500/90 border-blue-400/50 text-blue-100';
      default:
        return 'bg-gray-500/90 border-gray-400/50 text-gray-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      default:
        return <AlertCircle size={20} />;
    }
  };

  return (
    <div className={`fixed top-6 right-6 z-[60] backdrop-blur-md border rounded-2xl p-4 shadow-2xl transform transition-all duration-300 ease-in-out ${getToastStyles()}`}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Custom Confirmation Modal Component (Unchanged)
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-300" size={48} />
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/80 mb-6">{message}</p>
          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-500/20 hover:bg-gray-500/40 text-white py-3 px-4 rounded-xl border border-gray-400/50 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// MAIN COMPONENT: MediaItemCollection
export default function MediaItemCollection() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 'editingItem' can be null (view list), "ADD" (add form), or {item data} (edit form)
  const [editingItem, setEditingItem] = useState(null); 
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Close toast notification
  const closeToast = () => {
    setToast(null);
  };

  // Fetch media items from API
  const fetchMediaItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await api.getMediaItems();
      setMediaItems(items);
    } catch (err) {
      setError(err.message);
      showToast(`Failed to load media items: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchMediaItems();
  }, [fetchMediaItems]);

  // Handle add or update operations
  const handleAddOrUpdate = async (formData) => {
    setError(null);
    try {
      if (editingItem && editingItem !== "ADD") {
        await api.updateMediaItem(editingItem.id, formData);
        showToast(`"${formData.title}" has been updated successfully!`, 'success');
      } else {
        await api.createMediaItem(formData);
        showToast(`"${formData.title}" has been added to your collection!`, 'success');
      }
      setEditingItem(null); // Return to list view
      fetchMediaItems();
    } catch (err) {
      const action = editingItem && editingItem !== "ADD" ? 'update' : 'add';
      setError(`Failed to ${action} item: ${err.message}`);
      showToast(`Failed to ${action} "${formData.title}": ${err.message}`, 'error');
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (item) => {
    setConfirmDelete(item);
  };

  // Handle confirmed delete operation
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    const itemToDelete = confirmDelete;
    setConfirmDelete(null);
    setError(null);
    
    try {
      await api.deleteMediaItem(itemToDelete.id);
      setMediaItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      showToast(`"${itemToDelete.title}" has been deleted from your collection.`, 'success');
    } catch (err) {
      setError(`Failed to delete item: ${err.message}`);
      showToast(`Failed to delete "${itemToDelete.title}": ${err.message}`, 'error');
    }
  };

  // Get status badge styles (Unchanged)
  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Watched':
        return 'bg-green-500/30 text-green-200 border border-green-400/50';
      case 'To Watch':
        return 'bg-orange-500/30 text-orange-200 border border-orange-400/50';
      case 'Dropped':
        return 'bg-red-500/30 text-red-200 border border-red-400/50';
      default:
        return 'bg-gray-500/30 text-gray-200 border border-gray-400/50';
    }
  };

  // --- RENDERING LOGIC ---

  // Loading state (Unchanged)
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-white text-xl font-semibold animate-pulse flex items-center space-x-3">
          <RefreshCw className="animate-spin" size={24} />
          <span>Loading media...</span>
        </div>
      </div>
    );
  }

  // Error state (when no data loaded) (Unchanged)
  if (error && !mediaItems.length) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-300" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Media</h3>
          <p className="text-white/80 mb-4">{error}</p>
          <button
            onClick={fetchMediaItems}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // Two-Panel Main View
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        
        {/* LEFT PANEL: Add/Edit Form */}
        <div className={`w-full lg:w-2/5 p-6 bg-black/50 border-r border-white/10 overflow-y-auto ${editingItem ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-0 z-20 bg-black/50 pb-4">
            <h2 className="text-3xl font-bold text-white mb-4">
              {editingItem && editingItem !== "ADD" ? "Edit Media Item" : "Add New Media Item"}
            </h2>
            {/* Conditional button to switch from form back to list on mobile/small screens */}
            {editingItem && (
              <button
                onClick={() => setEditingItem(null)}
                className="lg:hidden mb-4 bg-gray-500/20 hover:bg-gray-500/40 text-white py-2 px-4 rounded-xl transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <X size={16} /> <span>Cancel/View List</span>
              </button>
            )}
          </div>
          
          <MediaItemForm
            initialData={editingItem !== "ADD" ? editingItem : undefined}
            onSubmit={handleAddOrUpdate}
            // In the two-panel view, clicking Cancel only hides the form or clears the state,
            // it doesn't navigate away, as the list is still visible (on desktop).
            onCancel={() => setEditingItem(null)} 
            showCancelButton={editingItem !== null} // Always show for clearing/hiding the form
          />
        </div>

        {/* RIGHT PANEL: Media List Table */}
        <div className={`w-full lg:w-3/5 bg-black/90 p-0 overflow-hidden ${editingItem ? 'hidden' : 'block'} lg:block`}>
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-white/10 sticky top-0 bg-black/90 z-20">
              <h2 className="text-3xl font-bold text-white">Media Collection ({mediaItems.length})</h2>
              <button
                onClick={() => setEditingItem("ADD")}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 font-medium hover:scale-105"
                title="Add New Media"
              >
                <Plus size={20} />
                <span>Add New</span>
              </button>
            </div>
            
            {/* The Table View Component */}
            <MediaTable 
              items={mediaItems} 
              onEdit={setEditingItem} 
              onDelete={handleDeleteClick} 
              getStatusBadgeStyles={getStatusBadgeStyles}
            />

            {/* Error banner (when data exists but operation failed) */}
            {error && (
              <div className="absolute bottom-4 left-4 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl p-4 w-1/2">
                <div className="flex items-center space-x-2 text-red-200">
                  <AlertCircle size={20} />
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Modals/Toasts */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
      <ConfirmationModal
        isOpen={!!confirmDelete}
        title="Delete Media Item"
        message={`Are you sure you want to delete "${confirmDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}