export default function CombatSheet({
  combat
}) {

  console.log(combat);

  if (!combat) return null;

  return (
    <div
      className="
        fixed
        inset-0
        bg-black/70
        flex
        items-center
        justify-center
        "
    >

      <div
        className="
            bg-zinc-900
            rounded-xl
            p-8
            border
            border-zinc-700
            "
      >

        <h1 className="text-3xl text-white">

          {combat.name}

        </h1>

      </div>

    </div>

  );

}