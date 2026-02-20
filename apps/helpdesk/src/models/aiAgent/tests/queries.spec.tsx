import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import * as reactQuery from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import {
    useCreateTestSessionMutation,
    useGetTestSessionLogs,
    useSubmitTestModeMessageMutation,
    useTriggerAIJourney,
} from 'models/aiAgent/queries'
import type {
    CreatePlaygroundBody,
    GetTestSessionLogsResponse,
} from 'models/aiAgentPlayground/types'
import {
    TestSessionLogType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import { getAIGuidanceFixture } from 'pages/aiAgent/fixtures/aiGuidance.fixture'
import { customToneOfVoicePreviewFixture } from 'pages/aiAgent/fixtures/customToneOfVoicePreview.fixture'
import { getHandoverConfigurationsFixture } from 'pages/aiAgent/fixtures/handoverConfiguration.fixture'
import { getOnboardingNotificationStateFixture } from 'pages/aiAgent/fixtures/onboardingNotificationState.fixture'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import type { HelpCenterClient } from 'rest_api/help_center_api/client'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import {
    CACHE_TIME_MS,
    getWelcomePageAcknowledgedKey,
    STALE_TIME_MS,
    useCreateOnboardingNotificationState,
    useCreateWelcomePageAcknowledged,
    useGenerateCustomToneOfVoicePreview,
    useGetAIGeneratedGuidances,
    useGetOnboardingNotificationState,
    useGetStoreConfigurationPure,
    useGetStoreHandoverConfigurations,
    useGetStoresConfigurationForAccount,
    useGetWelcomePageAcknowledged,
    useUpsertOnboardingNotificationState,
    useUpsertStoreHandoverConfiguration,
} from '../queries'
import { createContextAndTriggerAIJourney } from '../resources/ai-journey'
import {
    createOnboardingNotificationState,
    createWelcomePageAcknowledged,
    getAiAgentStoreHandoverConfigurations,
    getOnboardingNotificationState,
    getStoreConfiguration,
    getStoresConfigurations,
    getWelcomePageAcknowledged,
    upsertAiAgentStoreHandoverConfiguration,
    upsertOnboardingNotificationState,
} from '../resources/configuration'
import * as guidanceResources from '../resources/guidances'
import { createContextAndGenerateCustomToneOfVoicePreview } from '../resources/message-processing'
import {
    createTestSession,
    getTestSessionLogs,
    submitTestSessionMessage,
} from '../resources/playground'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
}))

jest.mock('models/aiAgent/resources/configuration', () => ({
    getStoresConfigurations: jest.fn(),
    getStoreConfiguration: jest.fn(),
    createWelcomePageAcknowledged: jest.fn(),
    getWelcomePageAcknowledged: jest.fn(),
    getOnboardingNotificationState: jest.fn(),
    createOnboardingNotificationState: jest.fn(),
    upsertOnboardingNotificationState: jest.fn(),
    getAiAgentStoreHandoverConfigurations: jest.fn(),
    upsertAiAgentStoreHandoverConfiguration: jest.fn(),
}))

const mockGetStoreConfiguration = getStoreConfiguration as jest.Mock
const mockGetStoresConfigurations = getStoresConfigurations as jest.Mock
const mockGetOnboardingNotificationState = assumeMock(
    getOnboardingNotificationState,
)

jest.mock('models/aiAgent/resources/message-processing', () => ({
    createContextAndGenerateCustomToneOfVoicePreview: jest.fn(),
}))

jest.mock('models/aiAgent/resources/ai-journey', () => ({
    createContextAndTriggerAIJourney: jest.fn(),
}))

jest.mock('@repo/feature-flags')

const mockUseHelpCenterApi = jest.mocked(useHelpCenterApi)
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const getAIGeneratedGuidances = jest.spyOn(
    guidanceResources,
    'getAIGeneratedGuidances',
)

const useQuerySpy = jest.spyOn(reactQuery, 'useQuery')

const useMutationSpy = jest.spyOn(reactQuery, 'useMutation')

const queryClient = mockQueryClient()
const wrapper = ({ children }: any) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const helpCenterId = 1
const storeIntegrationId = 1

const mockedAIGuidances = [
    {
        ...getAIGuidanceFixture('1'),
        batch_datetime: '2024-04-18T12:21:00.531Z',
    },
    {
        ...getAIGuidanceFixture('2'),
        batch_datetime: '2024-04-18T12:21:00.531Z',
    },
]

jest.mock('models/aiAgent/resources/playground', () => ({
    createTestSession: jest.fn(),
    getTestSessionLogs: jest.fn(),
    submitTestSessionMessage: jest.fn(),
}))

const mockCreateTestSession = jest.mocked(createTestSession)
const mockGetTestSessionLogs = jest.mocked(getTestSessionLogs)
const mockSubmitTestSessionMessage = jest.mocked(submitTestSessionMessage)

describe('queries', () => {
    beforeEach(() => {
        queryClient.clear()
        useQuerySpy.mockClear()
        useMutationSpy.mockClear()

        // Mock feature flags
        mockUseFlag.mockImplementation((flag: string) => {
            switch (flag) {
                case FeatureFlagKey.AiAgentAIGeneratedGuidances:
                    return true
                default:
                    return false
            }
        })
    })

    describe('useGetStoreConfigurationPure', () => {
        const accountDomain = 'test-account'
        const storeName = 'test-store'

        const mockData = getStoreConfigurationFixture({ storeName })
        const overrides = { staleTime: 2000 }
        it('should call useQuery with the correct parameters', async () => {
            mockGetStoreConfiguration.mockResolvedValue({
                data: { storeConfiguration: mockData },
                status: 200,
            } as unknown as ReturnType<typeof getStoreConfiguration>)

            renderHook(
                () =>
                    useGetStoreConfigurationPure(
                        { accountDomain, storeName, withWizard: true },
                        overrides,
                    ),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: [
                    'aiAgentStoreConfigurations',
                    'detail',
                    { accountDomain, storeName, withWizard: true },
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
                data: { storeConfiguration: mockData },
                status: 200,
            })
        })

        it('should not fetch data if overrides.enabled is false', () => {
            renderHook(
                () =>
                    useGetStoreConfigurationPure(
                        { accountDomain, storeName, withWizard: true },
                        { enabled: false },
                    ),
                { wrapper },
            )

            expect(getStoreConfiguration).not.toHaveBeenCalled()
        })
    })

    describe('useGetStoresConfigurationForAccount', () => {
        const accountDomain = 'test-account'
        const storeName = 'test-store-1'
        const mockData = getStoreConfigurationFixture({
            storeName,
        })

        const overrides = { staleTime: 2000 }
        it('should call useQuery with the correct parameters', async () => {
            mockGetStoresConfigurations.mockResolvedValue({
                data: { storeConfigurations: mockData },
                status: 200,
            } as unknown as ReturnType<typeof getStoresConfigurations>)

            renderHook(
                () =>
                    useGetStoresConfigurationForAccount(
                        {
                            accountDomain,
                        },
                        overrides,
                    ),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: [
                    'aiAgentStoreConfigurations',
                    'account',
                    'test-account',
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
                data: { storeConfigurations: mockData },
                status: 200,
            })
        })
    })

    describe('useGetAIGeneratedGuidances', () => {
        it('should return correct params from API', async () => {
            getAIGeneratedGuidances.mockReturnValue(
                Promise.resolve(mockedAIGuidances),
            )
            mockUseHelpCenterApi.mockReturnValue({
                client: {} as HelpCenterClient,
                isReady: true,
            })
            const { result } = renderHook(
                () =>
                    useGetAIGeneratedGuidances(
                        helpCenterId,
                        storeIntegrationId,
                    ),
                {
                    wrapper,
                },
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
                        { enabled: false },
                    ),
                {
                    wrapper,
                },
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
                        storeIntegrationId,
                    ),
                {
                    wrapper,
                },
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
            const mockData = { acknowledged: true }
            const overrides = { staleTime: 1000 }

            ;(getWelcomePageAcknowledged as jest.Mock).mockResolvedValue(
                mockData,
            )

            renderHook(
                () =>
                    useGetWelcomePageAcknowledged(
                        accountDomain,
                        storeName,
                        overrides,
                    ),
                { wrapper },
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
            const overrides = { cacheTime: 2000, retry: true }
            const mockData = { acknowledged: true }

            ;(createWelcomePageAcknowledged as jest.Mock).mockResolvedValue(
                mockData,
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
            const overrides = { cacheTime: 2000, retry: true }
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
                    mutationFn: (args: CreatePlaygroundBody[]) => any
                }
            ).mutationFn

            await expect(
                mutationFn([customToneOfVoicePreviewFixture]),
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
            const overrides = { staleTime: 2000 }

            ;(getOnboardingNotificationState as jest.Mock).mockResolvedValue(
                mockData,
            )

            renderHook(
                () =>
                    useGetOnboardingNotificationState(
                        { accountDomain, storeName },
                        overrides,
                    ),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: [
                    'aiAgentOnboardingNotificationState',
                    'detail',
                    { accountDomain, storeName },
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
        const overrides = { staleTime: 2000 }
        it('should return onboardingNotificationState if it exists', async () => {
            mockGetOnboardingNotificationState.mockResolvedValue({
                data: { onboardingNotificationState: mockData },
                status: 200,
            } as unknown as ReturnType<typeof getOnboardingNotificationState>)

            renderHook(
                () =>
                    useGetOnboardingNotificationState(
                        { accountDomain, storeName },
                        overrides,
                    ),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: [
                    'aiAgentOnboardingNotificationState',
                    'detail',
                    { accountDomain, storeName },
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
                data: { onboardingNotificationState: mockData },
                status: 200,
            })
        })

        it('should not fetch data if overrides.enabled is false', () => {
            renderHook(
                () =>
                    useGetOnboardingNotificationState(
                        { accountDomain, storeName },
                        { enabled: false },
                    ),
                { wrapper },
            )

            expect(getOnboardingNotificationState).not.toHaveBeenCalled()
            expect(createOnboardingNotificationState).not.toHaveBeenCalled()
        })
    })

    describe('useCreateOnboardingNotificationState', () => {
        it('should call useMutation with the correct parameters', async () => {
            const storeName = 'test-store'
            const overrides = { cacheTime: 2000, retry: true }
            const mockData = getOnboardingNotificationStateFixture({
                shopName: storeName,
            })

            ;(createOnboardingNotificationState as jest.Mock).mockResolvedValue(
                mockData,
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
            const overrides = { cacheTime: 2000, retry: true }
            const mockData = getOnboardingNotificationStateFixture({
                shopName: storeName,
            })

            ;(upsertOnboardingNotificationState as jest.Mock).mockResolvedValue(
                mockData,
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

    describe('useGetStoreHandoverConfigurations', () => {
        it('should call useQuery with the correct parameters', async () => {
            const accountDomain = 'test-account'
            const storeName = 'test-store'
            const channel = undefined
            const mockData = getHandoverConfigurationsFixture()

            ;(
                getAiAgentStoreHandoverConfigurations as jest.Mock
            ).mockResolvedValue(mockData)

            renderHook(
                () =>
                    useGetStoreHandoverConfigurations({
                        accountDomain,
                        storeName,
                    }),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: [
                    'aiAgentHandoverConfigurations',
                    'detail',
                    { accountDomain, storeName, channel },
                ],
                queryFn: expect.any(Function),
                staleTime: STALE_TIME_MS,
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

        it('should not fetch data if overrides enabled is false', () => {
            const accountDomain = 'test-account'
            const storeName = 'test-store'
            const mockData = getHandoverConfigurationsFixture()

            ;(
                getAiAgentStoreHandoverConfigurations as jest.Mock
            ).mockResolvedValue(mockData)

            renderHook(
                () =>
                    useGetOnboardingNotificationState(
                        { accountDomain, storeName },
                        { enabled: false },
                    ),
                { wrapper },
            )

            expect(getAiAgentStoreHandoverConfigurations).not.toHaveBeenCalled()
        })
    })

    describe('useUpsertStoreHandoverConfiguration', () => {
        it('should call useMutation with the correct parameters', async () => {
            const storeName = 'test-store'

            const overrides = { cacheTime: 2000, retry: true }
            const mockDataToBeUpserted =
                getHandoverConfigurationsFixture().handoverConfigurations[0]

            ;(
                upsertAiAgentStoreHandoverConfiguration as jest.Mock
            ).mockResolvedValue(mockDataToBeUpserted)

            renderHook(() => useUpsertStoreHandoverConfiguration(overrides), {
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

            await expect(mutationFn([storeName])).resolves.toEqual(
                mockDataToBeUpserted,
            )
        })
    })

    describe('useCreateTestSessionMutation', () => {
        it('should call useMutation with the correct parameters', async () => {
            const mockResponse = { sessionId: 'test-session-123' }
            mockCreateTestSession.mockResolvedValue(mockResponse as any)

            renderHook(() => useCreateTestSessionMutation(), { wrapper })

            expect(useMutationSpy).toHaveBeenCalledWith({
                mutationFn: expect.any(Function),
            })

            const mutationFn = (
                useMutationSpy.mock.calls[0][0] as unknown as {
                    mutationFn: (params: any[]) => any
                }
            ).mutationFn

            await expect(mutationFn([])).resolves.toEqual(mockResponse)
        })

        it('should handle errors correctly', async () => {
            const mockError = new Error('Test error')
            mockCreateTestSession.mockRejectedValue(mockError)

            renderHook(() => useCreateTestSessionMutation(), { wrapper })

            const mutationFn = (
                useMutationSpy.mock.calls[0][0] as unknown as {
                    mutationFn: (params: any[]) => any
                }
            ).mutationFn

            await expect(mutationFn([])).rejects.toThrow('Test error')
        })
    })

    describe('useSubmitTestModeMessageMutation', () => {
        it('should call useMutation with the correct parameters', async () => {
            const payload = {
                sessionId: 'session-123',
                userMessage: {
                    type: 'message' as const,
                    role: 'user' as const,
                    content: [{ type: 'text' as const, text: 'Hello' }],
                },
                isDirectModelCall: false,
            }
            const mockResponse = { success: true }
            mockSubmitTestSessionMessage.mockResolvedValue(mockResponse as any)

            renderHook(() => useSubmitTestModeMessageMutation(), { wrapper })

            expect(useMutationSpy).toHaveBeenCalledWith({
                mutationFn: expect.any(Function),
            })

            const mutationFn = (
                useMutationSpy.mock.calls[0][0] as unknown as {
                    mutationFn: (params: any[]) => any
                }
            ).mutationFn

            await expect(mutationFn([undefined, payload])).resolves.toEqual(
                mockResponse,
            )
            expect(mockSubmitTestSessionMessage).toHaveBeenCalledWith(
                undefined,
                payload,
            )
        })

        it('should handle errors correctly', async () => {
            const mockError = new Error('Failed to submit message')
            mockSubmitTestSessionMessage.mockRejectedValue(mockError)

            renderHook(() => useSubmitTestModeMessageMutation(), { wrapper })

            const mutationFn = (
                useMutationSpy.mock.calls[0][0] as unknown as {
                    mutationFn: (params: any[]) => any
                }
            ).mutationFn

            await expect(mutationFn([])).rejects.toThrow(
                'Failed to submit message',
            )
        })

        it('should support overrides', async () => {
            const onSuccessMock = jest.fn()
            mockSubmitTestSessionMessage.mockResolvedValue({} as any)

            renderHook(
                () =>
                    useSubmitTestModeMessageMutation({
                        onSuccess: onSuccessMock,
                        retry: false,
                    }),
                { wrapper },
            )

            expect(useMutationSpy).toHaveBeenCalledWith({
                mutationFn: expect.any(Function),
                onSuccess: onSuccessMock,
                retry: false,
            })
        })
    })

    describe('useGetTestSessionLogs', () => {
        const testSessionId = 'test-session-123'

        it('should call useQuery with the correct parameters', async () => {
            const mockResponse: GetTestSessionLogsResponse = {
                id: testSessionId,
                status: 'finished',
                logs: [
                    {
                        id: 'log-1',
                        accountId: 123,
                        testModeSessionId: testSessionId,
                        aiAgentExecutionId: 'exec-1',
                        type: TestSessionLogType.AI_AGENT_INSIGHT,
                        createdDatetime: '2023-01-01T12:00:00Z',
                        data: {
                            message: 'Test insight',
                            isSalesOpportunity: false,
                            isSalesDiscount: false,
                            isSalesOpportunityFieldId: null,
                            isSalesDiscountFieldId: null,
                            outcome: TicketOutcome.CLOSE,
                        },
                    },
                ],
            }

            mockGetTestSessionLogs.mockResolvedValue(mockResponse)

            renderHook(() => useGetTestSessionLogs(testSessionId), { wrapper })

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: ['aiAgentTestSessionLogs', testSessionId],
                queryFn: expect.any(Function),
            })

            const queryFn = (
                useQuerySpy.mock.calls[0][0] as unknown as {
                    queryFn: () => any
                }
            ).queryFn

            await expect(queryFn()).resolves.toEqual(mockResponse)
        })

        it('should apply overrides correctly', () => {
            const overrides = {
                staleTime: 5000,
                cacheTime: 10000,
                retry: false,
                enabled: false,
            }

            renderHook(
                () => useGetTestSessionLogs(testSessionId, false, overrides),
                {
                    wrapper,
                },
            )

            expect(useQuerySpy).toHaveBeenCalledWith({
                queryKey: ['aiAgentTestSessionLogs', testSessionId],
                queryFn: expect.any(Function),
                staleTime: 5000,
                cacheTime: 10000,
                retry: false,
                enabled: false,
            })
        })

        it('should handle error states correctly', async () => {
            const mockError = new Error('Failed to fetch logs')
            mockGetTestSessionLogs.mockRejectedValue(mockError)

            renderHook(() => useGetTestSessionLogs(testSessionId), { wrapper })

            const queryFn = (
                useQuerySpy.mock.calls[0][0] as unknown as {
                    queryFn: () => any
                }
            ).queryFn

            await expect(queryFn()).rejects.toThrow('Failed to fetch logs')
        })
    })

    describe('useTriggerAIJourney', () => {
        it('should successfully trigger AI journey', async () => {
            const mockOptions = {
                accountId: 6069,
                storeIntegrationId: 33858,
                storeName: 'artemisathletix',
                storeType: 'shopify',
                journeyId: '01JZAPAD606K1JSKNHC8KVA4BD',
                journeyMessageInstructions: null,
                followUpAttempt: 0,
                testModeSessionId: '90a2b7b2-e936-4208-ad28-706611c1f9b6',
                cart: {
                    lineItems: [
                        {
                            variantId: '42972732358758',
                            productId: '7698314297446',
                            quantity: 1,
                            linePrice: 34.99,
                        },
                    ],
                },
                settings: {
                    maxFollowUpMessages: 1,
                    smsSenderNumber: '+18773983515',
                    smsSenderIntegrationId: 334789,
                    offerDiscount: true,
                    maxDiscountPercent: 25,
                    brandName: 'artemisathletix',
                    optOutMessage: 'Reply STOP to unsubscribe',
                    discountCodeMessageThreshold: 1,
                },
            }

            const mockResponse = {
                message: 'Dispatch operation successful',
                data: {
                    ticketId: '1756199485200',
                    executionId: '0198e5a5-805e-76be-92d8-3e566f2026b8',
                },
            }

            ;(createContextAndTriggerAIJourney as jest.Mock).mockResolvedValue(
                mockResponse,
            )

            const { result } = renderHook(() => useTriggerAIJourney(), {
                wrapper,
            })

            expect(result.current.isLoading).toBe(false)
            expect(result.current.isError).toBe(false)

            result.current.mutate([mockOptions, undefined])

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(createContextAndTriggerAIJourney).toHaveBeenCalledWith(
                expect.objectContaining({
                    accountId: 6069,
                    storeIntegrationId: 33858,
                    storeName: 'artemisathletix',
                    journeyId: '01JZAPAD606K1JSKNHC8KVA4BD',
                    testModeSessionId: '90a2b7b2-e936-4208-ad28-706611c1f9b6',
                }),
                undefined,
            )
            expect(result.current.data).toEqual(mockResponse)
        })
    })
})
