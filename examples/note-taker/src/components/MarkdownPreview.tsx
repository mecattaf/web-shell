import { marked } from 'marked';
import { useEffect, useState } from 'react';

interface MarkdownPreviewProps {
  content: string;
}

function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    const renderMarkdown = async () => {
      try {
        const rendered = await marked(content || '*No content*');
        setHtml(rendered);
      } catch (error) {
        console.error('Failed to render markdown:', error);
        setHtml('<p>Error rendering markdown</p>');
      }
    };

    renderMarkdown();
  }, [content]);

  return (
    <div
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MarkdownPreview;
