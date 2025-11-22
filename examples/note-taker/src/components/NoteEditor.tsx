import { useState, useEffect } from 'react';
import MarkdownPreview from './MarkdownPreview';
import { Note } from '../services/notes';

interface NoteEditorProps {
  note: Note | null;
  onUpdate: (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => void;
  onDelete: (id: string) => void;
}

function NoteEditor({ note, onUpdate, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Update local state when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [note]);

  // Auto-save on changes (debounced)
  useEffect(() => {
    if (!note) return;

    const timeoutId = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        onUpdate(note.id, { title, content });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [title, content, note, onUpdate]);

  const handleDelete = () => {
    if (!note) return;

    if (confirm(`Delete note "${note.title}"?`)) {
      onDelete(note.id);
    }
  };

  if (!note) {
    return (
      <div className="editor">
        <div className="empty-state">
          Select a note or create a new one
        </div>
      </div>
    );
  }

  return (
    <div className="editor">
      <div className="editor-header">
        <div className="editor-actions">
          <button
            className="btn"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? '✏️ Edit' : '👁️ Preview'}
          </button>
        </div>
        <div className="editor-actions">
          <button className="btn btn-danger" onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-pane">
          <input
            type="text"
            className="editor-title"
            placeholder="Note title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="editor-textarea"
            placeholder="Write your note here... (Markdown supported)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {showPreview && (
          <div className="preview-pane">
            <h3 style={{ marginTop: 0 }}>Preview</h3>
            <MarkdownPreview content={content} />
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteEditor;
