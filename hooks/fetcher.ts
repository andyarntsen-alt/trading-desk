// Base fetcher for SWR
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url)
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.')
    const data = await res.json().catch(() => ({}))
    ;(error as Error & { info?: unknown; status?: number }).info = data
    ;(error as Error & { info?: unknown; status?: number }).status = res.status
    throw error
  }
  
  return res.json()
}

// Mutation helper for POST/PUT/DELETE requests
export async function mutationFetcher<T, D = unknown>(
  url: string,
  options: {
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    body?: D
  }
): Promise<T> {
  const res = await fetch(url, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  
  if (!res.ok) {
    const error = new Error('An error occurred while mutating the data.')
    const data = await res.json().catch(() => ({}))
    ;(error as Error & { info?: unknown; status?: number }).info = data
    ;(error as Error & { info?: unknown; status?: number }).status = res.status
    throw error
  }
  
  return res.json()
}
