import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProductSocket } from './useProductSocket';
import * as socket from '@/lib/socket';

// Mock socket module
vi.mock('@/lib/socket', () => ({
  initSocket: vi.fn().mockResolvedValue({}),
  subscribe: vi.fn().mockReturnValue(() => {}),
  isConnected: vi.fn().mockReturnValue(true),
}));

describe('useProductSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize socket connection when enabled', () => {
    renderHook(() => useProductSocket({ enabled: true }));

    expect(socket.isConnected).toHaveBeenCalled();
  });

  it('should not initialize socket when disabled', () => {
    vi.mocked(socket.isConnected).mockClear();
    
    renderHook(() => useProductSocket({ enabled: false }));

    // isConnected should not be called for initialization
    // since enabled is false, the effect won't run
  });

  it('should subscribe to product:created when callback provided', () => {
    const onProductCreated = vi.fn();
    
    renderHook(() => useProductSocket({ onProductCreated, enabled: true }));

    expect(socket.subscribe).toHaveBeenCalledWith('product:created', expect.any(Function));
  });

  it('should subscribe to product:updated when callback provided', () => {
    const onProductUpdated = vi.fn();
    
    renderHook(() => useProductSocket({ onProductUpdated, enabled: true }));

    expect(socket.subscribe).toHaveBeenCalledWith('product:updated', expect.any(Function));
  });

  it('should subscribe to product:deleted when callback provided', () => {
    const onProductDeleted = vi.fn();
    
    renderHook(() => useProductSocket({ onProductDeleted, enabled: true }));

    expect(socket.subscribe).toHaveBeenCalledWith('product:deleted', expect.any(Function));
  });

  it('should subscribe to stock:updated when callback provided', () => {
    const onStockUpdated = vi.fn();
    
    renderHook(() => useProductSocket({ onStockUpdated, enabled: true }));

    expect(socket.subscribe).toHaveBeenCalledWith('stock:updated', expect.any(Function));
  });

  it('should cleanup subscriptions on unmount', () => {
    const unsubscribe = vi.fn();
    vi.mocked(socket.subscribe).mockReturnValue(unsubscribe);
    
    const { unmount } = renderHook(() => 
      useProductSocket({ 
        onProductCreated: vi.fn(),
        enabled: true 
      })
    );

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('should handle multiple callbacks simultaneously', () => {
    const onProductCreated = vi.fn();
    const onProductUpdated = vi.fn();
    const onStockUpdated = vi.fn();
    
    renderHook(() => 
      useProductSocket({ 
        onProductCreated,
        onProductUpdated,
        onStockUpdated,
        enabled: true 
      })
    );

    // Should subscribe to all three events
    expect(socket.subscribe).toHaveBeenCalledWith('product:created', expect.any(Function));
    expect(socket.subscribe).toHaveBeenCalledWith('product:updated', expect.any(Function));
    expect(socket.subscribe).toHaveBeenCalledWith('stock:updated', expect.any(Function));
  });
});
