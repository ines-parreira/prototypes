import { useGetStoreWorkflowsConfigurations } from 'models/workflows/queries'
import { renderHook } from 'utils/testing/renderHook'

import { useFetchActionsData } from '../useFetchActionsData'

jest.mock('models/workflows/queries')
const mockUseGetStoreWorkflowsConfigurations =
    useGetStoreWorkflowsConfigurations as jest.Mock

describe('useFetchActionsData', () => {
    it.each([true, false, undefined])(
        'sets correct retries value when retries is set to %s',
        (retries) => {
            const storeName = 'test-store'
            const enabled = true

            mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
                isLoading: true,
                data: undefined,
            })

            renderHook(() =>
                useFetchActionsData({
                    storeName,
                    enabled,
                    retries,
                }),
            )

            expect(mockUseGetStoreWorkflowsConfigurations).toHaveBeenCalledWith(
                {
                    storeName,
                    storeType: 'shopify',
                    triggers: ['llm-prompt'],
                },
                {
                    enabled,
                    refetchOnWindowFocus: true,
                    ...(retries === false && { retry: 0 }),
                },
            )
        },
    )
})
