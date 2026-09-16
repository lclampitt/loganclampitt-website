import { useEffect, useState } from 'react'

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SCRAMBLE_FRAMES = 12

export default function ScrambleText({ text, play, delay }) {
  const [shown, setShown] = useState(text)

  useEffect(() => {
    if (!play) return undefined
    let interval = 0
    const timeout = window.setTimeout(() => {
      let frame = 0
      interval = window.setInterval(() => {
        frame += 1
        const settled = Math.floor((frame / SCRAMBLE_FRAMES) * text.length)
        setShown(
          [...text]
            .map((char, i) => (i < settled || !/[A-Za-z0-9]/.test(char)
              ? char
              : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]))
            .join(''),
        )
        if (frame >= SCRAMBLE_FRAMES) {
          window.clearInterval(interval)
          setShown(text)
        }
      }, 40)
    }, delay)
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [delay, play, text])

  return <span aria-hidden="true">{shown}</span>
}
