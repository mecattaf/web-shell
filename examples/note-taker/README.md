# Note Taker - WebShell Example

A simple CRUD app with local storage persistence and markdown preview.

## What it demonstrates

- **CRUD operations**: Create, read, update, delete notes
- **Local persistence**: Browser localStorage for data
- **State management**: React hooks for managing app state
- **Forms and inputs**: Controlled components
- **Real-time updates**: Auto-save with debouncing
- **Markdown support**: Live preview using marked.js

## Features

- Create and manage notes
- Real-time search/filter
- Auto-save (500ms debounce)
- Markdown preview
- Responsive layout
- Delete confirmation

## Structure

```
note-taker/
├── webshell.json
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   ├── NoteList.tsx
│   │   ├── NoteEditor.tsx
│   │   └── MarkdownPreview.tsx
│   └── services/
│       └── notes.ts
└── README.md
```

## Setup

Install dependencies:

```bash
cd examples/note-taker
npm install
```

## Running

### Development mode

```bash
npm run dev
# Then run WebShell pointing to dev server
```

### Build for production

```bash
npm run build
# Then run with WebShell
```

## Code walkthrough

### 1. Data model

Simple note structure:

```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}
```

### 2. CRUD operations

Using a service class for data operations:

```typescript
// Create
const note = NotesService.createNote('My Note', 'Content...');

// Read
const notes = NotesService.getAllNotes();
const note = NotesService.getNote(id);

// Update
NotesService.updateNote(id, { title: 'Updated Title' });

// Delete
NotesService.deleteNote(id);

// Search
const results = NotesService.searchNotes('keyword');
```

### 3. Auto-save

Debounced saving for better UX:

```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    onUpdate(note.id, { title, content });
  }, 500);

  return () => clearTimeout(timeoutId);
}, [title, content]);
```

### 4. Local storage

Persistent storage using browser APIs:

```typescript
// Save
localStorage.setItem('webshell-notes', JSON.stringify(notes));

// Load
const stored = localStorage.getItem('webshell-notes');
const notes = JSON.parse(stored);
```

### 5. Markdown preview

Live rendering with marked.js:

```typescript
import { marked } from 'marked';

const html = await marked(content);
```

### 6. Search/filter

Real-time search through notes:

```typescript
useEffect(() => {
  const searchResults = NotesService.searchNotes(searchQuery);
  setNotes(searchResults);
}, [searchQuery]);
```

## Features to add

Try extending the app:

- **Categories/tags**: Organize notes by category
- **Formatting toolbar**: Quick markdown buttons
- **Export**: Download notes as .md files
- **Dark mode toggle**: Switch themes
- **Sync**: Save to backend via IPC
- **Attachments**: Support images and files
- **Keyboard shortcuts**: Quick actions (Ctrl+N, etc.)
- **Note templates**: Pre-filled note structures
- **Sorting options**: By date, title, etc.

## Markdown examples

Try these in your notes:

```markdown
# Heading 1

## Heading 2

**Bold text** and *italic text*

- List item 1
- List item 2

1. Numbered item
2. Another item

`inline code`

\`\`\`javascript
// Code block
console.log('Hello!');
\`\`\`

[Link](https://example.com)
```

## Next steps

- Check out the production `calendar` app for more complex state management
- Read the SDK docs for backend integration via IPC
- Explore `system-monitor` for real-time subscriptions

## Dependencies

- **React**: UI framework
- **marked**: Markdown parser
- **Vite**: Build tool
- **TypeScript**: Type safety
