import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'

import { getGorgiasWfApiClient } from 'rest_api/workflows_api/client'
import { mockQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { useGetGuidancesAvailableActions } from './useGetGuidancesAvailableActions'

jest.mock('rest_api/workflows_api/client', () => ({
    getGorgiasWfApiClient: jest.fn(),
}))

jest.mock('models/workflows/queries', () => ({
    CACHE_TIME_MS: 0,
    STALE_TIME_MS: 0,
}))

const mockGetGorgiasWfApiClient = getGorgiasWfApiClient as jest.Mock

const activeEntrypoint = {
    deactivated_datetime: null,
    kind: 'llm-conversation',
}
const inactiveEntrypoint = {
    deactivated_datetime: '2024-01-01T00:00:00Z',
    kind: 'llm-conversation',
}

const mockAllActions = [
    {
        id: 'toto-id',
        name: 'TOTO action',
        entrypoints: [activeEntrypoint],
        steps: [],
        apps: [],
        inputs: [],
        values: {},
    },
    {
        id: 'foobar-id',
        name: 'Foobar action',
        entrypoints: [inactiveEntrypoint],
        steps: [],
        apps: [],
        inputs: [],
        values: {},
    },
]

describe('useGetGuidancesAvailableActions', () => {
    beforeEach(() => {
        const mockApiClient = {
            StoreWfConfigurationController_list: jest
                .fn()
                .mockResolvedValue({ data: mockAllActions }),
        }
        mockGetGorgiasWfApiClient.mockResolvedValue(mockApiClient)
    })

    it('should return the correct actions with enabled status', async () => {
        const { QueryClientProvider } = mockQueryClientProvider()
        const { result } = renderHook(
            () => useGetGuidancesAvailableActions('store1', 'shopify'),
            { wrapper: QueryClientProvider },
        )

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.guidanceActions).toEqual([
            {
                name: 'TOTO action',
                value: 'toto-id',
                enabled: true,
                requiresAuth: false,
                hasMissingValues: false,
                missingValuesDetails: undefined,
            },
            {
                name: 'Foobar action',
                value: 'foobar-id',
                enabled: false,
                requiresAuth: false,
                hasMissingValues: false,
                missingValuesDetails: undefined,
            },
        ])
    })

    it('should not fetch when shopType is not shopify', () => {
        const { QueryClientProvider } = mockQueryClientProvider()
        renderHook(() => useGetGuidancesAvailableActions('store1', 'magento'), {
            wrapper: QueryClientProvider,
        })

        expect(mockGetGorgiasWfApiClient).not.toHaveBeenCalled()
    })

    it('should not fetch when shopName is empty', () => {
        const { QueryClientProvider } = mockQueryClientProvider()
        renderHook(() => useGetGuidancesAvailableActions('', 'shopify'), {
            wrapper: QueryClientProvider,
        })

        expect(mockGetGorgiasWfApiClient).not.toHaveBeenCalled()
    })
})
