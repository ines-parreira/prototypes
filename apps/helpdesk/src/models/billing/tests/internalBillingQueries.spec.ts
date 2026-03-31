import { waitFor } from '@testing-library/react'

import {
    billingKeys,
    getSubscriptionQuery,
    useInternalProductCatalogPlans,
    useUpdateInternalSubscription,
} from 'models/billing/queries'
import * as billingResources from 'models/billing/resources'
import type {
    InternalProductCatalogResponse,
    InternalSubscriptionUpdateResponse,
} from 'models/billing/types'
import { ProductType } from 'models/billing/types'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

jest.mock('models/billing/resources')

describe('internal billing queries', () => {
    let mockGetInternalProductCatalogPlans: jest.MockedFunction<
        typeof billingResources.getInternalProductCatalogPlans
    >
    let mockUpdateInternalSubscription: jest.MockedFunction<
        typeof billingResources.updateInternalSubscription
    >

    beforeEach(() => {
        mockGetInternalProductCatalogPlans = jest.mocked(
            billingResources.getInternalProductCatalogPlans,
        )
        mockUpdateInternalSubscription = jest.mocked(
            billingResources.updateInternalSubscription,
        )
    })

    describe('useInternalProductCatalogPlans', () => {
        it('should fetch internal product catalog plans', async () => {
            const mockCatalog: InternalProductCatalogResponse = {
                plans: {
                    [ProductType.Helpdesk]: {
                        'advanced-monthly-usd-5-1': {
                            product: ProductType.Helpdesk,
                            amount: 3000,
                            currency: 'usd',
                            extra_ticket_cost: 2.0,
                            features: {} as any,
                            plan_id: 'advanced-monthly-usd-5-1',
                            cadence: 'month' as any,
                            invoice_cadence: 'month' as any,
                            name: 'Advanced',
                            num_quota_tickets: 300,
                            public: true,
                            custom: false,
                            generation: 6,
                            integrations: 150,
                            is_legacy: false,
                            tier: 'Advanced' as any,
                        },
                    },
                },
            }
            mockGetInternalProductCatalogPlans.mockResolvedValue(mockCatalog)

            const { result } = renderHookWithStoreAndQueryClientProvider(() =>
                useInternalProductCatalogPlans(),
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            expect(result.current.data).toEqual(mockCatalog)
        })
    })

    describe('useUpdateInternalSubscription', () => {
        const mockPayload = {
            current_resource_version: 123456789,
            new_plans: {
                [ProductType.Helpdesk]: 'advanced-monthly-usd-5-1' as string,
            },
        }

        const mockResponse: InternalSubscriptionUpdateResponse = {
            products: {
                [ProductType.Helpdesk]: 'advanced-monthly-usd-5-1',
            },
        }

        it('should invalidate billing and subscription queries on success', async () => {
            mockUpdateInternalSubscription.mockResolvedValue(mockResponse)

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(() =>
                    useUpdateInternalSubscription(),
                )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await result.current.mutateAsync(mockPayload)

            expect(mockUpdateInternalSubscription).toHaveBeenCalledWith(
                mockPayload,
            )
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: billingKeys.all,
            })
            expect(invalidateQueriesSpy).toHaveBeenCalledWith({
                queryKey: getSubscriptionQuery.queryKey,
            })
        })

        it('should propagate error with BE payload intact', async () => {
            const beError = {
                response: {
                    status: 409,
                    data: {
                        error: {
                            msg: 'Resource version mismatch',
                            code: 'stale_resource',
                        },
                    },
                },
            }
            mockUpdateInternalSubscription.mockRejectedValue(beError)

            const { result } = renderHookWithStoreAndQueryClientProvider(() =>
                useUpdateInternalSubscription(),
            )

            await expect(
                result.current.mutateAsync(mockPayload),
            ).rejects.toMatchObject({
                response: {
                    data: {
                        error: { msg: 'Resource version mismatch' },
                    },
                },
            })
        })

        it('should not invalidate queries when error occurs', async () => {
            const mockError = new Error('API error')
            mockUpdateInternalSubscription.mockRejectedValue(mockError)

            const { result, queryClient } =
                renderHookWithStoreAndQueryClientProvider(() =>
                    useUpdateInternalSubscription(),
                )

            const invalidateQueriesSpy = jest.spyOn(
                queryClient,
                'invalidateQueries',
            )

            await expect(
                result.current.mutateAsync(mockPayload),
            ).rejects.toThrow()

            expect(invalidateQueriesSpy).not.toHaveBeenCalled()
        })
    })
})
