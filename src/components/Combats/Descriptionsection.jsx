const textareaClass = `
    w-full
    resize-y
    rounded-lg
    border
    border-zinc-700
    bg-zinc-800
    p-3
    text-sm
    leading-relaxed
    text-zinc-200
    outline-none
    focus:border-violet-500
`;

export default function DescriptionSection({

    monster,

    onDescriptionChange,
    onFearEnigmaChange,

}) {

    return (

        <div className="space-y-6">

            <div>

                <h3 className="mb-2 text-sm uppercase text-zinc-500">
                    Descrição
                </h3>

                <textarea
                    value={monster.description || ""}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder="Descreva a criatura..."
                    rows={6}
                    className={textareaClass}
                />

            </div>

            <div>

                <h3 className="mb-2 text-sm uppercase text-zinc-500">
                    Enigma do Medo
                </h3>

                <textarea
                    value={monster.fearEnigma || ""}
                    onChange={(e) => onFearEnigmaChange(e.target.value)}
                    placeholder="Escreva o enigma do medo..."
                    rows={6}
                    className={textareaClass}
                />

            </div>

        </div>

    );

}