import React, { useState, useEffect, useRef } from 'react';
import './App.css';

/**
 * PUBLIC_INTERFACE
 * Main Notes Management Application.
 * Modern, light-themed, sidebar and main panel layout.
 * Features: List, Create, Edit, Delete, Search notes.
 * Applies the color palette:
 *   - Primary:   #1976d2 (used for sidebar background and primary buttons)
 *   - Secondary: #424242 (used for sidebar highlights/headings)
 *   - Accent:    #ffb300 (used for actions such as "New Note")
 */
function App() {
  // Notes state: Array of {id, title, content, date}
  const [notes, setNotes] = useState(() => {
    // Try loading from localStorage for persistence
    const stored = localStorage.getItem('notes');
    if (stored) return JSON.parse(stored);
    return [];
  });

  // Selected note, search/filter, and UI state
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '' });

  // For search focus on mobile/small screens
  const searchInputRef = useRef(null);

  // Save notes to localStorage on update
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  /** PUBLIC_INTERFACE
   * Add new note, selects and switches to edit mode
   */
  function handleAddNote() {
    setIsEditing(true);
    setSelectedId(null);
    setEditData({ title: '', content: '' });
  }

  /** PUBLIC_INTERFACE
   * Select existing note to view details
   */
  function handleSelectNote(id) {
    setSelectedId(id);
    setIsEditing(false);
    setEditData({ title: '', content: '' });
  }

  /** PUBLIC_INTERFACE
   * Enter edit mode for a given note (populate form)
   */
  function handleEditNote(id) {
    const note = notes.find(n => n.id === id);
    if (note) {
      setIsEditing(true);
      setSelectedId(id);
      setEditData({ title: note.title, content: note.content });
    }
  }

  /** PUBLIC_INTERFACE
   * Save changes (new or edit)
   */
  function handleSaveNote(e) {
    e.preventDefault();
    if (!editData.title.trim()) return;
    if (selectedId) {
      // Edit
      setNotes(notes =>
        notes.map(n =>
          n.id === selectedId
            ? { ...n, title: editData.title, content: editData.content, date: new Date().toISOString() }
            : n
        )
      );
    } else {
      // Add new
      const newNote = {
        id: Date.now().toString(),
        title: editData.title,
        content: editData.content,
        date: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
      setSelectedId(newNote.id);
    }
    setIsEditing(false);
    setEditData({ title: '', content: '' });
  }

  /** PUBLIC_INTERFACE
   * Deletes a note by id (with confirmation)
   */
  function handleDeleteNote(id) {
    if (window.confirm('Delete this note?')) {
      setNotes(notes => notes.filter(n => n.id !== id));
      if (selectedId === id) setSelectedId(null);
      setIsEditing(false);
    }
  }

  /** PUBLIC_INTERFACE
   * Updates search value
   */
  function handleSearchChange(e) {
    setSearch(e.target.value);
  }

  /** PUBLIC_INTERFACE
   * Handles edit content updates for title and content
   */
  function handleEditFieldChange(e) {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  }

  // Filter notes based on search (case-insensitive)
  const filteredNotes = notes.filter(
    n =>
      n.title.toLowerCase().includes(search.trim().toLowerCase()) ||
      n.content.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Get note to show in view/edit panel
  const selectedNote = notes.find(n => n.id === selectedId);

  return (
    <div className="notes-app-root">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="brand-logo">📝</span>
          <span className="brand-title">Notes</span>
        </div>
        <div className="sidebar-actions">
          <button className="btn btn-accent" onClick={handleAddNote}>+ New Note</button>
        </div>
        <div className="sidebar-search">
          <input
            ref={searchInputRef}
            className="search-input"
            placeholder="Search notes..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search notes"
          />
        </div>
        <nav className="sidebar-list">
          {filteredNotes.length === 0 && (
            <div className="empty-list">No notes found.</div>
          )}
          {filteredNotes.map(note => (
            <div
              key={note.id}
              className={`sidebar-list-item${note.id === selectedId && !isEditing ? ' selected' : ''}`}
              onClick={() => handleSelectNote(note.id)}
              tabIndex={0}
              aria-label={`View note ${note.title}`}>
              <div className="note-title">{note.title}</div>
              <div className="note-date">{(new Date(note.date)).toLocaleString()}</div>
            </div>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          {isEditing ? (
            <span className="topbar-title">{selectedId ? 'Edit Note' : 'New Note'}</span>
          ) : (
            <span className="topbar-title">
              {selectedNote ? selectedNote.title : 'Notes App'}
            </span>
          )}
        </header>
        {/* Note Panel */}
        <section className="note-panel">
          {!isEditing && selectedNote && (
            <div className="note-view">
              <h2>{selectedNote.title}</h2>
              <div className="note-view-content">{selectedNote.content.split('\n').map((line, idx) =>
                <div key={idx}>{line}</div>
              )}</div>
              <div className="note-meta">
                <span>Last edited: {(new Date(selectedNote.date)).toLocaleString()}</span>
              </div>
              <div className="note-actions">
                <button className="btn btn-primary" onClick={() => handleEditNote(selectedNote.id)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDeleteNote(selectedNote.id)}>Delete</button>
              </div>
            </div>
          )}

          {!isEditing && !selectedNote && (
            <div className="empty-details">
              <p>Select a note to view details or create a new note.</p>
            </div>
          )}

          {/* Edit/New Note Form */}
          {isEditing && (
            <form className="note-form" onSubmit={handleSaveNote}>
              <label htmlFor="note-title" className="form-label">Title</label>
              <input
                id="note-title"
                name="title"
                className="form-input"
                value={editData.title}
                onChange={handleEditFieldChange}
                required
                placeholder="Note title"
                autoFocus
                maxLength={100}
              />
              <label htmlFor="note-content" className="form-label">Content</label>
              <textarea
                id="note-content"
                name="content"
                className="form-textarea"
                value={editData.content}
                onChange={handleEditFieldChange}
                placeholder="Write your note here..."
                rows={10}
                maxLength={4000}
              />
              <div className="form-actions">
                <button className="btn btn-primary" type="submit">Save</button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({ title: '', content: '' });
                    if (selectedId && notes.find(n => n.id === selectedId)) setSelectedId(selectedId);
                  }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
