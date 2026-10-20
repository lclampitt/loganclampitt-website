// Read at most `max` bytes of a request body; anything longer is refused
// (null) without reading on. Used by every api/ handler that takes a body.
export async function readCapped(request, max) {
  const declared = Number(request.headers.get('content-length'))
  if (declared > max) return null
  if (!request.body) return ''
  const reader = request.body.getReader()
  const chunks = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > max) {
      await reader.cancel()
      return null
    }
    chunks.push(value)
  }
  return new TextDecoder().decode(Buffer.concat(chunks))
}
