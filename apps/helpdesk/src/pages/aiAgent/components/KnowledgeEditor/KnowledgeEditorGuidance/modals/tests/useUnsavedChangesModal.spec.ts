import { act, renderHook } from '@repo/testing'

import { useGuidanceContext } from '../../context'
import type { GuidanceState } from '../../context/types'
import { useUnsavedChangesModal } from '../useUnsavedChangesModal'

jest.mock('../../context', () => ({
    useGuidanceContext: jest.fn(),
}))

describe('useUnsavedChangesModal', () => {
    const mockDispatch = jest.fn()
    const mockOnClose = jest.fn()

    const defaultState: Partial<GuidanceState> = {
        activeModal: 'unsaved',
    }

    const defaultConfig = {
        onClose: mockOnClose,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useGuidanceContext as jest.Mock).mockReturnValue({
            state: defaultState,
            dispatch: mockDispatch,
            config: defaultConfig,
        })
    })

    describe('isOpen', () => {
        it('should return true when activeModal is unsaved', () => {
            const { result } = renderHook(() => useUnsavedChangesModal())

            expect(result.current.isOpen).toBe(true)
        })

        it('should return false when activeModal is null', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: null },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useUnsavedChangesModal())

            expect(result.current.isOpen).toBe(false)
        })

        it('should return false when activeModal is different', () => {
            ;(useGuidanceContext as jest.Mock).mockReturnValue({
                state: { ...defaultState, activeModal: 'discard' },
                dispatch: mockDispatch,
                config: defaultConfig,
            })

            const { result } = renderHook(() => useUnsavedChangesModal())

            expect(result.current.isOpen).toBe(false)
        })
    })

    describe('onClose', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => useUnsavedChangesModal())

            act(() => {
                result.current.onClose()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })
    })

    describe('onDiscard', () => {
        it('should dispatch CLOSE_MODAL action', () => {
            const { result } = renderHook(() => useUnsavedChangesModal())

            act(() => {
                result.current.onDiscard()
            })

            expect(mockDispatch).toHaveBeenCalledWith({ type: 'CLOSE_MODAL' })
        })

        it('should call config.onClose', () => {
            const { result } = renderHook(() => useUnsavedChangesModal())

            act(() => {
                result.current.onDiscard()
            })

            expect(mockOnClose).toHaveBeenCalled()
        })

        it('should dispatch CLOSE_MODAL before calling config.onClose', () => {
            const callOrder: string[] = []
            mockDispatch.mockImplementation(() => callOrder.push('dispatch'))
            mockOnClose.mockImplementation(() => callOrder.push('onClose'))

            const { result } = renderHook(() => useUnsavedChangesModal())

            act(() => {
                result.current.onDiscard()
            })

            expect(callOrder).toEqual(['dispatch', 'onClose'])
        })
    })

    describe('return value shape', () => {
        it('should return all expected properties', () => {
            const { result } = renderHook(() => useUnsavedChangesModal())

            expect(result.current).toHaveProperty('isOpen')
            expect(result.current).toHaveProperty('onClose')
            expect(result.current).toHaveProperty('onDiscard')
            expect(typeof result.current.isOpen).toBe('boolean')
            expect(typeof result.current.onClose).toBe('function')
            expect(typeof result.current.onDiscard).toBe('function')
        })
    })
})
