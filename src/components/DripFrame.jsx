import { useIntro } from '../context/useIntro'

export default function DripFrame() {
  const { contentReady } = useIntro()

  return (
    <div
      className={`drip-frame${contentReady ? ' drip-frame--on' : ''}`}
      aria-hidden="true"
    >
      <div className="drip-frame__band drip-frame__band--top" />
      <div className="drip-frame__band drip-frame__band--bottom" />
    </div>
  )
}
