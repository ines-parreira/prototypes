import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useConfirmationModal } from '../useConfirmationModal'

describe('useConfirmationModal', () => {
    const mockOnSave = jest.fn()
    const mockOnReset = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('initializes with modal hidden', () => {
        const { result } = renderHook(() =>
            useConfirmationModal({
                onSave: mockOnSave,
                onReset: mockOnReset,
            }),
        )

        expect(result.current.isConfirmationModalShown).toBe(false)
    })

    it('shows modal when showConfirmationModal is called', () => {
        const { result } = renderHook(() =>
            useConfirmationModal({
                onSave: mockOnSave,
                onReset: mockOnReset,
            }),
        )

        act(() => {
            result.current.showConfirmationModal()
        })

        expect(result.current.isConfirmationModalShown).toBe(true)
    })

    it('calls onSave and hides modal on successful save', async () => {
        const { result } = renderHook(() =>
            useConfirmationModal({
                onSave: mockOnSave,
                onReset: mockOnReset,
            }),
        )

        act(() => {
            result.current.showConfirmationModal()
        })

        expect(result.current.isConfirmationModalShown).toBe(true)

        await act(async () => {
            await result.current.onConfirmationModalSave()
        })

        expect(mockOnSave).toHaveBeenCalled()
        expect(result.current.isConfirmationModalShown).toBe(false)
    })

    it('calls onReset and hides modal on discard', () => {
        const { result } = renderHook(() =>
            useConfirmationModal({
                onSave: mockOnSave,
                onReset: mockOnReset,
            }),
        )

        act(() => {
            result.current.showConfirmationModal()
        })

        expect(result.current.isConfirmationModalShown).toBe(true)

        act(() => {
            result.current.onConfirmationModalDiscard()
        })

        expect(mockOnReset).toHaveBeenCalled()
        expect(result.current.isConfirmationModalShown).toBe(false)
    })
})
