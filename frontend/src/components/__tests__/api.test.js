import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkHealth, register } from '../../services/api'

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

  it('register melempar error "Service temporarily unavailable" jika gateway mengembalikan status 502/503/504', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ detail: 'Bad Gateway' }),
    })

    await expect(register({ email: 'test@example.com' })).rejects.toThrow('Service temporarily unavailable')
  })
})
