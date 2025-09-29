import { useEffect, useState, useCallback } from "react";
import { Edit3, Trash2, Plus, AlertCircle, RefreshCw, CheckCircle, X, ChevronsUpDown, ChevronUp, ChevronDown, Save, Loader2 } from "lucide-react";
import { api } from "../MediaAPI.js"; 
import MediaItemForm from "./MediaItemForm";

// --- UTILITY COMPONENTS ---

// Custom Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 overflow-y-auto"
      onClick={onClose} 
    >
      {/* Modal Content */}
      <div 
        className="bg-white/10 backdrop-blur-lg border border-white/30 rounded-3xl shadow-2xl p-6 md:p-8 max-w-lg w-full transform transition-all duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-extrabold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all duration-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// SortableHeader Component (Unchanged)
const SortableHeader = ({ children, column, sortColumn, sortDirection, onSort }) => {
  const isSorted = sortColumn === column;
  const isAsc = isSorted && sortDirection === 'asc';
  const isDesc = isSorted && sortDirection === 'desc';

  const handleClick = () => {
    onSort(column);
  };

  return (
    <th 
      className="p-4 text-left cursor-pointer hover:bg-white/10 transition-colors duration-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10"
      onClick={handleClick}
    >
      <div className="flex items-center space-x-2">
        <span className="font-semibold text-pink-300 uppercase text-sm tracking-wider">{children}</span>
        {isSorted ? (
          isAsc ? <ChevronUp size={16} className="text-pink-400" /> : <ChevronDown size={16} className="text-pink-400" />
        ) : (
          <ChevronsUpDown size={16} className="text-white/50" />
        )}
      </div>
    </th>
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

// ConfirmationModal Component (Unchanged)
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


// --- INLINE EDITING TABLE ROW COMPONENT ---

const MediaTableItem = ({ item, getStatusBadgeStyles, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  // Use a deep copy to ensure formData starts with actual fetched data
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(item))); 
  const [isSaving, setIsSaving] = useState(false);

  // Status and Rating options for inline editing
  const statusOptions = ['Planned', 'Watched', 'Dropped'];
  const ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleEditClick = () => {
    setIsEditing(true);
    // Reset formData to the current item's state (in case of failed save)
    setFormData(JSON.parse(JSON.stringify(item))); 
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset form data to current item data
    setFormData(JSON.parse(JSON.stringify(item))); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: (name === 'rating' || name === 'releaseYear') ? Number(value) : value 
    }));
  };

  const handleSaveClick = async () => {
    // Only save if data has actually changed
    if (!isDataChanged) {
        setIsEditing(false);
        return;
    }
    
    setIsSaving(true);
    try {
      // Payload only contains the edited fields
      const payload = {
        title: formData.title,
        releaseYear: formData.releaseYear,
        genre: formData.genre,
        rating: formData.rating,
        status: formData.status
      };
      
      await onUpdate(item.id, payload);
      setIsEditing(false);
    } catch (error) {
      // Error handling is handled by the parent, just stop saving state
    } finally {
      setIsSaving(false);
    }
  };

  // Check if form data is different from the original item data to enable save button
  const isDataChanged = Object.keys(formData).some(key => {
    const editableKeys = ['title', 'releaseYear', 'genre', 'rating', 'status'];
    if (editableKeys.includes(key)) {
      // Special handling for number types to avoid string/number comparison issues
      if (key === 'rating' || key === 'releaseYear') {
        return Number(formData[key]) !== Number(item[key]);
      }
      return formData[key] !== item[key];
    }
    return false;
  });

  return (
    <tr 
      key={item.id} 
      className="border-b border-white/10 transition-colors duration-150 group 
                 hover:bg-white/10 hover:shadow-lg rounded-xl
                 bg-white/5 backdrop-filter backdrop-blur-md" // Glass effect on rows
    >
      {/* Title */}
      <td className="p-4 font-medium max-w-[200px] truncate">
        {isEditing ? (
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-black/50 border border-white/30 text-white placeholder-white/50 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
            aria-label="Edit title"
            required
          />
        ) : (
          <span className="text-black group-hover:text-pink-200 transition-colors">{item.title}</span>
        )}
      </td>

      {/* Year */}
      <td className="p-4 text-white/80">
        {isEditing ? (
          <input
            type="number"
            name="releaseYear"
            value={formData.releaseYear}
            onChange={handleChange}
            className="w-20 p-2 rounded-lg bg-black/50 border border-white/30 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
            min="1888" 
            max={new Date().getFullYear() + 5}
            aria-label="Edit release year"
          />
        ) : (
          item.releaseYear
        )}
      </td>

      {/* Genre */}
      <td className="p-4 text-white/80">
        {isEditing ? (
          <input
            type="text"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            className="w-full p-2 rounded-lg bg-black/50 border border-white/30 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
            aria-label="Edit genre"
          />
        ) : (
          item.genre
        )}
      </td>

      {/* Rating */}
      <td className="p-4 text-white/80">
        {isEditing ? (
          <select
            name="rating"
            value={formData.rating}
            onChange={handleChange}
            className="w-16 p-2 rounded-lg bg-black/50 border border-white/30 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all appearance-none cursor-pointer"
            aria-label="Edit rating"
          >
            {ratingOptions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        ) : (
          <span className="font-semibold text-yellow-400">{item.rating}</span>
        )}/10
      </td>

      {/* Status */}
      <td className="p-4">
        {isEditing ? (
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className={`w-32 p-2 rounded-lg bg-black/50 border border-white/30 text-white focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all appearance-none cursor-pointer`}
            style={{ 
                // Dynamically apply badge styles for select field background color
                backgroundColor: getStatusBadgeStyles(formData.status).includes('green') ? 'rgba(16, 185, 129, 0.3)' : 
                                 getStatusBadgeStyles(formData.status).includes('orange') ? 'rgba(249, 115, 22, 0.3)' : 
                                 getStatusBadgeStyles(formData.status).includes('red') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(107, 114, 128, 0.3)'
            }}
            aria-label="Edit status"
          >
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeStyles(item.status)}`}>
            {item.status}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="p-4 text-center space-x-3 whitespace-nowrap">
        {isEditing ? (
          <>
            <button
              onClick={handleSaveClick}
              disabled={isSaving || !isDataChanged}
              className={`p-2 rounded-full border transition-all duration-200 ${isDataChanged ? 'bg-green-500/20 hover:bg-green-500/40 border-green-400/50 text-green-200 hover:text-white' : 'bg-gray-500/10 border-gray-400/20 text-gray-400 cursor-not-allowed'}`}
              title="Save Changes"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            </button>
            <button
              onClick={handleCancelClick}
              disabled={isSaving}
              className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full border border-red-400/50 text-red-200 hover:text-white transition-all duration-200"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleEditClick}
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
          </>
        )}
      </td>
    </tr>
  );
};


// --- MEDIA TABLE COMPONENT ---

const MediaTable = ({ items, onDelete, getStatusBadgeStyles, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');

  // Handle Search & Sort (Logic Unchanged)
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(item.releaseYear).includes(searchTerm)
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

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
        <p className="text-white/80">Click 'Add New' to add your first item!</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      {/* Table Container with Glass Effect */}
      <div className="flex-1 overflow-y-auto custom-scrollbar mt-4 
                      bg-gradient-to-br from-[#F7CACA]/30 to-[#93A9D1]/30 
                      backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-2">
        {/* Search Input */}
        <div className="pb-4 border-b border-white/20">
          <input
            type="text"
            placeholder="Search media by title, genre, or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-pink-300 placeholder-black/50 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
          />
        </div>
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr>
              <SortableHeader column="title" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Title</SortableHeader>
              <SortableHeader column="releaseYear" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Year</SortableHeader>
              <SortableHeader column="genre" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Genre</SortableHeader>
              <SortableHeader column="rating" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Rating</SortableHeader>
              <SortableHeader column="status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={handleSort}>Status</SortableHeader>
              <th className="p-4 text-center sticky top-0 backdrop-blur-sm z-10">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-black/70">No results found for "{searchTerm}"</td>
              </tr>
            ) : (
              sortedItems.map((item) => (
                <MediaTableItem 
                  key={item.id}
                  item={item}
                  getStatusBadgeStyles={getStatusBadgeStyles}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT: MediaItemCollection ---

export default function MediaItemCollection() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Toast functions (Unchanged)
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast(null);
  };

  // Fetch media items from API (Unchanged)
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

  useEffect(() => {
    fetchMediaItems();
  }, [fetchMediaItems]);

  // Handle Add (from Modal)
  const handleAdd = async (formData) => {
    setError(null);
    try {
      await api.createMediaItem(formData);
      showToast(`"${formData.title}" has been added to your collection!`, 'success');
      setIsAddModalOpen(false); 
      fetchMediaItems(); // Re-fetch all data to ensure list is updated
    } catch (err) {
      setError(`Failed to add item: ${err.message}`);
      showToast(`Failed to add "${formData.title}": ${err.message}`, 'error');
    }
  };

  // Handle Inline Update (from MediaTableItem)
  const handleInlineUpdate = async (itemId, formData) => {
    setError(null);
    try {
      const { id, ...payload } = formData; 
      await api.updateMediaItem(itemId, payload); // Pass itemId and the ID-less payload
      setMediaItems(prev => prev.map(item => item.id === itemId ? { ...item, ...formData } : item));
      showToast(`"${formData.title}" updated!`, 'success');
    } catch (err) {
      // If it fails, re-fetch data to revert the optimistic update
      fetchMediaItems(); 
      setError(`Failed to update item: ${err.message}`);
      showToast(`Failed to update "${formData.title}": ${err.message}`, 'error');
      throw err; 
    }
  };

  // Handle Delete (Unchanged)
  const handleDeleteClick = (item) => {
    setConfirmDelete(item);
  };

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
      case 'Planned':
        return 'bg-orange-500/30 text-orange-200 border border-orange-400/50';
      case 'Dropped':
        return 'bg-red-500/30 text-red-200 border border-red-400/50';
      default:
        return 'bg-gray-500/30 text-gray-200 border border-gray-400/50';
    }
  };

  // --- RENDERING LOGIC ---

  if (loading) {
    // ... (Loading state)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-pink-500 text-xl font-semibold animate-pulse flex items-center space-x-3">
          <RefreshCw className="animate-spin" size={24} />
          <span>Loading media...</span>
        </div>
      </div>
    );
  }

  if (error && !mediaItems.length) {
    // ... (Initial Error state)
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

  return (
    <>
      <div className="h-screen flex flex-col p-0 bg-white/90">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 bg-black/90 z-20">
          <h1 className="text-4xl font-bold text-white">Media Collection ({mediaItems.length})</h1>
          <button
            onClick={() => setIsAddModalOpen(true)} // Open Add Modal
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center space-x-2 font-medium hover:scale-105 shadow-lg"
            title="Add New Media"
          >
            <Plus size={20} />
            <span>Add New</span>
          </button>
        </div>
        
        {/* Media List Table Container */}
        <div className="flex-1 overflow-hidden">
          <MediaTable 
            items={mediaItems} 
            onUpdate={handleInlineUpdate} 
            onDelete={handleDeleteClick} 
            getStatusBadgeStyles={getStatusBadgeStyles}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="absolute bottom-4 left-4 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl p-4 max-w-sm">
            <div className="flex items-center space-x-2 text-red-200">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Add New Media */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Add New Media Item"
      >
        <MediaItemForm
          initialData={undefined}
          onSubmit={handleAdd}
          onCancel={() => setIsAddModalOpen(false)} 
          showCancelButton={true}
        />
      </Modal>

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