/**
 * Note service - Handles CRUD operations for notes
 * Uses browser localStorage for persistence
 */

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'webshell-notes';

export class NotesService {
  /**
   * Get all notes
   */
  static getAllNotes(): Note[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load notes:', error);
      return [];
    }
  }

  /**
   * Get a single note by ID
   */
  static getNote(id: string): Note | null {
    const notes = this.getAllNotes();
    return notes.find((note) => note.id === id) || null;
  }

  /**
   * Create a new note
   */
  static createNote(title: string = 'Untitled', content: string = ''): Note {
    const note: Note = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const notes = this.getAllNotes();
    notes.unshift(note);
    this.saveNotes(notes);

    return note;
  }

  /**
   * Update an existing note
   */
  static updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'content'>>): Note | null {
    const notes = this.getAllNotes();
    const index = notes.findIndex((note) => note.id === id);

    if (index === -1) return null;

    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.saveNotes(notes);
    return notes[index];
  }

  /**
   * Delete a note
   */
  static deleteNote(id: string): boolean {
    const notes = this.getAllNotes();
    const filtered = notes.filter((note) => note.id !== id);

    if (filtered.length === notes.length) return false;

    this.saveNotes(filtered);
    return true;
  }

  /**
   * Search notes
   */
  static searchNotes(query: string): Note[] {
    if (!query.trim()) return this.getAllNotes();

    const notes = this.getAllNotes();
    const lowerQuery = query.toLowerCase();

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Save notes to storage
   */
  private static saveNotes(notes: Note[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  }
}
