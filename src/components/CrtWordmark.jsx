export default function CrtWordmark({ text = '', caret = false, className = '' }) {
  return (
    <span className={`crt-wordmark ${className}`.trim()}>
      <span className="crt-wordmark-text">{text}</span>
      {caret ? <span className="intro-caret" aria-hidden="true" /> : null}
    </span>
  )
}
