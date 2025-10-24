import { describe, it, expect, beforeEach } from 'vitest';
import { useImageStore } from '@/stores/useImageStore';

describe('useImageStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useImageStore.getState().clearImage();
  });

  it('should have initial empty state', () => {
    const state = useImageStore.getState();
    expect(state.file).toBeNull();
    expect(state.dataUrl).toBeNull();
    expect(state.width).toBe(0);
    expect(state.height).toBe(0);
    expect(state.name).toBe('');
    expect(state.size).toBe(0);
  });

  it('should clear image state', () => {
    const state = useImageStore.getState();

    // Set some dummy state
    useImageStore.setState({
      name: 'test.jpg',
      size: 1024,
      width: 100,
      height: 100,
    });

    // Clear it
    state.clearImage();

    // Check it's cleared
    const newState = useImageStore.getState();
    expect(newState.file).toBeNull();
    expect(newState.name).toBe('');
  });

  it('should validate isValid method', () => {
    const state = useImageStore.getState();

    // Initially invalid (no file)
    expect(state.isValid()).toBe(false);

    // Create a mock file
    const mockFile = new File([''], 'test.png', { type: 'image/png' });

    // Set valid dimensions
    useImageStore.setState({
      file: mockFile,
      width: 500,
      height: 500,
      size: 1024,
    });

    // Should be valid
    expect(useImageStore.getState().isValid()).toBe(true);

    // Set too small dimensions
    useImageStore.setState({
      width: 50,
      height: 50,
    });

    // Should be invalid
    expect(useImageStore.getState().isValid()).toBe(false);
  });

  it('should validate isTooLarge method', () => {
    const state = useImageStore.getState();

    // Initially not too large
    expect(state.isTooLarge()).toBe(false);

    // Set size just under 5MB
    useImageStore.setState({
      size: 5 * 1024 * 1024 - 1,
    });
    expect(useImageStore.getState().isTooLarge()).toBe(false);

    // Set size over 5MB
    useImageStore.setState({
      size: 5 * 1024 * 1024 + 1,
    });
    expect(useImageStore.getState().isTooLarge()).toBe(true);
  });
});
