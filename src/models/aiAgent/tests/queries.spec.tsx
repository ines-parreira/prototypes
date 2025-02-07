import {QueryClientProvider} from '@tanstack/react-query'
import * as reactQuery from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {CreatePlaygroundBody} from 'models/aiAgentPlayground/types'
import {getAIGuidanceFixture} from 'pages/aiAgent/fixtures/aiGuidance.fixture'
import {customToneOfVoicePreviewFixture} from 'pages/aiAgent/fixtures/customToneOfVoicePreview.fixture'
import {getOnboardingNotificationStateFixture} from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'
import {getStoreConfigurationFixture} from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {HelpCenterClient} from 'rest_api/help_center_api/client'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import {assumeMock} from 'utils/testing'

import {
    getWelcomePageAcknowledgedKey,
    useGetAIGeneratedGuidances,
    useGetWelcomePageAcknowledged,
    useCreateWelcomePageAcknowledged,
    useGenerateCustomToneOfVoicePreview,
    useGetOnboardingNotificationState,
    useCreateOnboardingNotificationState,
    CACHE_TIME_MS,
    useUpsertOnboardingNotificationState,
    useGetStoreConfigurationPure,
} from '../queries'
import {
    createOnboardingNotificationState,
    createWelcomePageAcknowledged,
    getOnboardingNotificationState,
    getStoreConfiguration,
    getWelcomePageAcknowledged,
    upsertOnboardingNotificationState,
} from '../resources/configuration'
import * as guidanceResources from '../resources/guidances'
import {createContextAndGenerateCustomToneOfVoicePreview} from '../resources/message-processing'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

jest.mock('models/aiAgent/resources/configuration', () => ({
    getStoreConfiguration: jest.fn(),
    createWelcomePageAcknowledged: jest.fn(),
    getWelcomePageAcknowledged: jest.fn(),
    getOnboardingNotificationState: jest.fn(),
    createOnboardingNotificationState: jest.fn(),
    upsertOnboardingNotificationState: jest.fn(),
}))

const mockGetStoreConfiguration = assumeMock(getStoreConfiguration)
const mockGetOnboardingNotificationState = assumeMock(
    getOnboardingNotificationState
)

jest.mock('models/aiAgent/resources/message-processing', () => ({
    createContextAndGenerateCustomToneOfVoicePreview: jest.fn(),
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

    describe('useGetStoreConfigurationPure', () => {
        const accountDomain = 'test-account'
        const storeName = 'test-store'

        const mockData = getStoreConfigurationFixture({storeName})
        const overrides = {staleTime: 2000}
        it('should call useQuery with the correct parameters', async () => {
            mockGetStoreConfiguration.mockResolvedValue({
                data: {storeConfiguration: mockData},
                status: 200,
            } as unknown as ReturnType<typeof getStoreConfiguration>)

            renderHook(
                () =>
                    useGetStoreConfigurationPure(
                        {accountDomain, storeName, withWizard: true},
                        overrides
                    ),
                {wrapper}
            )

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: [
                    'aiAgentStoreConfigurations',
                    'detail',
                    {accountDomain, storeName, withWizard: true},
                ],
                queryFn: expect.any(Function),
                staleTime: 2000,
                cacheTime: CACHE_TIME_MS,
                enabled: true,
            })

            const queryFn = (
                useQuerySpy.mock.calls[0][0] as unknown as {
                    queryFn: () => any
                }
            ).queryFn

            await expect(queryFn()).resolves.toEqual({
                data: {storeConfiguration: mockData},
                status: 200,
            })
        })

        it('should not fetch data if overrides.enabled is false', () => {
            renderHook(
                () =>
                    useGetStoreConfigurationPure(
                        {accountDomain, storeName, withWizard: true},
                        {enabled: false}
                    ),
                {wrapper}
            )

            expect(getStoreConfiguration).not.toHaveBeenCalled()
        })
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
            const accountDomain = 'myAccountDomain'
            const storeName = 'myStore'
            const mockData = {acknowledged: true}
            const overrides = {staleTime: 1000}

            ;(getWelcomePageAcknowledged as jest.Mock).mockResolvedValue(
                mockData
            )

            renderHook(
                () =>
                    useGetWelcomePageAcknowledged(
                        accountDomain,
                        storeName,
                        overrides
                    ),
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

    describe('useGenerateCustomToneOfVoicePreview', () => {
        it('should call useMutation with the correct parameters', async () => {
            const overrides = {cacheTime: 2000, retry: true}
            const mockData = {
                ai_answer:
                    'Our return policy typically allows returns within a certain timeframe from the purchase date, provided the items are in their original condition. ',
            }

            ;(
                createContextAndGenerateCustomToneOfVoicePreview as jest.Mock
            ).mockResolvedValue(mockData)

            renderHook(() => useGenerateCustomToneOfVoicePreview(overrides), {
                wrapper,
            })

            expect(useMutationSpy).toHaveBeenCalledWith({
                mutationFn: expect.any(Function),
                cacheTime: 2000,
                retry: true,
            })

            const mutationFn = (
                useMutationSpy.mock.calls[0][0] as unknown as {
                    mutationFn: (args: CreatePlaygroundBody) => any
                }
            ).mutationFn

            await expect(
                mutationFn(customToneOfVoicePreviewFixture)
            ).resolves.toEqual(mockData)
        })
    })

    describe('useGetOnboardingNotificationState', () => {
        it('should call useQuery with the correct parameters', async () => {
            const accountDomain = 'test-account'
            const storeName = 'test-store'
            const mockData = getOnboardingNotificationStateFixture({
                shopName: storeName,
            })
            const overrides = {staleTime: 2000}

            ;(getOnboardingNotificationState as jest.Mock).mockResolvedValue(
                mockData
            )

            renderHook(
                () =>
                    useGetOnboardingNotificationState(
                        {accountDomain, storeName},
                        overrides
                    ),
                {wrapper}
            )

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: [
                    'aiAgentOnboardingNotificationState',
                    'detail',
                    {accountDomain, storeName},
                ],
                queryFn: expect.any(Function),
                staleTime: 2000,
                cacheTime: CACHE_TIME_MS,
                enabled: true,
            })

            const queryFn = (
                useQuerySpy.mock.calls[0][0] as unknown as {
                    queryFn: () => any
                }
            ).queryFn

            await expect(queryFn()).resolves.toEqual(mockData)
        })
    })

    describe('useGetOrCreateOnboardingNotificationState', () => {
        const accountDomain = 'test-account'
        const storeName = 'test-store'
        const mockData = getOnboardingNotificationStateFixture({
            shopName: storeName,
        })
        const overrides = {staleTime: 2000}
        it('should return onboardingNotificationState if it exists', async () => {
            mockGetOnboardingNotificationState.mockResolvedValue({
                data: {onboardingNotificationState: mockData},
                status: 200,
            } as unknown as ReturnType<typeof getOnboardingNotificationState>)

            renderHook(
                () =>
                    useGetOnboardingNotificationState(
                        {accountDomain, storeName},
                        overrides
                    ),
                {wrapper}
            )

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: [
                    'aiAgentOnboardingNotificationState',
                    'detail',
                    {accountDomain, storeName},
                ],
                queryFn: expect.any(Function),
                staleTime: 2000,
                cacheTime: CACHE_TIME_MS,
                enabled: true,
            })

            const queryFn = (
                useQuerySpy.mock.calls[0][0] as unknown as {
                    queryFn: () => any
                }
            ).queryFn

            await expect(queryFn()).resolves.toEqual({
                data: {onboardingNotificationState: mockData},
                status: 200,
            })
        })

        it('should not fetch data if overrides.enabled is false', () => {
            renderHook(
                () =>
                    useGetOnboardingNotificationState(
                        {accountDomain, storeName},
                        {enabled: false}
                    ),
                {wrapper}
            )

            expect(getOnboardingNotificationState).not.toHaveBeenCalled()
            expect(createOnboardingNotificationState).not.toHaveBeenCalled()
        })
    })

    describe('useCreateOnboardingNotificationState', () => {
        it('should call useMutation with the correct parameters', async () => {
            const storeName = 'test-store'
            const overrides = {cacheTime: 2000, retry: true}
            const mockData = getOnboardingNotificationStateFixture({
                shopName: storeName,
            })

            ;(createOnboardingNotificationState as jest.Mock).mockResolvedValue(
                mockData
            )

            renderHook(() => useCreateOnboardingNotificationState(overrides), {
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

    describe('useUpsertOnboardingNotificationState', () => {
        it('should call useMutation with the correct parameters', async () => {
            const storeName = 'test-store'
            const overrides = {cacheTime: 2000, retry: true}
            const mockData = getOnboardingNotificationStateFixture({
                shopName: storeName,
            })

            ;(upsertOnboardingNotificationState as jest.Mock).mockResolvedValue(
                mockData
            )

            renderHook(() => useUpsertOnboardingNotificationState(overrides), {
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
