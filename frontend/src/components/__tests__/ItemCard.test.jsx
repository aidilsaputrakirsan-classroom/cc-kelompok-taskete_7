import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ItemCard from '../ItemCard'

const mockItem = {
  id: 1,
  name: 'Laptop ASUS',
  description: 'Laptop kerja',
  price: 15000000,
  quantity: 5,
  created_at: "2024-05-01T10:00:00Z"
}

describe('ItemCard Component', () => {
  it('menampilkan nama dan stok item', () => {
    render(<ItemCard item={mockItem} />)
    expect(screen.getByText('Laptop ASUS')).toBeInTheDocument()
    expect(screen.getByText(/Stok: 5/i)).toBeInTheDocument()
  })

  it('memanggil onEdit saat tombol edit diklik', () => {
    const handleEdit = vi.fn()
    render(<ItemCard item={mockItem} onEdit={handleEdit} />)
    
    const editButton = screen.getByText(/Edit/i)
    fireEvent.click(editButton)
    expect(handleEdit).toHaveBeenCalledWith(mockItem)
  })

  it('memanggil onDelete saat tombol hapus diklik', () => {
    const handleDelete = vi.fn()
    render(<ItemCard item={mockItem} onDelete={handleDelete} />)
    
    const deleteButton = screen.getByText(/Hapus/i)
    fireEvent.click(deleteButton)
    expect(handleDelete).toHaveBeenCalledWith(mockItem.id)
  })
})
