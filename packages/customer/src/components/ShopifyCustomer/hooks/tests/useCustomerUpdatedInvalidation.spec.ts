import { renderHook } from '@repo/testing/vitest'
import * as reactQuery from '@tanstack/react-query'
import { act } from '@testing-library/react'
import { vi } from 'vitest'

import { queryKeys } from '@gorgias/ecommerce-storage-queries'

import { useCustomerUpdatedInvalidation } from '../useCustomerUpdatedInvalidation'

vi.mock('@tanstack/react-query', async () => {
    const actual = await vi.importActual<typeof reactQuery>(
        '@tanstack/react-query',
    )
    return {
        ...actual,
        useQueryClient: vi.fn(),
    }
})

const invalidateQueries = vi.fn()

beforeEach(() => {
    invalidateQueries.mockClear()
    vi.mocked(reactQuery.useQueryClient).mockReturnValue({
        invalidateQueries,
    } as unknown as reactQuery.QueryClient)
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
        renderHook(() => useCustomerUpdatedInvalidation(42))

        act(() => {
            dispatchCustomerUpdated(42)
        })

        expect(invalidateQueries).toHaveBeenCalledWith({
            queryKey: queryKeys.ecommerceData.all(),
        })
    })

    it('does not invalidate queries when event customerId does not match', () => {
        renderHook(() => useCustomerUpdatedInvalidation(42))

        act(() => {
            dispatchCustomerUpdated(999)
        })

        expect(invalidateQueries).not.toHaveBeenCalled()
    })

    it('does not add event listener when customerId is undefined', () => {
        const addEventSpy = vi.spyOn(window, 'addEventListener')

        renderHook(() => useCustomerUpdatedInvalidation(undefined))

        expect(addEventSpy).not.toHaveBeenCalledWith(
            'customer-updated',
            expect.any(Function),
        )
    })

    it('removes event listener on unmount', () => {
        const removeEventSpy = vi.spyOn(window, 'removeEventListener')

        const { unmount } = renderHook(() => useCustomerUpdatedInvalidation(42))

        unmount()

        expect(removeEventSpy).toHaveBeenCalledWith(
            'customer-updated',
            expect.any(Function),
        )
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
    })
})
