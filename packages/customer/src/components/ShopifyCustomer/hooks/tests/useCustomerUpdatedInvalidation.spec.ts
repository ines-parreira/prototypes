import { act } from '@testing-library/react'
import { vi } from 'vitest'

import { queryKeys } from '@gorgias/ecommerce-storage-queries'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import { useCustomerUpdatedInvalidation } from '../useCustomerUpdatedInvalidation'

afterEach(() => {
    testAppQueryClient.clear()
})

function dispatchCustomerUpdated(customerId: number) {
    window.dispatchEvent(
        new CustomEvent('customer-updated', {
            detail: { customerId },
        }),
    )
}

describe('useCustomerUpdatedInvalidation', () => {
    it('invalidates ecommerce data queries when matching customer-updated event is dispatched', async () => {
        const invalidateSpy = vi.spyOn(testAppQueryClient, 'invalidateQueries')

        renderHook(() => useCustomerUpdatedInvalidation(42))

        act(() => {
            dispatchCustomerUpdated(42)
        })

        expect(invalidateSpy).toHaveBeenCalledWith({
            queryKey: queryKeys.ecommerceData.all(),
        })

        invalidateSpy.mockRestore()
    })

    it('does not invalidate queries when event customerId does not match', () => {
        const invalidateSpy = vi.spyOn(testAppQueryClient, 'invalidateQueries')

        renderHook(() => useCustomerUpdatedInvalidation(42))

        act(() => {
            dispatchCustomerUpdated(999)
        })

        expect(invalidateSpy).not.toHaveBeenCalled()

        invalidateSpy.mockRestore()
    })

    it('does not add event listener when customerId is undefined', () => {
        const addEventSpy = vi.spyOn(window, 'addEventListener')

        renderHook(() => useCustomerUpdatedInvalidation(undefined))

        expect(addEventSpy).not.toHaveBeenCalledWith(
            'customer-updated',
            expect.any(Function),
        )

        addEventSpy.mockRestore()
    })

    it('removes event listener on unmount', () => {
        const removeEventSpy = vi.spyOn(window, 'removeEventListener')

        const { unmount } = renderHook(() => useCustomerUpdatedInvalidation(42))

        unmount()

        expect(removeEventSpy).toHaveBeenCalledWith(
            'customer-updated',
            expect.any(Function),
        )

        removeEventSpy.mockRestore()
    })

    it('re-registers listener when customerId changes', () => {
        const addEventSpy = vi.spyOn(window, 'addEventListener')
        const removeEventSpy = vi.spyOn(window, 'removeEventListener')

        const { rerender } = renderHook(
            ({ customerId }) => useCustomerUpdatedInvalidation(customerId),
            { initialProps: { customerId: 42 as number | undefined } },
        )

        addEventSpy.mockClear()
        removeEventSpy.mockClear()

        rerender({ customerId: 100 })

        expect(removeEventSpy).toHaveBeenCalledWith(
            'customer-updated',
            expect.any(Function),
        )
        expect(addEventSpy).toHaveBeenCalledWith(
            'customer-updated',
            expect.any(Function),
        )

        addEventSpy.mockRestore()
        removeEventSpy.mockRestore()
    })
})
