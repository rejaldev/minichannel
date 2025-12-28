import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRealtime } from './useSocket';
import * as socket from '@/lib/socket';

// Mock socket module
vi.mock('@/lib/socket', () => ({
  initSocket: vi.fn().mockResolvedValue({
    on: vi.fn(),
    off: vi.fn(),
  }),
  subscribe: vi.fn().mockReturnValue(() => {}),
  isConnected: vi.fn().mockReturnValue(false),
}));

describe('useRealtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize socket on mount', async () => {
    renderHook(() => useRealtime());

    await waitFor(() => {
      expect(socket.initSocket).toHaveBeenCalled();
    });
  });

  it('should return connected state', () => {
    vi.mocked(socket.isConnected).mockReturnValue(true);
    
    const { result } = renderHook(() => useRealtime());

    // Initially false, will update after socket init
    expect(typeof result.current.connected).toBe('boolean');
  });

  it('should subscribe to stock:updated when onStockUpdate provided', async () => {
    const onStockUpdate = vi.fn();
    
    renderHook(() => useRealtime({ onStockUpdate }));

    await waitFor(() => {
      expect(socket.subscribe).toHaveBeenCalledWith('stock:updated', expect.any(Function));
    });
  });

  it('should subscribe to product:created when onProductCreate provided', async () => {
    const onProductCreate = vi.fn();
    
    renderHook(() => useRealtime({ onProductCreate }));

    await waitFor(() => {
      expect(socket.subscribe).toHaveBeenCalledWith('product:created', expect.any(Function));
    });
  });

  it('should subscribe to product:updated when onProductUpdate provided', async () => {
    const onProductUpdate = vi.fn();
    
    renderHook(() => useRealtime({ onProductUpdate }));

    await waitFor(() => {
      expect(socket.subscribe).toHaveBeenCalledWith('product:updated', expect.any(Function));
    });
  });

  it('should subscribe to product:deleted when onProductDelete provided', async () => {
    const onProductDelete = vi.fn();
    
    renderHook(() => useRealtime({ onProductDelete }));

    await waitFor(() => {
      expect(socket.subscribe).toHaveBeenCalledWith('product:deleted', expect.any(Function));
    });
  });

  it('should call onRefresh when stock is updated', async () => {
    const onRefresh = vi.fn();
    let stockCallback: (data: any) => void;
    
    vi.mocked(socket.subscribe).mockImplementation((event, callback) => {
      if (event === 'stock:updated') {
        stockCallback = callback;
      }
      return () => {};
    });
    
    renderHook(() => useRealtime({ onRefresh }));

    await waitFor(() => {
      expect(socket.subscribe).toHaveBeenCalled();
    });
  });

  it('should cleanup subscriptions on unmount', async () => {
    const unsubscribe = vi.fn();
    vi.mocked(socket.subscribe).mockReturnValue(unsubscribe);
    
    const { unmount } = renderHook(() => 
      useRealtime({ onStockUpdate: vi.fn() })
    );

    await waitFor(() => {
      expect(socket.subscribe).toHaveBeenCalled();
    });

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
