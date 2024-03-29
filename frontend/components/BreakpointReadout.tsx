import clsx from 'clsx'

export default function BreakpointReadout({ className }: { className?: string }) {
  return (
    <div className={clsx('rounded border border-yellow-500 bg-yellow-300 px-3 py-1 text-gray-800', className)}>
      <div className="inline sm:hidden">xs</div>
      <div className="hidden sm:inline md:hidden">sm</div>
      <div className="hidden md:inline lg:hidden">md</div>
      <div className="hidden lg:inline xl:hidden">lg</div>
      <div className="hidden xl:inline 2xl:hidden">xl</div>
      <div className="hidden 2xl:inline">2xl</div>
    </div>
  )
}
