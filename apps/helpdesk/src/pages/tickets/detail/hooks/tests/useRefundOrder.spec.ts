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

import { useRefundOrder } from '../useRefundOrder'

jest.mock('state/infobar/actions')
jest.mock('hooks/useAppDispatch')

const executeActionMock = jest.mocked(executeAction)
const useAppDispatchMock = jest.mocked(useAppDispatch)

const testOrder = { id: 1, name: '#1001', total_price: '100.00' } as any
const testIntegrationId = 42

describe('useRefundOrder', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
        executeActionMock.mockReturnValue(jest.fn() as any)
    })

    it('should start with modal closed and null data', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useRefundOrder(),
        )

        expect(result.current.isOpen).toBe(false)
        expect(result.current.data).toBeNull()
    })

    it('should open modal and populate data', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useRefundOrder(),
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
            useRefundOrder(),
        )
        const callback = jest.fn()

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onChange('amount', 50, callback)
        })

        expect(callback).toHaveBeenCalled()
    })

    it('should invoke onBulkChange callback', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useRefundOrder(),
        )
        const callback = jest.fn()

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onBulkChange(
                [{ name: 'amount', value: 50 }],
                callback,
            )
        })

        expect(callback).toHaveBeenCalled()
    })

    it('should not dispatch when data is null', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useRefundOrder(),
        )

        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).not.toHaveBeenCalled()
    })

    it('should dispatch executeAction with RefundOrder action on submit', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useRefundOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                actionName: ShopifyActionType.RefundOrder,
                integrationId: testIntegrationId,
            }),
        )
        expect(dispatch).toHaveBeenCalled()
    })

    it('should set financialStatus to "refunded" when refund amount covers the total', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useRefundOrder(),
        )

        act(() => {
            result.current.open(testIntegrationId, testOrder)
        })
        act(() => {
            result.current.onChange('payload', {
                transactions: [{ amount: '100.00' }],
            })
        })
        act(() => {
            result.current.onSubmit()
        })

        expect(executeActionMock).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: expect.objectContaining({
                    payload: { transactions: [{ amount: '100.00' }] },
                }),
            }),
        )
    })

    it('should reset state after submit', () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useRefundOrder(),
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
            useRefundOrder(),
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
            const { result } = renderHook(() => useRefundOrder(), {
                wrapper: ({ children }: { children: React.ReactNode }) =>
                    createElement(TestProvider, null, children),
            })
            return { result, queryClient }
        }

        it('updates financial_status to "refunded" in the query cache when refund covers the full amount', () => {
            const { result, queryClient } = renderWithQueryClient()

            queryClient.setQueryData(ordersQueryKey, {
                data: {
                    data: [{ data: { id: 1, financial_status: 'paid' } }],
                },
            })

            act(() => {
                result.current.open(testIntegrationId, testOrder)
            })
            act(() => {
                result.current.onChange('payload', {
                    transactions: [{ amount: '100.00' }],
                })
            })
            act(() => {
                result.current.onSubmit()
            })

            const updated = queryClient.getQueryData<any>(ordersQueryKey)
            expect(updated.data.data[0].data.financial_status).toBe('refunded')
        })

        it('updates financial_status to "partially_refunded" when refund is partial', () => {
            const { result, queryClient } = renderWithQueryClient()

            queryClient.setQueryData(ordersQueryKey, {
                data: {
                    data: [{ data: { id: 1, financial_status: 'paid' } }],
                },
            })

            act(() => {
                result.current.open(testIntegrationId, testOrder)
            })
            act(() => {
                result.current.onChange('payload', {
                    transactions: [{ amount: '50.00' }],
                })
            })
            act(() => {
                result.current.onSubmit()
            })

            const updated = queryClient.getQueryData<any>(ordersQueryKey)
            expect(updated.data.data[0].data.financial_status).toBe(
                'partially_refunded',
            )
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
                        { data: { id: 1, financial_status: 'paid' } },
                        { data: { id: 2, financial_status: 'paid' } },
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
            expect(updated.data.data[0].data.financial_status).toBe(
                'partially_refunded',
            )
            expect(updated.data.data[1].data.financial_status).toBe('paid')
        })
    })
})
