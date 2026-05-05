import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkHealth } from '../../services/api'

global.fetch = vi.fn()

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('checkHealth mengembalikan true jika API sehat', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'healthy' }),
    })

    const isHealthy = await checkHealth()
    expect(isHealthy).toBe(true)
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/health'))
  })

  it('checkHealth mengembalikan false jika API down', async () => {
    fetch.mockRejectedValue(new Error('Network Error'))

    const isHealthy = await checkHealth()
    expect(isHealthy).toBe(false)
  })
})
