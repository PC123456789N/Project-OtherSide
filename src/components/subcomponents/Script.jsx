import { useSavedState } from "../../context/selectedContext/SavedStateContext"

import { useEditor, EditorContent } from "@tiptap/react"
import { useEffect, useState } from "react"

import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import FontSize from "@tiptap/extension-text-style/font-size"
import StarterKit from "@tiptap/starter-kit"

export default function Script() {

  const {scriptBody, setScriptBody} = useSavedState();
  const {scriptTitle, setScriptTitle} = useSavedState(); 

  const editor = useEditor({
    extensions: [StarterKit, TextStyle, FontSize, TextAlign.configure({types: ['heading','paragraph'],}),],
    content: "<p>Cole Seu Roteiro Aqui :)</p>",
    
    editorProps: {
      attributes: {
        class: "focus:outline-none"
      }
    },

    onUpdate: ({ editor }) => {
      setScriptBody(editor.getHTML())
    }
  })

  if (!editor) return null

  useEffect(() => {
    if (editor && scriptBody) {
      editor.commands.setContent(scriptBody)
    }
  }, [editor])

  useEffect(() => {
    setScriptTitle(scriptTitle)
  }, [scriptTitle])


  return(
    <div className="h-full w-full bg-slate-900 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden p-3">
        <div className="max-w-5xl mx-auto min-h-0 bg-slate-800 text-white p-4 rounded-xl h-full flex flex-col shadow-lg">

          <input
            type="text"
            placeholder="Título..."
            onChange={(e) => setScriptTitle(e.target.value)}
            value={scriptTitle}
            className="bg-transparent text-xl font-semibold outline-none placeholder:text-gray-400 pb-3"
          />

          <div className="flex gap-2 border-b border-slate-600 pb-2">
            <select
              onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
              className="bg-slate-700 text-white rounded px-2"
            >
              <option value="8px">8</option>
              <option value="9px">9</option>
              <option value="10px">10</option>
              <option value="12px">11</option>
              <option value="14px">14</option>
              <option value="18px">18</option>
              <option value="24px">24</option>
              <option value="30px">30</option>
              <option value="36px">36</option>
              <option value="48px">48</option>
            </select>

            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className="px-2 py-1 size-8 bg-slate-700 rounded hover:bg-slate-600"
            >
              <strong>B</strong>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className="px-2 py-1 size-8 bg-slate-700 rounded hover:bg-slate-600"
            >
              <em>I</em>
            </button>

            <select
              onChange={(e) => editor.chain().focus().setTextAlign(e.target.value).run()}
              className="bg-slate-700 text-white rounded px-2"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centralizar</option>
              <option value="right">Direita</option>
              <option value="justify">Justificar</option>
            </select>
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
          <div className="h-full overflow-auto min-h-0">
            <EditorContent 
              editor={editor}
              className="prose prose-invert max-w-none" 
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}