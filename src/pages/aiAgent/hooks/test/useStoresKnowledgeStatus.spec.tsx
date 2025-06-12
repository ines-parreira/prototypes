import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import * as resources from 'models/helpCenter/resources'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { buildSDKMocks } from 'rest_api/help_center_api/tests/buildSdkMocks'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import * as errors from 'utils/errors'
import { renderHook } from 'utils/testing/renderHook'

import { useStoresKnowledgeStatus } from '../useStoresKnowledgeStatus'

const queryClient = mockQueryClient()
const getKnowledgeStatusSpy = jest.spyOn(resources, 'getKnowledgeStatus')
const reportErrorSpy = jest.spyOn(errors, 'reportError')

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const mockedUseHelpCenterApi = useHelpCenterApi as jest.MockedFunction<
    typeof useHelpCenterApi
>

const STORE_NAME_1 = 'My Store'
const STORE_NAME_2 = 'My Other Store'
const STORE_NAME_3 = 'My Third Store'
const STORE_NAME_1_SNIPPET_ID_1 = 101
const STORE_NAME_1_SNIPPET_ID_2 = 102
const STORE_NAME_2_SNIPPET_ID = 103
const STORE_NAME_3_SNIPPET_ID = 104

describe('useStoresKnowledgeStatus', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
        queryClient.getQueryCache().clear()
        mockedUseHelpCenterApi.mockReturnValue({
            client: sdkMocks.client,
            isReady: true,
        })

        getKnowledgeStatusSpy.mockResolvedValue([
            {
                has_public_resources: true,
                help_center_id: STORE_NAME_1_SNIPPET_ID_1,
                shop_name: STORE_NAME_1,
                is_store_domain_synced: false,
            },
            {
                has_public_resources: false,
                help_center_id: STORE_NAME_1_SNIPPET_ID_2,
                shop_name: STORE_NAME_1,
                is_store_domain_synced: false,
            },
            {
                has_public_resources: false,
                help_center_id: STORE_NAME_2_SNIPPET_ID,
                shop_name: STORE_NAME_2,
                is_store_domain_synced: true,
            },
            {
                has_public_resources: false,
                help_center_id: STORE_NAME_3_SNIPPET_ID,
                shop_name: STORE_NAME_3,
                is_store_domain_synced: false,
            },
        ])
    })

    it('should return knowledge status per store', async () => {
        const { result } = renderHook(() => useStoresKnowledgeStatus({}), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        // We don't have STORE_NAME_1_SNIPPET_ID_2 because we take only 1st store.
        expect(result.current.data).toEqual({
            [STORE_NAME_1]: {
                has_public_resources: true,
                help_center_id: STORE_NAME_1_SNIPPET_ID_1,
                shop_name: STORE_NAME_1,
                is_store_domain_synced: false,
            },
            [STORE_NAME_2]: {
                has_public_resources: false,
                help_center_id: STORE_NAME_2_SNIPPET_ID,
                shop_name: STORE_NAME_2,
                is_store_domain_synced: true,
            },
            [STORE_NAME_3]: {
                has_public_resources: false,
                help_center_id: STORE_NAME_3_SNIPPET_ID,
                shop_name: STORE_NAME_3,
                is_store_domain_synced: false,
            },
        })
        expect(reportErrorSpy).not.toHaveBeenCalled()
    })

    it('should report errors', async () => {
        getKnowledgeStatusSpy.mockResolvedValueOnce(
            Promise.reject(new Error('Failed to fetch knowledge status')),
        )

        const { result } = renderHook(() => useStoresKnowledgeStatus({}), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            ),
        })

        expect(result.current.isLoading).toBe(true)

        await waitFor(() => expect(result.current.isLoading).toBe(false))

        expect(result.current.data).toBeUndefined()
        expect(reportErrorSpy).toHaveBeenCalled()
    })
})
