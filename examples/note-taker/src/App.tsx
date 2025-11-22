import { useState, useEffect } from 'react';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import { Note, NotesService } from './services/notes';

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load notes on mount
  useEffect(() => {
    const loadedNotes = NotesService.getAllNotes();
    setNotes(loadedNotes);

    // Select first note if available
    if (loadedNotes.length > 0) {
      setSelectedNoteId(loadedNotes[0].id);
    }
  }, []);

  // Handle search
  useEffect(() => {
    const searchResults = NotesService.searchNotes(searchQuery);
    setNotes(searchResults);
  }, [searchQuery]);

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null;

  const handleCreateNote = () => {
    const newNote = NotesService.createNote();
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleUpdateNote = (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    const updated = NotesService.updateNote(id, updates);
    if (updated) {
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === id ? updated : note))
      );
    }
  };

  const handleDeleteNote = (id: string) => {
    const success = NotesService.deleteNote(id);
    if (success) {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));

      // Select another note if the deleted one was selected
      if (selectedNoteId === id) {
        const remainingNotes = notes.filter((note) => note.id !== id);
        setSelectedNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
      }
    }
  };

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>📝 Notes</h1>
          <input
            type="text"
            className="search-box"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <NoteList
          notes={notes}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
        />

        <button className="new-note-btn" onClick={handleCreateNote}>
          + New Note
        </button>
      </div>

      <NoteEditor
        note={selectedNote}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
      />
    </div>
  );
}

export default App;
