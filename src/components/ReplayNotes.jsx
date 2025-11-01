import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";
import { Plus, Save, Trash2 } from "lucide-react";
import ParticlesBg from "./ParticlesBg";

export default function ReplayNotes() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch all notes for the current user
  useEffect(() => {
    const fetchNotes = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("updated_at", { ascending: false });

      if (error) console.error("Error fetching notes:", error);
      else setNotes(data || []);
      setLoading(false);
    };
    fetchNotes();
  }, []);

  // ✅ Create a new note
  const handleNewNote = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
  };

  // ✅ Save (insert or update)
  const handleSave = async () => {
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    if (selectedNote) {
      const { error } = await supabase
        .from("notes")
        .update({
          title,
          content,
          updated_at: new Date(),
        })
        .eq("id", selectedNote.id)
        .eq("user_id", auth.user.id);

      if (error) alert("Failed to update note.");
    } else {
      const { data, error } = await supabase
        .from("notes")
        .insert([{ user_id: auth.user.id, title, content }])
        .select();

      if (!error && data) {
        setSelectedNote(data[0]);
        setNotes((prev) => [data[0], ...prev]);
      } else {
        alert("Failed to save note.");
      }
    }
    setSaving(false);
  };

  // ✅ Delete note
  const handleDelete = async (id) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) return alert("Failed to delete note.");
    setNotes(notes.filter((n) => n.id !== id));
    if (selectedNote?.id === id) handleNewNote();
  };

  // ✅ Select note for editing
  const openNote = (note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content || "");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-white">
        <ParticlesBg />
        Loading your notes...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0B] text-white overflow-hidden">
      <ParticlesBg />

      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-cyan-400">📝 Notes View</h1>
        <button
          onClick={handleNewNote}
          className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 px-4 py-2 rounded-lg border border-cyan-400/20 text-cyan-300 transition"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <div className="md:w-1/3 border-r border-white/10 p-4 overflow-y-auto max-h-[80vh]">
          {notes.length === 0 ? (
            <p className="text-white/50 text-sm">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                onClick={() => openNote(note)}
                className={`p-3 mb-2 rounded-lg cursor-pointer border ${
                  selectedNote?.id === note.id
                    ? "border-cyan-400/30 bg-cyan-500/10"
                    : "border-white/5 hover:bg-white/5"
                }`}
              >
                <h3 className="font-semibold text-white/90 truncate">
                  {note.title || "Untitled"}
                </h3>
                <p className="text-xs text-white/50 truncate">
                  {note.content?.substring(0, 80) || "Empty note..."}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 p-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent border-b border-white/10 focus:border-cyan-400/40 text-xl font-semibold outline-none mb-4 pb-1"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts here... ✍️"
            className="w-full min-h-[300px] bg-transparent border border-white/10 rounded-xl p-4 text-white/90 outline-none focus:border-cyan-400/40 resize-y"
          />

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-emerald-500/90 hover:bg-emerald-400 px-4 py-2 rounded-lg text-slate-900 font-medium"
            >
              <Save size={16} /> {saving ? "Saving..." : "Save"}
            </button>

            {selectedNote && (
              <button
                onClick={() => handleDelete(selectedNote.id)}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 px-4 py-2 rounded-lg text-red-400 border border-red-400/20"
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
