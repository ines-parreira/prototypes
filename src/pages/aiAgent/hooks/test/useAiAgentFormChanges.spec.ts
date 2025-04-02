import { act, renderHook } from '@testing-library/react-hooks'

import { useAiAgentFormChanges } from '../useAiAgentFormChanges'

describe('useAiAgentFormChanges', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useAiAgentFormChanges())

        expect(result.current.isFormDirty).toBe(false)
        expect(result.current.dirtySections).toEqual([])
    })

    it('should update form dirty state for a section', () => {
        const { result } = renderHook(() => useAiAgentFormChanges())

        act(() => {
            result.current.setIsFormDirty('section-1', true)
        })

        expect(result.current.isFormDirty).toBe(true)
        expect(result.current.dirtySections).toEqual(['section-1'])
    })

    it('should handle multiple dirty sections', () => {
        const { result } = renderHook(() => useAiAgentFormChanges())

        act(() => {
            result.current.setIsFormDirty('section-1', true)
            result.current.setIsFormDirty('section-2', true)
        })

        expect(result.current.isFormDirty).toBe(true)
        expect(result.current.dirtySections).toEqual(['section-1', 'section-2'])
    })

    it('should update action callback for a section', () => {
        const { result } = renderHook(() => useAiAgentFormChanges())
        const mockCallback = {
            onSave: jest.fn(),
            onDiscard: jest.fn(),
        }

        act(() => {
            result.current.setActionCallback('section-1', mockCallback)
        })

        act(() => {
            result.current.setIsFormDirty('section-1', true)
        })

        act(() => {
            result.current.onModalSave()
        })

        expect(mockCallback.onSave).toHaveBeenCalled()
    })

    it('should handle onModalSave for multiple sections', () => {
        const { result } = renderHook(() => useAiAgentFormChanges())
        const mockCallback1 = {
            onSave: jest.fn(),
            onDiscard: jest.fn(),
        }
        const mockCallback2 = {
            onSave: jest.fn(),
            onDiscard: jest.fn(),
        }

        act(() => {
            result.current.setActionCallback('section-1', mockCallback1)
            result.current.setActionCallback('section-2', mockCallback2)
            result.current.setIsFormDirty('section-1', true)
            result.current.setIsFormDirty('section-2', true)
        })

        act(() => {
            result.current.onModalSave()
        })

        expect(mockCallback1.onSave).toHaveBeenCalled()
        expect(mockCallback2.onSave).toHaveBeenCalled()
    })

    it('should handle onModalDiscard for multiple sections', () => {
        const { result } = renderHook(() => useAiAgentFormChanges())
        const mockCallback1 = {
            onSave: jest.fn(),
            onDiscard: jest.fn(),
        }
        const mockCallback2 = {
            onSave: jest.fn(),
            onDiscard: jest.fn(),
        }

        act(() => {
            result.current.setActionCallback('section-1', mockCallback1)
            result.current.setActionCallback('section-2', mockCallback2)
            result.current.setIsFormDirty('section-1', true)
            result.current.setIsFormDirty('section-2', true)
        })

        act(() => {
            result.current.onModalDiscard()
        })

        expect(mockCallback1.onDiscard).toHaveBeenCalled()
        expect(mockCallback2.onDiscard).toHaveBeenCalled()
    })

    it('should handle undefined callbacks gracefully', () => {
        const { result } = renderHook(() => useAiAgentFormChanges())

        act(() => {
            result.current.setIsFormDirty('section-1', true)
        })

        expect(() => {
            result.current.onModalSave()
            result.current.onModalDiscard()
        }).not.toThrow()
    })

    it('should reset dirty state when section becomes clean', () => {
        const { result } = renderHook(() => useAiAgentFormChanges())

        act(() => {
            result.current.setIsFormDirty('section-1', true)
        })

        expect(result.current.isFormDirty).toBe(true)

        act(() => {
            result.current.setIsFormDirty('section-1', false)
        })

        expect(result.current.isFormDirty).toBe(false)
        expect(result.current.dirtySections).toEqual([])
    })

    it('should maintain form dirty state if any section is dirty', () => {
        const { result } = renderHook(() => useAiAgentFormChanges())

        act(() => {
            result.current.setIsFormDirty('section-1', true)
            result.current.setIsFormDirty('section-2', true)
        })

        act(() => {
            result.current.setIsFormDirty('section-1', false)
        })

        expect(result.current.isFormDirty).toBe(true)
        expect(result.current.dirtySections).toEqual(['section-2'])
    })

    it('should handle partial callbacks (only onSave or onDiscard)', () => {
        const { result } = renderHook(() => useAiAgentFormChanges())
        const mockCallbackOnlySave = {
            onSave: jest.fn(),
        }
        const mockCallbackOnlyDiscard = {
            onDiscard: jest.fn(),
        }

        act(() => {
            result.current.setActionCallback('section-1', mockCallbackOnlySave)
            result.current.setActionCallback(
                'section-2',
                mockCallbackOnlyDiscard,
            )
            result.current.setIsFormDirty('section-1', true)
            result.current.setIsFormDirty('section-2', true)
        })

        act(() => {
            result.current.onModalSave()
            result.current.onModalDiscard()
        })

        expect(mockCallbackOnlySave.onSave).toHaveBeenCalled()
        expect(mockCallbackOnlyDiscard.onDiscard).toHaveBeenCalled()
    })
})
