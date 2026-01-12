export default function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>✅ Det fungerer!</h1>
      <p>Hvis du ser denne siden, fungerer Vercel-deploymenten.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
    </div>
  )
}
