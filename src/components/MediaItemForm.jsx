import { useState } from "react";

export default function MediaItemForm({ onSubmit, initialData, onCancel }) {
  const [form, setForm] = useState(
    initialData || {
      title: "",
      releaseYear: "",
      genre: "",
      rating: 1,
      status: "Planned",
    }
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-gray-100 rounded shadow">
      <input
        type="text"
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        className="block w-full mb-2 p-2 border rounded"
      />
      <input
        type="number"
        name="releaseYear"
        value={form.releaseYear}
        onChange={handleChange}
        placeholder="Release Year"
        className="block w-full mb-2 p-2 border rounded"
      />
      <input
        type="text"
        name="genre"
        value={form.genre}
        onChange={handleChange}
        placeholder="Genre"
        className="block w-full mb-2 p-2 border rounded"
      />
      <input
        type="number"
        name="rating"
        min="1"
        max="10"
        value={form.rating}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border rounded"
      />
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border rounded"
      >
        <option value="Planned">Planned</option>
        <option value="Watching">Watching</option>
        <option value="Watched">Watched</option>
      </select>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-gray-500 text-white rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
