import { act } from '@repo/testing'

import useAppDispatch from 'hooks/useAppDispatch'
import { executeAction } from 'state/infobar/actions'
import { renderHookWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import { useEditOrder } from '../useEditOrder'

jest.mock('state/infobar/actions')
jest.mock('hooks/useAppDispatch')

const executeActionMock = jest.mocked(executeAction)
const useAppDispatchMock = jest.mocked(useAppDispatch)

const testOrder = {
    id: 1,
    name: '#1001',
    currency: 'USD',
    customer: {
        id: 99,
        admin_graphql_api_id: 'gid://shopify/Customer/99',
        email: 'customer@test.com',
    },
} as any
const testIntegrationId = 42

describe('useEditOrder', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        executeActionMock.mockReturnValue(jest.fn() as any)
    })

    it('should start with modal closed and null data', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useEditOrder(),
        )

        expect(result.current.isOpen).toBe(false)
        expect(result.current.data).toBeNull()
    })

    it('should open modal and populate data with immutable order and customer', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useEditOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })

        expect(result.current.isOpen).toBe(true)
        expect(result.current.data).toMatchObject({
            integrationId: testIntegrationId,
            orderId: 1,
        })
        expect(result.current.data?.orderImmutable.get('name')).toBe('#1001')
        expect(result.current.data?.customerImmutable.get('email')).toBe(
            'customer@test.com',
        )
        expect(result.current.data?.customerImmutable.get('currency')).toBe(
            'USD',
        )
    })

    it('should invoke onChange callback', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useEditOrder(),
        )
        const callback = jest.fn()

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onChange('note', 'test note', callback)
        })

        expect(callback).toHaveBeenCalled()
    })

    it('should invoke onBulkChange callback', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useEditOrder(),
        )
        const callback = jest.fn()

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onBulkChange(
                [{ name: 'note', value: 'test note' }],
                callback,
            )
        })

        expect(callback).toHaveBeenCalled()
    })

    it('should not dispatch when data is null', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useEditOrder(),
        )

        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).not.toHaveBeenCalled()
    })

    it('should dispatch executeAction with EditOrder action on submit', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useEditOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                actionName: ShopifyActionType.EditOrder,
                integrationId: testIntegrationId,
            }),
        )
        expect(dispatch).toHaveBeenCalled()
    })

    it('should include order_id in submit payload', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useEditOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({ order_id: 1 }),
            }),
        )
    })

    it('should accumulate onChange parameters in submit payload', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useEditOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onChange('note', 'test note')
        })
        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({ note: 'test note' }),
            }),
        )
    })

    it('should reset state after submit', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useEditOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onSubmit()
        })

        expect(result.current.isOpen).toBe(false)
        expect(result.current.data).toBeNull()
    })

    it('should reset state on close', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useEditOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onClose()
        })

        expect(result.current.isOpen).toBe(false)
        expect(result.current.data).toBeNull()
    })
})
