import { Note } from '../services/notes';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
}

function NoteList({ notes, selectedNoteId, onSelectNote }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="note-list">
        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          No notes yet. Create one!
        </div>
      </div>
    );
  }

  return (
    <div className="note-list">
      {notes.map((note) => (
        <div
          key={note.id}
          className={`note-item ${selectedNoteId === note.id ? 'active' : ''}`}
          onClick={() => onSelectNote(note.id)}
        >
          <div className="note-item-title">
            {note.title || 'Untitled'}
          </div>
          <div className="note-item-preview">
            {note.content.substring(0, 100) || 'No content'}
          </div>
          <div className="note-item-date">
            {new Date(note.updatedAt).toLocaleDateString()} {new Date(note.updatedAt).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default NoteList;
