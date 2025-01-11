import { useTheme } from '@emotion/react';
import { Box } from '@mui/material';
import * as monaco from 'monaco-editor-core';
import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';

const Editor = React.forwardRef(({ query, ...props }, ref) => {
  const theme = useTheme();

  const monacoEl = useRef(null);
  const [editor, setEditor] = useState(null);

  useImperativeHandle(
    ref,
    () => ({
      getEditor: () => editor,
    }),
    [editor]
  );

  useEffect(() => {
    monaco.editor.setTheme(
      theme.palette.mode === 'dark' ? 'ceql-dark' : 'ceql-light'
    );
  }, [theme.palette.mode]);

  useEffect(() => {
    if (editor && query) {
      const model = editor.getModel();
      model.setValue(query);
    }
  }, [editor, query]);

  useEffect(() => {
    setEditor(
      monaco.editor.create(monacoEl.current, {
        theme: theme.palette.mode === 'dark' ? 'ceql-dark' : 'ceql-light',
        language: 'ceql',
        automaticLayout: true,
        minimap: { enabled: false },
        renderWhitespace: 'all',
        tabSize: 2,
        fontSize: 20,
        scrollbar: {
          alwaysConsumeMouseWheel: false,
        },
      })
    );

    return () => {
      editor?.dispose();
      monaco.editor.getModels().forEach((model) => model.dispose());
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Box className="editor" ref={monacoEl} {...props}></Box>;
});

Editor.displayName = 'Editor';

export default Editor;
