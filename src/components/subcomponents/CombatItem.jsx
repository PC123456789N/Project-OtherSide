export default function CombatItem({ name }) {
  return (
    <>
      <div className="w-40 h-40 bg-gray-900 flex justify-center items-center">
        <p>{name}</p>
      </div>
    </>
  )
}