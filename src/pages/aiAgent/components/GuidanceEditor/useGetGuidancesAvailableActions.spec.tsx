import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import { renderHook } from 'utils/testing/renderHook'

import { useGetGuidancesAvailableActions } from './useGetGuidancesAvailableActions'

// mock useGetStoreWorkflowsConfigurations
jest.mock('models/workflows/queries', () => ({
    useGetStoreWorkflowsConfigurations: jest.fn(),
}))

const mockUseGetStoreWorkflowsConfigurations =
    useGetStoreWorkflowsConfigurations as jest.Mock

describe('useGetGuidancesAvailableActions', () => {
    beforeEach(() => {
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [
                {
                    internal_id: 'toto-internal',
                    id: 'toto-id',
                    account_id: 42,
                    name: 'TOTO action',
                    is_draft: false,
                },
                {
                    internal_id: 'foobar-internal',
                    id: 'foobar-id',
                    account_id: 42,
                    name: 'Foobar action',
                    is_draft: false,
                },
            ],
            isLoading: false,
        } as any)
    })

    it('should return the correct actions', () => {
        const { result } = renderHook(() =>
            useGetGuidancesAvailableActions('store1', 'shopify'),
        )

        expect(result.current.isLoading).toBe(false)

        expect(result.current.guidanceActions).toEqual([
            {
                name: 'TOTO action',
                value: 'toto-id',
            },
            {
                name: 'Foobar action',
                value: 'foobar-id',
            },
        ])

        expect(mockUseGetStoreWorkflowsConfigurations).toHaveBeenCalledWith({
            storeName: 'store1',
            storeType: 'shopify',
            triggers: ['llm-prompt'],
        })
    })
})
