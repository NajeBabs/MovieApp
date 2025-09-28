import { useEffect, useState, useCallback } from "react";
import { Edit3, Trash2, Plus, AlertCircle, RefreshCw, CheckCircle, X } from "lucide-react";
import { api } from "../MediaAPI.js"; 
import MediaItemForm from "./MediaItemForm";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto close after 4 seconds

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

// Custom Confirmation Modal Component
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

export default function MediaItemCollection() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setEditingItem(null);
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

  // Get status badge styles including "Dropped"
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

  // Loading state
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

  // Error state (when no data loaded)
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

  // Form view
  if (editingItem) {
    return (
      <>
        <div className="p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                {editingItem === "ADD" ? "Add New Media Item" : `Edit: ${editingItem.title}`}
              </h2>
              <MediaItemForm
                initialData={editingItem !== "ADD" ? editingItem : undefined}
                onSubmit={handleAddOrUpdate}
                onCancel={() => setEditingItem(null)}
              />
            </div>
          </div>
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}
      </>
    );
  }

  // Main collection view
  return (
    <>
      <div className="p-6 relative">
        {/* Error banner (when data exists but operation failed) */}
        {error && mediaItems.length > 0 && (
          <div className="mb-6 bg-red-500/20 backdrop-blur-sm border border-red-400/50 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-red-200">
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Media Cards Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {mediaItems.length === 0 ? (
            <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center py-20">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12">
                <h3 className="text-2xl font-bold text-white mb-4">No Media Items Found</h3>
                <p className="text-white/80 mb-6">Start building your collection by adding your first media item!</p>
                <button
                  onClick={() => setEditingItem("ADD")}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 mx-auto hover:scale-105"
                >
                  <Plus size={20} />
                  <span>Add Your First Item</span>
                </button>
              </div>
            </div>
          ) : (
            mediaItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/25 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                {/* Card Content */}
                <div className="text-white">
                  <h2 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-yellow-200 transition-colors">
                    {item.title}
                  </h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Year:</span>
                      <span className="text-sm font-medium">{item.releaseYear}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Genre:</span>
                      <span className="text-sm font-medium">{item.genre}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Rating:</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">{item.rating}/10</span>
                        <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 transition-all duration-500"
                            style={{ width: `${(item.rating / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/70">Status:</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusBadgeStyles(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-full border border-blue-400/50 text-blue-200 hover:text-white transition-all duration-200 hover:scale-110"
                    title="Edit"
                    aria-label={`Edit ${item.title}`}
                  >
                    <Edit3 size={16} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full border border-red-400/50 text-red-200 hover:text-white transition-all duration-200 hover:scale-110"
                    title="Delete"
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating Add Button */}
        <button
          onClick={() => setEditingItem("ADD")}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white p-4 rounded-full shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110 z-50 group"
          title="Add New Media"
          aria-label="Add New Media Item"
        >
          <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      {/* Confirmation Modal */}
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