export function PageHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[1001] p-6 pointer-events-none">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-2 brand-gradient-text">
          Freedom Wall
        </h1>
        <p className="muted-text">
          Say what you feel. Click anywhere on the map to post anonymously.
        </p>
      </div>
    </div>
  )
}
