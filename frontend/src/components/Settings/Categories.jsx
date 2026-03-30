import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import React from "react";
const CATEGORY_COLORS = ["#F5C518", "#4A90E2", "#E07B39", "#5CB85C", "#9B59B6"];

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Work", color: "#F5C518" },
  { id: 2, name: "Study", color: "#4A90E2" },
  { id: 3, name: "Reading", color: "#E07B39" },
];

export default function Categories({ categories = DEFAULT_CATEGORIES, onCategoriesChange }) {
  const [list, setList] = useState(categories);
  const [editing, setEditing] = useState(null);
  const [editVal, setEditVal] = useState("");

  const startEdit = (cat) => {
    setEditing(cat.id);
    setEditVal(cat.name);
  };

  const saveEdit = () => {
    const updated = list.map((c) => c.id === editing ? { ...c, name: editVal } : c);
    setList(updated);
    onCategoriesChange?.(updated);
    setEditing(null);
  };

  const deleteCategory = (id) => {
    const updated = list.filter((c) => c.id !== id);
    setList(updated);
    onCategoriesChange?.(updated);
  };

  const addCategory = () => {
    const newCat = {
      id: Date.now(),
      name: "New Category",
      color: CATEGORY_COLORS[list.length % CATEGORY_COLORS.length],
    };
    const updated = [...list, newCat];
    setList(updated);
    onCategoriesChange?.(updated);
    startEdit(newCat);
  };

  return (
    <div className="settings-card categories-card">
      <h3 className="card-title">Categories</h3>

      <div className="category-list">
        {list.map((cat) => (
          <div key={cat.id} className="category-row">
            <span className="cat-dot" style={{ background: cat.color }} />
            {editing === cat.id ? (
              <input
                className="cat-edit-input"
                value={editVal}
                autoFocus
                onChange={(e) => setEditVal(e.target.value)}
                onBlur={saveEdit}
                onKeyDown={(e) => e.key === "Enter" && saveEdit()}
              />
            ) : (
              <span className="cat-name">{cat.name}</span>
            )}
            <div className="cat-actions">
              <button className="icon-btn" onClick={() => startEdit(cat)}><Pencil size={13} /></button>
              <button className="icon-btn danger" onClick={() => deleteCategory(cat.id)}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>

      <button className="add-category-btn" onClick={addCategory}>
        <Plus size={13} /> Add Category
      </button>
    </div>
  );
}
