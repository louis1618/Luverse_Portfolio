'use client';

import React, { useEffect, useState } from 'react';
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { Flex, Spinner, useTheme } from '@once-ui-system/core';

interface WysiwygEditorProps {
  initialContent?: string;
  onChange: (markdown: string) => void;
  onUploadImage: (file: File) => Promise<string>;
}

export function WysiwygEditor({ initialContent, onChange, onUploadImage }: WysiwygEditorProps) {
  const [initialBlocks, setInitialBlocks] = useState<PartialBlock[] | "loading">("loading");
  
  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const rawTheme = document.documentElement.getAttribute("data-theme") || "light";
    setCurrentTheme(rawTheme === "dark" ? "dark" : "light");
  }, [theme]);

  useEffect(() => {
    async function loadInitialContent() {
      if (initialContent) {
        const tempEditor = BlockNoteEditor.create();
        const blocks = await tempEditor.tryParseMarkdownToBlocks(initialContent);
        setInitialBlocks(blocks);
      } else {
        setInitialBlocks([{ type: "paragraph", content: [] }]);
      }
    }
    loadInitialContent();
  }, [initialContent]);

  const editor = useCreateBlockNote({
    initialContent: initialBlocks !== "loading" && initialBlocks.length > 0 ? initialBlocks : undefined,
    uploadFile: onUploadImage,
  });

  if (initialBlocks === "loading") {
    return (
      <Flex fillWidth fillHeight horizontal="center" vertical="center" padding="64">
        <Spinner />
      </Flex>
    );
  }

  return (
    <div style={{ width: '100%', paddingBottom: '20vh' }}>
      <style>{`
        .bn-container,
        .bn-container[data-color-scheme="dark"],
        .bn-container[data-color-scheme="light"] {
          background-color: transparent !important;
          --bn-colors-editor-background: transparent !important;
          font-family: var(--font-body), sans-serif !important;
          font-size: 1.125rem;
          line-height: 1.7;
        }
        
        .bn-container[data-color-scheme="dark"] {
          --bn-colors-editor-text: var(--neutral-on-background-strong) !important;
        }
        
        /* Localized Placeholder */
        .bn-block-content[data-is-empty-and-focused][data-content-type="paragraph"] .bn-inline-content:empty::before {
          content: '내용을 입력하거나 /를 눌러 블록 추가' !important;
          color: var(--neutral-on-background-weak) !important;
          opacity: 0.5;
        }
        
        .bn-editor {
          padding: 0 !important;
          min-height: 500px;
          cursor: text;
        }
        
        ::selection {
          background-color: var(--brand-alpha-medium, rgba(0, 120, 255, 0.3));
          color: inherit;
        }
      `}</style>
      
      <BlockNoteView
        editor={editor}
        theme={currentTheme}
        onChange={() => {
          const markdown = editor.blocksToMarkdownLossy(editor.document);
          onChange(markdown);
        }}
      />
    </div>
  );
}
