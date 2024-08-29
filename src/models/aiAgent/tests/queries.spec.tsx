import {QueryClientProvider} from '@tanstack/react-query'
import React from 'react'
import {mockFlags} from 'jest-launchdarkly-mock'
import {renderHook} from '@testing-library/react-hooks'
import * as reactQuery from '@tanstack/react-query'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {HelpCenterClient} from 'rest_api/help_center_api/client'
import {getAIGuidanceFixture} from 'pages/automate/aiAgent/fixtures/aiGuidance.fixture'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    getWelcomePageAcknowledgedKey,
    useGetAIGeneratedGuidances,
    useGetWelcomePageAcknowledged,
    useCreateWelcomePageAcknowledged,
} from '../queries'
import * as guidanceResources from '../resources/guidances'
import {
    createWelcomePageAcknowledged,
    getWelcomePageAcknowledged,
} from '../resources/account-configuration'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

jest.mock('models/aiAgent/resources/account-configuration', () => ({
    createWelcomePageAcknowledged: jest.fn(),
    getWelcomePageAcknowledged: jest.fn(),
}))

mockFlags({
    [FeatureFlagKey.AiAgentAIGeneratedGuidances]: true,
})

const mockUseHelpCenterApi = jest.mocked(useHelpCenterApi)

const getAIGeneratedGuidances = jest.spyOn(
    guidanceResources,
    'getAIGeneratedGuidances'
)

const useQuerySpy = jest.spyOn(reactQuery, 'useQuery')

const useMutationSpy = jest.spyOn(reactQuery, 'useMutation')

const queryClient = mockQueryClient()
const wrapper = ({children}: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const helpCenterId = 1
const storeIntegrationId = 1

const mockedAIGuidances = [
    {...getAIGuidanceFixture('1'), batch_datetime: '2024-04-18T12:21:00.531Z'},
    {...getAIGuidanceFixture('2'), batch_datetime: '2024-04-18T12:21:00.531Z'},
]

describe('queries', () => {
    beforeEach(() => {
        queryClient.clear()
        useQuerySpy.mockClear()
        useMutationSpy.mockClear()
    })

    describe('useGetAIGeneratedGuidances', () => {
        it('should return correct params from API', async () => {
            getAIGeneratedGuidances.mockReturnValue(
                Promise.resolve(mockedAIGuidances)
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const {result, waitFor} = renderHook(
                () =>
                    useGetAIGeneratedGuidances(
                        helpCenterId,
                        storeIntegrationId
                    ),
                {
                    wrapper,
                }
            )

            await waitFor(() => expect(result.current.isSuccess).toBe(true))
            expect(result.current.data).toStrictEqual(mockedAIGuidances)
        })

        it('should not call the api function when enabled false', () => {
            getAIGeneratedGuidances.mockReturnValue(Promise.resolve([]))
            renderHook(
                () =>
                    useGetAIGeneratedGuidances(
                        helpCenterId,
                        storeIntegrationId,
                        {enabled: false}
                    ),
                {
                    wrapper,
                }
            )

            expect(getAIGeneratedGuidances).toHaveBeenCalledTimes(0)
        })

        it('should not call the api function when client is not set', () => {
            getAIGeneratedGuidances.mockReturnValue(Promise.resolve([]))
            mockUseHelpCenterApi.mockReturnValue({
                client: undefined,
                isReady: false,
            })
            renderHook(
                () =>
                    useGetAIGeneratedGuidances(
                        helpCenterId,
                        storeIntegrationId
                    ),
                {
                    wrapper,
                }
            )

            expect(getAIGeneratedGuidances).toHaveBeenCalledTimes(0)
        })
    })

    describe('getWelcomePageAcknowledgedKey', () => {
        it('should return the correct key', () => {
            const storeName = 'myStore'
            const result = getWelcomePageAcknowledgedKey(storeName)

            expect(result).toEqual([
                'ai-agent-welcome-page-acknowledged',
                storeName,
            ])
        })
    })

    describe('useGetWelcomePageAcknowledged', () => {
        it('should call useQuery with the correct parameters', async () => {
            const storeName = 'myStore'
            const mockData = {acknowledged: true}
            const overrides = {staleTime: 1000}

            ;(getWelcomePageAcknowledged as jest.Mock).mockResolvedValue(
                mockData
            )

            renderHook(
                () => useGetWelcomePageAcknowledged(storeName, overrides),
                {wrapper}
            )

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: getWelcomePageAcknowledgedKey(storeName),
                queryFn: expect.any(Function),
                staleTime: 1000,
            })

            const queryFn = (
                useQuerySpy.mock.calls[0][0] as unknown as {
                    queryFn: () => any
                }
            ).queryFn

            await expect(queryFn()).resolves.toEqual(mockData)
        })
    })

    describe('useCreateWelcomePageAcknowledged', () => {
        it('should call useMutation with the correct parameters', async () => {
            const storeName = 'myStore'
            const overrides = {cacheTime: 2000, retry: true}
            const mockData = {acknowledged: true}

            ;(createWelcomePageAcknowledged as jest.Mock).mockResolvedValue(
                mockData
            )

            renderHook(() => useCreateWelcomePageAcknowledged(overrides), {
                wrapper,
            })

            expect(useMutationSpy).toHaveBeenCalledWith({
                mutationFn: expect.any(Function),
                cacheTime: 2000,
                retry: true,
            })

            const mutationFn = (
                useMutationSpy.mock.calls[0][0] as unknown as {
                    mutationFn: (args: [string]) => any
                }
            ).mutationFn

            await expect(mutationFn([storeName])).resolves.toEqual(mockData)
        })
    })
})
