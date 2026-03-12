import type { ShopperData } from '@repo/customer'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import useAppDispatch from 'hooks/useAppDispatch'
import { executeAction } from 'state/infobar/actions'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import { useCreateOrder } from '../useCreateOrder'

jest.mock('state/infobar/actions')
jest.mock('hooks/useAppDispatch')
const executeActionMock = jest.mocked(executeAction)
const useAppDispatchMock = jest.mocked(useAppDispatch)

const testShopperData: ShopperData = {
    id: 789,
    first_name: 'Jane',
    last_name: 'Doe',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    state: 'enabled',
    note: '',
    verified_email: true,
    multipass_identifier: null,
    tax_exempt: false,
    email: 'jane@example.com',
    phone: null,
    currency: 'USD',
    addresses: [],
    tax_exemptions: [],
    admin_graphql_api_id: 'gid://shopify/Customer/789',
    default_address: null,
    tags: '',
    metafields: [],
}

const testIntegrationId = 42

describe('useCreateOrder', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        executeActionMock.mockReturnValue(jest.fn() as any)
    })

    it('should start with modal closed and null data', () => {
        const { result } = renderHook(() => useCreateOrder())

        expect(result.current.isOpen).toBe(false)
        expect(result.current.data).toBeNull()
    })

    it('should open modal and populate data', () => {
        const { result } = renderHook(() => useCreateOrder())

        act(() => {
            result.current.open(testIntegrationId, testShopperData)
        })

        expect(result.current.isOpen).toBe(true)
        expect(result.current.data).toEqual(
            expect.objectContaining({
                integrationId: testIntegrationId,
                customerId: testShopperData.id,
            }),
        )
    })

    it('should accumulate onChange parameter in submit payload', () => {
        const { result } = renderHook(() => useCreateOrder())

        act(() => {
            result.current.open(testIntegrationId, testShopperData)
        })

        act(() => {
            result.current.onChange('order_id', 123)
        })

        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    order_id: 123,
                }),
            }),
        )
    })

    it('should invoke onChange callback', () => {
        const { result } = renderHook(() => useCreateOrder())
        const callback = jest.fn()

        act(() => {
            result.current.open(testIntegrationId, testShopperData)
        })

        act(() => {
            result.current.onChange('order_id', 123, callback)
        })

        expect(callback).toHaveBeenCalled()
    })

    it('should accumulate onBulkChange parameters in submit payload', () => {
        const { result } = renderHook(() => useCreateOrder())

        act(() => {
            result.current.open(testIntegrationId, testShopperData)
        })

        act(() => {
            result.current.onBulkChange([
                { name: 'draft_order_id', value: 'abc' },
                { name: 'payment_pending', value: true },
            ])
        })

        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    draft_order_id: 'abc',
                    payment_pending: true,
                }),
            }),
        )
    })

    it('should invoke onBulkChange callback', () => {
        const { result } = renderHook(() => useCreateOrder())
        const callback = jest.fn()

        act(() => {
            result.current.open(testIntegrationId, testShopperData)
        })

        act(() => {
            result.current.onBulkChange(
                [{ name: 'draft_order_id', value: 'abc' }],
                callback,
            )
        })

        expect(callback).toHaveBeenCalled()
    })

    it('should dispatch executeAction with correct payload on submit', () => {
        const { result } = renderHook(() => useCreateOrder())

        act(() => {
            result.current.open(testIntegrationId, testShopperData)
        })

        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                actionName: ShopifyActionType.CreateOrder,
                integrationId: testIntegrationId,
                payload: expect.objectContaining({
                    customer_id: testShopperData.id,
                }),
            }),
        )
        expect(dispatch).toHaveBeenCalled()
    })

    it('should not dispatch executeAction when data is null', () => {
        const { result } = renderHook(() => useCreateOrder())

        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).not.toHaveBeenCalled()
    })

    it('should reset state after submit', () => {
        const { result } = renderHook(() => useCreateOrder())

        act(() => {
            result.current.open(testIntegrationId, testShopperData)
        })

        act(() => {
            result.current.onSubmit()
        })

        expect(result.current.isOpen).toBe(false)
        expect(result.current.data).toBeNull()
    })

    it('should reset state on close', () => {
        const { result } = renderHook(() => useCreateOrder())

        act(() => {
            result.current.open(testIntegrationId, testShopperData)
        })

        act(() => {
            result.current.onClose()
        })

        expect(result.current.isOpen).toBe(false)
        expect(result.current.data).toBeNull()
    })
})
