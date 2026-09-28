export default function Pendiente({
  titulo,
  descripcion,
  fase,
}: {
  titulo: string
  descripcion: string
  fase: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center">
      <p className="text-xs font-semibold tracking-widest text-marca uppercase">{fase}</p>
      <h2 className="mt-2 text-base font-semibold text-zinc-900">{titulo}</h2>
      <p className="mx-auto mt-1 max-w-xs text-sm text-zinc-500">{descripcion}</p>
    </div>
  )
}
