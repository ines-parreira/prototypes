import { createElement } from 'react'

import { act, renderHook } from '@repo/testing'

import {
    ObjectType,
    queryKeys,
    SourceType,
} from '@gorgias/ecommerce-storage-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { executeAction } from 'state/infobar/actions'
import {
    mockQueryClientProvider,
    renderHookWithQueryClientProvider,
} from 'tests/reactQueryTestingUtils'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

import { useCancelOrder } from '../useCancelOrder'

jest.mock('state/infobar/actions')
jest.mock('hooks/useAppDispatch')

const executeActionMock = jest.mocked(executeAction)
const useAppDispatchMock = jest.mocked(useAppDispatch)

const testOrder = { id: 1, name: '#1001' } as any
const testIntegrationId = 42

describe('useCancelOrder', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        executeActionMock.mockReturnValue(jest.fn() as any)
    })

    it('should start with modal closed and null data', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useCancelOrder(),
        )

        expect(result.current.isOpen).toBe(false)
        expect(result.current.data).toBeNull()
    })

    it('should open modal and populate data', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useCancelOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })

        expect(result.current.isOpen).toBe(true)
        expect(result.current.data).toEqual(
            expect.objectContaining({ integrationId: testIntegrationId }),
        )
    })

    it('should invoke onChange callback', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useCancelOrder(),
        )
        const callback = jest.fn()

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onChange('reason', 'customer', callback)
        })

        expect(callback).toHaveBeenCalled()
    })

    it('should invoke onBulkChange callback', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useCancelOrder(),
        )
        const callback = jest.fn()

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onBulkChange(
                [{ name: 'reason', value: 'customer' }],
                callback,
            )
        })

        expect(callback).toHaveBeenCalled()
    })

    it('should not dispatch when data is null', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useCancelOrder(),
        )

        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).not.toHaveBeenCalled()
    })

    it('should dispatch executeAction with CancelOrder action on submit', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useCancelOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                actionName: ShopifyActionType.CancelOrder,
                integrationId: testIntegrationId,
            }),
        )
        expect(dispatch).toHaveBeenCalled()
    })

    it('should accumulate onChange parameters in submit payload', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useCancelOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onChange('reason', 'customer')
        })
        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({ reason: 'customer' }),
            }),
        )
    })

    it('should reset state after submit', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useCancelOrder(),
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
            useCancelOrder(),
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

    describe('cache update on submit', () => {
        const ordersQueryKey = queryKeys.ecommerceData.listEcommerceData(
            ObjectType.Order,
            SourceType.Shopify,
        )

        function renderWithQueryClient() {
            const { QueryClientProvider: TestProvider, queryClient } =
                mockQueryClientProvider()
            const { result } = renderHook(() => useCancelOrder(), {
                wrapper: ({ children }: { children: React.ReactNode }) =>
                    createElement(TestProvider, null, children),
            })
            return { result, queryClient }
        }

        it('sets cancelled_at on the matching order in the query cache', () => {
            const { result, queryClient } = renderWithQueryClient()

            queryClient.setQueryData(ordersQueryKey, {
                data: {
                    data: [{ data: { id: 1, cancelled_at: null } }],
                },
            })

            act(() => {
                result.current.open(testIntegrationId, testOrder)
            })
            act(() => {
                result.current.onSubmit()
            })

            const updated = queryClient.getQueryData<any>(ordersQueryKey)
            expect(updated.data.data[0].data.cancelled_at).not.toBeNull()
        })

        it('does not modify cache when cached data has no data array', () => {
            const { result, queryClient } = renderWithQueryClient()

            queryClient.setQueryData(ordersQueryKey, { data: {} })

            act(() => {
                result.current.open(testIntegrationId, testOrder)
            })
            act(() => {
                result.current.onSubmit()
            })

            const updated = queryClient.getQueryData<any>(ordersQueryKey)
            expect(updated).toEqual({ data: {} })
        })

        it('only updates the matching order and leaves others unchanged', () => {
            const { result, queryClient } = renderWithQueryClient()

            queryClient.setQueryData(ordersQueryKey, {
                data: {
                    data: [
                        { data: { id: 1, cancelled_at: null } },
                        { data: { id: 2, cancelled_at: null } },
                    ],
                },
            })

            act(() => {
                result.current.open(testIntegrationId, testOrder)
            })
            act(() => {
                result.current.onSubmit()
            })

            const updated = queryClient.getQueryData<any>(ordersQueryKey)
            expect(updated.data.data[0].data.cancelled_at).not.toBeNull()
            expect(updated.data.data[1].data.cancelled_at).toBeNull()
        })
    })
})
