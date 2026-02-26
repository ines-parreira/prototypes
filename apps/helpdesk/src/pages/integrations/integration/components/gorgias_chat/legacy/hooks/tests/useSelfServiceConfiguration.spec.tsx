import type React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import type { ShopType } from 'models/selfServiceConfiguration/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import useSelfServiceConfiguration from '../useSelfServiceConfiguration'

const initialSelfServiceConfiguration = {
    id: 1,
    type: 'shopify' as ShopType,
    shop_name: 'test',
    created_datetime: '2021-01-01T00:00:00Z',
    updated_datetime: '2021-01-01T00:00:00Z',
    deactivated_datetime: null,
    articleRecommendationHelpCenterId: 1,
}

const integration = fromJS({
    type: 'shopify',
    name: 'test',
    meta: { shop_integration_id: 1, shop_name: 'test', type: 'shopify' },
})

const mockClient = mockQueryClient()

const withQueryClient = ({ children }: { children?: React.ReactNode }) => (
    <QueryClientProvider client={mockClient}>{children}</QueryClientProvider>
)

describe('useSelfServiceConfiguration', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    it('returns false when selfServiceConfiguration is null', () => {
        const { result } = renderHook(
            () => useSelfServiceConfiguration(integration),
            {
                wrapper: withQueryClient,
            },
        )

        expect(result.current).toEqual({
            selfServiceConfigurationEnabled: false,
            selfServiceConfiguration: null,
        })
    })

    it('returns false when canTrackOrders, and canManageOrders are all false', async () => {
        const selfServiceConfiguration = {
            ...initialSelfServiceConfiguration,
            trackOrderPolicy: { enabled: false },
            reportIssuePolicy: { enabled: false, cases: [] },
            cancelOrderPolicy: { enabled: false },
            returnOrderPolicy: { enabled: false },
        }

        const useGetSelfServiceConfigurationsMock = jest.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('models/selfServiceConfiguration/queries'),
            'useGetSelfServiceConfiguration',
        )

        useGetSelfServiceConfigurationsMock.mockImplementationOnce(() => ({
            data: selfServiceConfiguration,
            isLoading: false,
        }))

        const { result } = renderHook(
            () => useSelfServiceConfiguration(integration),
            {
                wrapper: ({ children }) => (
                    <QueryClientProvider client={mockClient}>
                        {children}
                    </QueryClientProvider>
                ),
            },
        )

        await act(() =>
            waitFor(() =>
                expect(result.current).toEqual({
                    selfServiceConfigurationEnabled: false,
                    selfServiceConfiguration,
                }),
            ),
        )
    })

    it('returns true when canTrackOrders is true', async () => {
        const selfServiceConfiguration = {
            ...initialSelfServiceConfiguration,
            trackOrderPolicy: { enabled: true },
            reportIssuePolicy: { enabled: false },
            cancelOrderPolicy: { enabled: false },
            returnOrderPolicy: { enabled: false },
        }

        const useGetSelfServiceConfigurationsMock = jest.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('models/selfServiceConfiguration/queries'),
            'useGetSelfServiceConfiguration',
        )

        useGetSelfServiceConfigurationsMock.mockImplementationOnce(() => ({
            data: selfServiceConfiguration,
            isLoading: false,
        }))

        const { result } = renderHook(
            () => useSelfServiceConfiguration(integration),
            {
                wrapper: withQueryClient,
            },
        )

        await act(() =>
            waitFor(() =>
                expect(result.current).toEqual({
                    selfServiceConfigurationEnabled: true,
                    selfServiceConfiguration,
                }),
            ),
        )
    })

    it('returns true when canManageOrders is true', async () => {
        const selfServiceConfiguration = {
            ...initialSelfServiceConfiguration,
            trackOrderPolicy: { enabled: false },
            reportIssuePolicy: { enabled: true },
            cancelOrderPolicy: { enabled: true },
            returnOrderPolicy: { enabled: true },
        }

        const useGetSelfServiceConfigurationsMock = jest.spyOn(
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('models/selfServiceConfiguration/queries'),
            'useGetSelfServiceConfiguration',
        )

        useGetSelfServiceConfigurationsMock.mockImplementationOnce(() => ({
            data: selfServiceConfiguration,
            isLoading: false,
        }))

        const { result } = renderHook(
            () => useSelfServiceConfiguration(integration),
            {
                wrapper: withQueryClient,
            },
        )

        await act(() =>
            waitFor(() =>
                expect(result.current).toEqual({
                    selfServiceConfigurationEnabled: true,
                    selfServiceConfiguration,
                }),
            ),
        )
    })
})
