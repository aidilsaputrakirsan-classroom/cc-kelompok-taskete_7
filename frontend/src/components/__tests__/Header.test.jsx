import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Header from '../Header'

describe('Header Component', () => {
  it('menampilkan judul aplikasi Cloud App', () => {
    render(<Header totalItems={0} isConnected={true} />)
    expect(screen.getByText(/Cloud App/i)).toBeInTheDocument()
  })

  it('menampilkan badge jumlah total items', () => {
    render(<Header totalItems={12} isConnected={true} />)
    expect(screen.getByText(/12 items/i)).toBeInTheDocument()
  })

  it('menampilkan status koneksi "Connected" saat isConnected true', () => {
    render(<Header totalItems={0} isConnected={true} />)
    expect(screen.getByText(/Connected/i)).toBeInTheDocument()
  })
})
