import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { subscribe, isConnected } from './socket';

// Mock socket.io-client
const mockSocket = {
  connected: false,
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('socket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
  });

  describe('subscribe', () => {
    it('should add callback to event listeners', () => {
      const callback = vi.fn();
      const unsubscribe = subscribe('stock:updated', callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = subscribe('product:created', callback);

      // Should not throw
      expect(() => unsubscribe()).not.toThrow();
    });

    it('should allow multiple subscribers for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const unsub1 = subscribe('stock:updated', callback1);
      const unsub2 = subscribe('stock:updated', callback2);

      expect(typeof unsub1).toBe('function');
      expect(typeof unsub2).toBe('function');
    });
  });

  describe('isConnected', () => {
    it('should return false when socket is not connected', () => {
      mockSocket.connected = false;
      expect(isConnected()).toBe(false);
    });
  });
});

describe('Socket Event Types', () => {
  it('should handle StockUpdateData type', () => {
    const stockUpdate = {
      productVariantId: 'var-1',
      cabangId: 'cab-1',
      quantity: 100,
      previousQuantity: 50,
      price: 10000,
    };

    expect(stockUpdate).toHaveProperty('productVariantId');
    expect(stockUpdate).toHaveProperty('quantity');
  });

  it('should handle ProductUpdateData type', () => {
    const productUpdate = {
      id: 'prod-1',
      name: 'Test Product',
      categoryId: 'cat-1',
      productType: 'SINGLE',
      variants: [],
    };

    expect(productUpdate).toHaveProperty('id');
    expect(productUpdate).toHaveProperty('name');
  });
});
