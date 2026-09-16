export default function DotPortrait() {
  return (
    <div className="absolute top-0 right-0 w-[260px] h-[320px] md:w-[300px] md:h-[370px] pointer-events-none">
      <iframe
        src="/dot-portrait.html"
        title="Dot portrait"
        className="dot-portrait w-full h-full border-0 pointer-events-auto"
        style={{ background: 'transparent', colorScheme: 'light' }}
      />
    </div>
  )
}
