import { useDataHandler } from "../../context/dataHandlerContext/DataHandlerContext"

import { useEffect, useState } from "react"

import { LiaMarkerSolid } from "react-icons/lia";
import { FaRemoveFormat } from "react-icons/fa";

import { useEditor, EditorContent } from "@tiptap/react"
import Document from "@tiptap/extension-document"
import Paragraph from "@tiptap/extension-paragraph"
import Text from "@tiptap/extension-text"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import FontSize from "@tiptap/extension-text-style/font-size"
import Bold from "@tiptap/extension-bold"
import Italic from "@tiptap/extension-italic"
import Strike from "@tiptap/extension-strike"
import Underline from "@tiptap/extension-underline"
import Heading from "@tiptap/extension-heading"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import Blockquote from "@tiptap/extension-blockquote"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import History from "@tiptap/extension-history"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"

function ColorPicker({ label, activeColor, onSelect, onClear }) {
  const [open, setOpen] = useState(false)

  const palette = [
    ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff'],
    ['#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'],
    ['#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'],
    ['#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
    ['#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0'],
    ['#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79'],
    ['#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47'],
    ['#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'],
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        title={label}
        className="size-9 flex flex-col items-center justify-center gap-0.5 rounded-full border border-purple-900/40 bg-black/60 text-gray-300 hover:border-purple-500 hover:text-white transition-colors"
      >
        <span className="text-xs leading-none font-semibold">
          {label === "Marca-texto" ? <LiaMarkerSolid /> : <p>A</p>}
        </span>
        <span
          className="w-4 h-1 rounded-sm"
          style={{ backgroundColor: activeColor || '#ffffff' }}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-11 left-0 z-50 bg-zinc-900 border border-purple-900/40 rounded-lg shadow-xl p-3 w-64">
            {label === "Marca-texto" && (
              <button
                onClick={() => { onClear(); setOpen(false) }}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white w-full px-2 py-1.5 rounded hover:bg-purple-900/30 mb-2 transition-colors"
              >
                <span className="text-red-400 text-base leading-none">⦸</span> Nenhuma
              </button>
            )}
            <div className="grid grid-cols-10 gap-1">
              {palette.flat().map((color, i) => (
                <button
                  key={i}
                  onClick={() => { onSelect(color); setOpen(false) }}
                  className="size-5 rounded-full border border-white/10 hover:scale-110 hover:ring-2 hover:ring-purple-400 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function Script() {

  const {scripts, setScripts} = useDataHandler();
  const {notesList, setNotesList} = useDataHandler();

  const {unsavedChanges, setUnsavedChanges} = useDataHandler();

  const [loadedScript, setLoadedScript] = useState(false);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      HorizontalRule,
      History,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: "<p>Cole Seu Roteiro Aqui :)</p>",
    editorProps: {
      attributes: {
        class: "focus:outline-none"
      }
    },

    onUpdate: ({ editor }) => {
      setScripts(prev => ({
        ...prev,
        body: editor.getHTML()
      }))
      setUnsavedChanges(true)
    }
  })

  useEffect(() => {
    if (!editor || loadedScript || !scripts.body) return;

    editor.commands.setContent(scripts.body);
    setLoadedScript(true);
  }, [editor, scripts.body, loadedScript]);

  useEffect(() => {
    setScripts(prev => ({
      ...prev,
      title: scripts.title
    }))
    setUnsavedChanges(true)
  }, [scripts.title])

  if (!editor) return null

  return(
    <div className="h-full w-full bg-black flex flex-col overflow-hidden relative">

      {/* ambient red glow, same language as the top nav bar */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-40 bg-linear-to-b from-red-900/20 via-red-900/5 to-transparent" />

      <div className="flex-1 overflow-hidden p-3 relative">
        <div className="max-w-5xl mx-auto min-h-0 bg-zinc-900/80 backdrop-blur-sm text-white p-5 rounded-xl h-full flex flex-col shadow-lg border border-purple-900/50">

          <input
            type="text"
            placeholder="Título..."
            onChange={(e) => setScripts(prev => ({
                ...prev,
                title: (e.target.value)
              }))
            }
            value={scripts.title}
            className="bg-transparent text-2xl font-bold outline-none placeholder:text-gray-500 pb-3 tracking-wide"
          />

          <div className="flex items-center gap-2 border-b border-purple-900 pb-3 mb-3 flex-wrap">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="size-9 flex items-center justify-center rounded-full border border-purple-900/40 bg-black/60 text-gray-300 hover:border-purple-500 hover:text-white disabled:opacity-30 disabled:hover:border-purple-900/40 disabled:hover:text-gray-300 transition-colors"
            >
              ↶
            </button>

            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="size-9 flex items-center justify-center rounded-full border border-purple-900/40 bg-black/60 text-gray-300 hover:border-purple-500 hover:text-white disabled:opacity-30 disabled:hover:border-purple-900/40 disabled:hover:text-gray-300 transition-colors"
            >
              ↷
            </button>
            
            <select
              onChange={(e) => {
                const value = e.target.value
                if (value === "paragraph") {
                  editor.chain().focus().setParagraph().run()
                } else {
                  editor.chain().focus().toggleHeading({ level: Number(value) }).run()
                }
              }}
              className="bg-black/60 border border-purple-900/40 text-white text-sm rounded-full px-3 py-1.5 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="paragraph">Parágrafo</option>
              <option value="1">Título 1</option>
              <option value="2">Título 2</option>
              <option value="3">Título 3</option>
            </select>
            
            <select
              onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
              className="bg-black/60 border border-purple-900/40 text-white text-sm rounded-full px-3 py-1.5 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="8px">8</option>
              <option value="9px">9</option>
              <option value="10px">10</option>
              <option value="12px">12</option>
              <option value="14px">14</option>
              <option value="18px">18</option>
              <option value="24px">24</option>
              <option value="30px">30</option>
              <option value="36px">36</option>
              <option value="48px">48</option>
            </select>


            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`size-9 flex items-center justify-center rounded-full border transition-colors ${
                editor.isActive('bold')
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-black/60 border-purple-900/40 text-gray-300 hover:border-purple-500 hover:text-white'
              }`}
            >
              <strong>B</strong>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`size-9 flex items-center justify-center rounded-full border transition-colors ${
                editor.isActive('italic')
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-black/60 border-purple-900/40 text-gray-300 hover:border-purple-500 hover:text-white'
              }`}
            >
              <em>I</em>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`size-9 flex items-center justify-center rounded-full border transition-colors ${
                editor.isActive('underline')
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-black/60 border-purple-900/40 text-gray-300 hover:border-purple-500 hover:text-white'
              }`}
            >
              <u className="underline">U</u>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`size-9 flex items-center justify-center rounded-full border transition-colors ${
                editor.isActive('strike')
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-black/60 border-purple-900/40 text-gray-300 hover:border-purple-500 hover:text-white'
              }`}
            >
              <s className="line-through">S</s>
            </button>

            <ColorPicker
              label="Cor do texto"
              activeColor={editor.getAttributes('textStyle').color}
              onSelect={(color) => editor.chain().focus().setColor(color).run()}
              onClear={() => editor.chain().focus().unsetColor().run()}
            />

            <ColorPicker
              label="Marca-texto"
              activeColor={editor.getAttributes('highlight').color}
              onSelect={(color) => editor.chain().focus().toggleHighlight({ color }).run()}
              onClear={() => editor.chain().focus().unsetHighlight().run()}
            />

            <select
              onChange={(e) => editor.chain().focus().setTextAlign(e.target.value).run()}
              className="bg-black/60 border border-purple-900/40 text-white text-sm rounded-full px-3 py-1.5 outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="left">Esquerda</option>
              <option value="center">Centralizar</option>
              <option value="right">Direita</option>
              <option value="justify">Justificar</option>
            </select>

            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="size-9 flex items-center justify-center rounded-full border border-purple-900/40 bg-black/60 text-gray-300 hover:border-purple-500 hover:text-white transition-colors"
            >
              ―
            </button>

            <button
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              className="size-9 flex items-center justify-center rounded-full border border-purple-900/40 bg-black/60 text-gray-300 hover:border-red-500 hover:text-white transition-colors"
              title="Limpar formatação"
            >
              <FaRemoveFormat size={20}/>
            </button>

            <div className="ml-auto text-xs uppercase tracking-widest text-purple-300/70 font-semibold pr-1">
              {unsavedChanges ? "Salvando" : "Salvo"}
            </div>
          </div>

          <div className="flex-1 overflow-hidden min-h-0">
            <div className="h-full overflow-auto min-h-0 pr-1">
              <EditorContent
                editor={editor}
                className="prose prose-invert max-w-none prose-headings:text-purple-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
