import React, { useState, useEffect } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../api/services/categoryService";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, Layers } from "lucide-react";

const ManageCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            setCategories(res.data || res);
        } catch {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenForm = (category = null) => {
        if (category) {
            setEditingId(category._id);
            setFormData({ name: category.name, description: category.description || "" });
        } else {
            setEditingId(null);
            setFormData({ name: "", description: "" });
        }
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error("Name is required");

        setSubmitting(true);
        try {
            if (editingId) {
                await updateCategory(editingId, formData);
                toast.success("Category updated");
            } else {
                await createCategory(formData);
                toast.success("Category created");
            }
            setShowForm(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Operation failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This action cannot be undone unless no courses are assigned to it.")) return;
        try {
            await deleteCategory(id);
            toast.success("Category deleted");
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete. It might be in use.");
        }
    };

    if (loading) return <div className="p-10 flex justify-center text-slate-500">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Layers className="text-blue-600" /> Manage Categories
                    </h1>
                    <p className="text-slate-500 font-medium tracking-wide mt-2">Create and organize course categories</p>
                </div>
                {!showForm && (
                    <button onClick={() => handleOpenForm()} className="btn-primary shadow-lg shadow-blue-500/20 gap-2">
                        <Plus className="w-5 h-5" /> Add Category
                    </button>
                )}
            </div>

            {showForm && (
                <div className="card p-8 mb-10 border-blue-100 bg-blue-50/30">
                    <h2 className="text-xl font-bold mb-6 text-slate-800">{editingId ? "Edit Category" : "New Category"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label">Category Name *</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" placeholder="e.g. Web Development" required />
                        </div>
                        <div>
                            <label className="label">Description</label>
                            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input min-h-[100px]" placeholder="Brief description of what this category covers"></textarea>
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" disabled={submitting} className="btn-primary w-32 h-11">
                                {submitting ? "Saving..." : "Save"}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary w-32 h-11">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card overflow-hidden border-slate-200">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 uppercase text-xs font-bold text-slate-500 tracking-wider">
                            <th className="p-4 indent-2">Name</th>
                            <th className="p-4">Slug</th>
                            <th className="p-4 hidden sm:table-cell">Description</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {categories.map(cat => (
                            <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 indent-2 font-bold text-slate-800">{cat.name}</td>
                                <td className="p-4 text-sm text-slate-500 font-mono">{cat.slug}</td>
                                <td className="p-4 hidden sm:table-cell text-sm text-slate-600 truncate max-w-[200px]">{cat.description || "—"}</td>
                                <td className="p-4 flex justify-end gap-3 text-right">
                                    <button onClick={() => handleOpenForm(cat)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                                    No categories found. Create one above!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageCategoriesPage;
