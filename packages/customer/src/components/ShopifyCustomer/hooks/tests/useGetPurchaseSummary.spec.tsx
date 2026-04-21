import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockEcommerceData,
    mockGetEcommerceDataByExternalIdHandler,
} from '@gorgias/ecommerce-storage-mocks'

import { server } from '../../../../tests/server'
import type { PurchaseSummaryData } from '../../types'
import { useGetPurchaseSummary } from '../useGetPurchaseSummary'

const mockPurchaseSummaryData: PurchaseSummaryData = {
    id: 123,
    customerId: 'cust_456',
    numberOfOrders: 5,
    amountSpent: { amount: '500.00', currencyCode: 'USD' },
    lastOrderId: 'order_789',
}

const mockGetEcommerceData = mockGetEcommerceDataByExternalIdHandler(async () =>
    HttpResponse.json(
        mockEcommerceData({
            data: mockPurchaseSummaryData,
        }),
    ),
)

describe('useGetPurchaseSummary', () => {
    beforeEach(() => {
        server.use(mockGetEcommerceData.handler)
    })

    it('returns loading state initially', () => {
        const { result } = renderHook(() =>
            useGetPurchaseSummary({
                integrationId: 1,
                externalId: 'customer_123',
            }),
        )

        expect(result.current.isLoadingPurchaseSummary).toBe(true)
        expect(result.current.purchaseSummary).toBeUndefined()
    })

    it('returns purchase summary data on success', async () => {
        const { result } = renderHook(() =>
            useGetPurchaseSummary({
                integrationId: 1,
                externalId: 'customer_123',
            }),
        )

        await waitFor(() => {
            expect(result.current.isLoadingPurchaseSummary).toBe(false)
        })

        expect(result.current.purchaseSummary).toMatchObject(
            mockPurchaseSummaryData,
        )
    })

    it('does not fetch when integrationId is undefined', async () => {
        let requestMade = false
        const { handler } = mockGetEcommerceDataByExternalIdHandler(
            async () => {
                requestMade = true
                return HttpResponse.json(
                    mockEcommerceData({
                        data: mockPurchaseSummaryData,
                    }),
                )
            },
        )
        server.use(handler)

        const { result } = renderHook(() =>
            useGetPurchaseSummary({
                integrationId: undefined,
                externalId: 'customer_123',
            }),
        )

        expect(result.current.purchaseSummary).toBeUndefined()

        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(requestMade).toBe(false)
        expect(result.current.purchaseSummary).toBeUndefined()
    })

    it('does not fetch when externalId is undefined', async () => {
        let requestMade = false
        const { handler } = mockGetEcommerceDataByExternalIdHandler(
            async () => {
                requestMade = true
                return HttpResponse.json(
                    mockEcommerceData({
                        data: mockPurchaseSummaryData,
                    }),
                )
            },
        )
        server.use(handler)

        const { result } = renderHook(() =>
            useGetPurchaseSummary({
                integrationId: 1,
                externalId: undefined,
            }),
        )

        expect(result.current.purchaseSummary).toBeUndefined()

        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(requestMade).toBe(false)
        expect(result.current.purchaseSummary).toBeUndefined()
    })

    it('returns undefined when both params are undefined', async () => {
        let requestMade = false
        const { handler } = mockGetEcommerceDataByExternalIdHandler(
            async () => {
                requestMade = true
                return HttpResponse.json(
                    mockEcommerceData({
                        data: mockPurchaseSummaryData,
                    }),
                )
            },
        )
        server.use(handler)

        const { result } = renderHook(() =>
            useGetPurchaseSummary({
                integrationId: undefined,
                externalId: undefined,
            }),
        )

        expect(result.current.purchaseSummary).toBeUndefined()

        await new Promise((resolve) => setTimeout(resolve, 50))

        expect(requestMade).toBe(false)
        expect(result.current.purchaseSummary).toBeUndefined()
    })
})
