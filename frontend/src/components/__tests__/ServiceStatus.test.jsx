import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceStatusProvider, useServiceStatus } from '../../context/ServiceStatusContext';
import ServiceUnavailablePage from '../../pages/ServiceUnavailablePage';
import DegradedBanner from '../shared/DegradedBanner';
import { systemAPI } from '../../api';

// Mock unit API layer agar terisolasi
vi.mock('../../api', () => ({
  systemAPI: {
    health: vi.fn(),
  },
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

// Helper component untuk mendeteksi perubahan state context
function TestComponent() {
  const { isUnavailable, isDegraded, triggerMockUnavailable, triggerMockDegraded, resetStatus } = useServiceStatus();
  return (
    <div>
      <div data-testid="unavailable-state">{isUnavailable ? 'YES' : 'NO'}</div>
      <div data-testid="degraded-state">{isDegraded ? 'YES' : 'NO'}</div>
      <button onClick={triggerMockUnavailable} data-testid="btn-trigger-unavailable">Trigger Unavailable</button>
      <button onClick={triggerMockDegraded} data-testid="btn-trigger-degraded">Trigger Degraded</button>
      <button onClick={resetStatus} data-testid="btn-reset">Reset</button>
    </div>
  );
}

describe('ServiceStatus Integration & Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ServiceStatusProvider mengelola status offline & degraded secara default', () => {
    render(
      <ServiceStatusProvider>
        <TestComponent />
      </ServiceStatusProvider>
    );

    expect(screen.getByTestId('unavailable-state')).toHaveTextContent('NO');
    expect(screen.getByTestId('degraded-state')).toHaveTextContent('NO');
  });

  it('ServiceStatusProvider menangani mock triggers dengan benar', () => {
    render(
      <ServiceStatusProvider>
        <TestComponent />
      </ServiceStatusProvider>
    );

    fireEvent.click(screen.getByTestId('btn-trigger-unavailable'));
    expect(screen.getByTestId('unavailable-state')).toHaveTextContent('YES');
    expect(screen.getByTestId('degraded-state')).toHaveTextContent('NO');

    fireEvent.click(screen.getByTestId('btn-trigger-degraded'));
    expect(screen.getByTestId('unavailable-state')).toHaveTextContent('NO');
    expect(screen.getByTestId('degraded-state')).toHaveTextContent('YES');

    fireEvent.click(screen.getByTestId('btn-reset'));
    expect(screen.getByTestId('unavailable-state')).toHaveTextContent('NO');
    expect(screen.getByTestId('degraded-state')).toHaveTextContent('NO');
  });

  it('ServiceStatusProvider mendengarkan Custom Events dari API layer', () => {
    render(
      <ServiceStatusProvider>
        <TestComponent />
      </ServiceStatusProvider>
    );

    // Kirim event offline
    act(() => {
      window.dispatchEvent(new CustomEvent('api-service-unavailable'));
    });
    expect(screen.getByTestId('unavailable-state')).toHaveTextContent('YES');

    // Kirim event degraded
    act(() => {
      window.dispatchEvent(new CustomEvent('api-service-degraded', {
        detail: { dependencies: { auth_service: 'healthy', database: 'unhealthy' } }
      }));
    });
    expect(screen.getByTestId('unavailable-state')).toHaveTextContent('NO');
    expect(screen.getByTestId('degraded-state')).toHaveTextContent('YES');

    // Kirim event healthy kembali
    act(() => {
      window.dispatchEvent(new CustomEvent('api-service-healthy'));
    });
    expect(screen.getByTestId('unavailable-state')).toHaveTextContent('NO');
    expect(screen.getByTestId('degraded-state')).toHaveTextContent('NO');
  });

  it('ServiceUnavailablePage menampilkan info offline & countdown', () => {
    render(
      <ServiceStatusProvider>
        <ServiceUnavailablePage />
      </ServiceStatusProvider>
    );

    expect(screen.getByText(/Layanan Tidak Tersedia/i)).toBeInTheDocument();
    expect(screen.getByText(/Mencoba menghubungkan kembali otomatis dalam/i)).toBeInTheDocument();
  });

  it('DegradedBanner menampilkan dependensi yang bermasalah', () => {
    render(
      <ServiceStatusProvider>
        <div>
          <DegradedBanner />
          <TestComponent />
        </div>
      </ServiceStatusProvider>
    );

    // Awalnya tersembunyi
    expect(screen.queryByText(/Sistem Berjalan dalam Mode Terbatas/i)).not.toBeInTheDocument();

    // Memicu degraded mode
    fireEvent.click(screen.getByTestId('btn-trigger-degraded'));

    // Sekarang terlihat
    expect(screen.getByText(/Sistem Berjalan dalam Mode Terbatas/i)).toBeInTheDocument();
    expect(screen.getByText(/DATABASE/i)).toBeInTheDocument();
  });
});
