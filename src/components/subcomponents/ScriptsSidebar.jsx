import { useState, useRef, useEffect } from "react"
import { FaPlus, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa"
import { LiaFileAltSolid } from "react-icons/lia"

export default function ScriptsSidebar({
  scripts = [],
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  function startRename(script) {
    setEditingId(script.id)
    setEditValue(script.title || "Sem título")
  }

  function commitRename() {
    if (editingId && editValue.trim()) {
      onRename?.(editingId, editValue.trim())
    }
    setEditingId(null)
  }

  return (
    <div
      className={`h-full bg-zinc-950/90 border-r border-purple-900/50 flex flex-col transition-all duration-200 ${
        collapsed ? "w-12" : "w-64"
      }`}
    >
      {/* header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-purple-900/40">
        {!collapsed && (
          <span className="text-xs uppercase tracking-widest text-purple-300/70 font-semibold">
            Roteiros
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="size-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-purple-900/30 transition-colors"
          title={collapsed ? "Expandir" : "Recolher"}
        >
          {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
        </button>
      </div>

      {/* novo roteiro */}
      <button
        onClick={onCreate}
        className={`flex items-center gap-2 mx-2 mt-3 mb-2 rounded-full border border-purple-900/40 bg-black/60 text-gray-300 hover:border-purple-500 hover:text-white transition-colors ${
          collapsed ? "size-8 justify-center self-center" : "px-3 py-2 text-sm"
        }`}
        title="Novo roteiro"
      >
        <FaPlus size={12} />
        {!collapsed && <span>Novo Roteiro</span>}
      </button>

      {/* lista */}
      <div className="flex-1 overflow-y-auto px-2 pb-3 space-y-1">
        {scripts.length === 0 && !collapsed && (
          <p className="text-xs text-gray-500 px-2 py-4 text-center">
            Nenhum roteiro ainda. Crie o primeiro acima.
          </p>
        )}

        {scripts.map((script) => {
          const isActive = script.id === activeId
          const isEditing = editingId === script.id

          return (
            <div
              key={script.id}
              onClick={() => !isEditing && onSelect?.(script.id)}
              onDoubleClick={() => !collapsed && startRename(script)}
              className={`group flex items-center gap-2 rounded-lg cursor-pointer transition-colors ${
                collapsed ? "justify-center p-2" : "px-2 py-2"
              } ${
                isActive
                  ? "bg-purple-900/40 border border-purple-500/60"
                  : "border border-transparent hover:bg-purple-900/20"
              }`}
              title={script.title || "Sem título"}
            >
              <LiaFileAltSolid
                className={`shrink-0 ${isActive ? "text-purple-300" : "text-gray-500"}`}
                size={16}
              />

              {!collapsed && (
                <>
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename()
                        if (e.key === "Escape") setEditingId(null)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 bg-black/60 text-sm text-white outline-none border border-purple-500/50 rounded px-1.5 py-0.5"
                    />
                  ) : (
                    <span
                      className={`flex-1 truncate text-sm ${
                        isActive ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {script.title || "Sem título"}
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(script.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 size-6 flex items-center justify-center rounded-full text-gray-500 hover:text-red-400 hover:bg-red-950/40 transition-all shrink-0"
                    title="Excluir roteiro"
                  >
                    <FaTrash size={11} />
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}