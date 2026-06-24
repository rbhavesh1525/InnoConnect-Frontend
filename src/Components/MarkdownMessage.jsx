import React from "react";
import ReactMarkdown from "react-markdown";

/**
 * Renders AI chat reply markdown with clean, styled HTML elements.
 * Used inside the Innovation Assistant chat bubbles.
 */
const MarkdownMessage = ({ content }) => {
  return (
    <ReactMarkdown
      components={{
        // Paragraphs
        p: ({ children }) => (
          <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
        ),

        // Headings
        h1: ({ children }) => (
          <h1 className="text-base font-bold mb-1 mt-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold mb-1 mt-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mb-1 mt-2">{children}</h3>
        ),

        // Ordered list
        ol: ({ children }) => (
          <ol className="list-decimal list-outside pl-5 mb-2 space-y-1">
            {children}
          </ol>
        ),

        // Unordered list
        ul: ({ children }) => (
          <ul className="list-disc list-outside pl-5 mb-2 space-y-1">
            {children}
          </ul>
        ),

        // List item
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),

        // Bold
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),

        // Italic
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),

        // Inline code
        code: ({ children }) => (
          <code className="bg-black/10 rounded px-1 py-0.5 text-xs font-mono">
            {children}
          </code>
        ),

        // Block quote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-current/30 pl-3 italic opacity-80 my-2">
            {children}
          </blockquote>
        ),

        // Horizontal rule
        hr: () => <hr className="border-current/20 my-2" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownMessage;
