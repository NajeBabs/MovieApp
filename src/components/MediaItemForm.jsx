import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

export default function MediaItemForm({ onSubmit, initialData, onCancel, showCancelButton = true }) {
  const isEditing = !!initialData && !!initialData.id;

  const [form, setForm] = useState(
    initialData || {
      title: "",
      releaseYear: new Date().getFullYear(),
      genre: "",
      rating: 5,
      status: "Planned",
    }
  );

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: (name === 'rating' || name === 'releaseYear') ? Number(value) : value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Title Input */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Movie, Show, or Game Title"
          className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500 transition-all shadow-sm"
          required
        />
      </div>

      {/* Release Year Input */}
      <div>
        <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
        <input
          type="number"
          name="releaseYear"
          id="releaseYear"
          min="1888" 
          max={new Date().getFullYear() + 5} 
          value={form.releaseYear}
          onChange={handleChange}
          placeholder="e.g., 2024"
          className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500 transition-all shadow-sm"
          required
        />
      </div>

      {/* Genre Input */}
      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
        <input
          type="text"
          name="genre"
          id="genre"
          value={form.genre}
          onChange={handleChange}
          placeholder="Action, Sci-Fi, Comedy, etc."
          className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-pink-500 focus:border-pink-500 transition-all shadow-sm"
        />
      </div>
      
      {/* Rating & Status Selects (Inline for better layout) */}
      <div className="flex gap-4">
        {/* Rating Input */}
        <div className="flex-1">
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating (1-10)</label>
          <select
            name="rating"
            id="rating"
            value={form.rating}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-pink-500 focus:border-pink-500 transition-all appearance-none cursor-pointer shadow-sm"
            required
          >
            {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        
        {/* Status Select */}
        <div className="flex-1">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            id="status"
            value={form.status}
            onChange={handleChange}
            className="w-full p-3 rounded-xl bg-white border border-gray-300 text-gray-800 focus:ring-pink-500 focus:border-pink-500 transition-all appearance-none cursor-pointer shadow-sm"
            required
          >
            <option value="Planned">Planned</option>
            <option value="Watching">Watching</option>
            <option value="Watched">Watched</option>
            <option value="Dropped">Dropped</option>
          </select>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-4 flex gap-4">
        <button
          type="submit"
          className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-lg"
        >
          <Plus size={20} />
          <span>{isEditing ? 'Save Changes' : 'Add Item'}</span>
        </button>
        
        {showCancelButton && (
          <button
            type="button"
            onClick={onCancel}
            className="w-24 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl border border-gray-300 transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-sm"
          >
            <X size={16} /> <span>Close</span>
          </button>
        )}
      </div>
    </form>
  );
}
