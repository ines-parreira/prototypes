import { useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import {
    MessageType,
    TestSessionLogType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import { DEFAULT_PLAYGROUND_CUSTOMER } from 'pages/aiAgent/constants'

import { playgroundMessageFixture } from '../../../fixtures/playgroundMessages.fixture'
import { getStoreConfigurationFixture } from '../../../fixtures/storeConfiguration.fixtures'
import { getTestSessionLogsWithDuplicateIdsFixture } from '../../fixtures/testSessionLogs.fixture'
import { usePlaygroundApi } from '../usePlaygroundApi'
import { usePlaygroundMessages } from '../usePlaygroundMessages'

// Mock the hooks
jest.mock('../usePlaygroundApi', () => ({
    usePlaygroundApi: jest.fn(),
}))
const mockedUsePlaygroundApi = jest.mocked(usePlaygroundApi)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockedUseFlag = jest.mocked(useFlag)

jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

const mockUseConfigurationContextFn = jest.fn()
const mockUseCoreContextFn = jest.fn()
const mockUseRegisterEventFn = jest.fn()

jest.mock('../../contexts/ConfigurationContext', () => ({
    useConfigurationContext: () => mockUseConfigurationContextFn(),
}))

jest.mock('../../contexts/CoreContext', () => ({
    useCoreContext: () => mockUseCoreContextFn(),
}))

jest.mock('../../contexts/EventsContext', () => ({
    useSubscribeToEvent: (...args: any[]) => mockUseRegisterEventFn(...args),
}))

const mockUseAIJourneyContextFn = jest.fn()

jest.mock('../../contexts/AIJourneyContext', () => ({
    useAIJourneyContext: () => mockUseAIJourneyContextFn(),
}))

const mockedUseConfigurationContext = mockUseConfigurationContextFn
const mockedUseCoreContext = mockUseCoreContextFn

const defaultConfigurationContext = {
    storeConfiguration: getStoreConfigurationFixture(),
    accountConfiguration: null,
    snippetHelpCenterId: 456,
    httpIntegrationId: 1,
    baseUrl: 'https://test.com',
    gorgiasDomain: 'acme',
    accountId: 1,
    chatIntegrationId: 123,
    shopName: 'test-store',
}

const defaultCoreContext = {
    channel: 'email' as const,
    channelAvailability: 'online' as const,
    onChannelChange: jest.fn(),
    onChannelAvailabilityChange: jest.fn(),
    testSessionId: '123',
    isTestSessionLoading: false,
    createTestSession: jest.fn(() => Promise.resolve('123')),
    clearTestSession: jest.fn(),
    testSessionLogs: undefined,
    isPolling: false,
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
}

describe('usePlaygroundMessages hook', () => {
    beforeEach(() => {
        // Setup mocks for each test
        const submitMessageMock = jest.fn(() => Promise.resolve())

        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: submitMessageMock,
            isSubmitting: false,
            abortCurrentRequest: jest.fn(),
        })

        mockedUseFlag.mockReturnValue(false)

        mockedUseConfigurationContext.mockReturnValue(
            defaultConfigurationContext as any,
        )

        mockedUseCoreContext.mockReturnValue(defaultCoreContext as any)

        mockUseAIJourneyContextFn.mockReturnValue({
            journeyConfiguration: undefined,
        })

        jest.useFakeTimers().setSystemTime(new Date('2020-01-01'))
    })

    it('should submit a message', async () => {
        const submitMessageMock = jest.fn(() => Promise.resolve())

        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: submitMessageMock,
            isSubmitting: false,
            abortCurrentRequest: jest.fn(),
        })

        const { result } = renderHook(() => usePlaygroundMessages())

        await act(async () => {
            await result.current.onMessageSend(playgroundMessageFixture, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })

        expect(submitMessageMock).toHaveBeenCalledWith({
            messages: expect.arrayContaining([
                expect.objectContaining({
                    content: playgroundMessageFixture.content,
                    createdDatetime: playgroundMessageFixture.createdDatetime,
                }),
            ]),
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            subject: undefined,
            channel: 'email',
            storeData: defaultConfigurationContext.storeConfiguration,
            channelAvailability: defaultCoreContext.channelAvailability,
            testSessionId: '123',
            createTestSession: expect.any(Function),
        })
    })

    it('should handle errors during message submission', async () => {
        const errorMock = new Error('Submission failed')

        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: jest.fn(() => Promise.reject(errorMock)),
            isSubmitting: false,
            abortCurrentRequest: jest.fn(),
        })

        const { result } = renderHook(() => usePlaygroundMessages())

        await act(async () => {
            await result.current.onMessageSend(playgroundMessageFixture, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })

        // Should have error message
        expect(result.current.messages.length).toBe(2)
        expect(result.current.messages[1].type).toBe(MessageType.ERROR)
    })

    it('should cancel previous request on new conversation', async () => {
        const abortMock = jest.fn()

        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: jest.fn(),
            isSubmitting: false,
            abortCurrentRequest: abortMock,
        })

        const { result } = renderHook(() => usePlaygroundMessages())

        act(() => {
            result.current.onNewConversation()
        })

        expect(abortMock).toHaveBeenCalled()
        expect(result.current.messages.length).toBe(0)
    })

    it('should clear the test session on new conversation', () => {
        const clearTestSessionMock = jest.fn()

        mockedUseCoreContext.mockReturnValue({
            ...defaultCoreContext,
            clearTestSession: clearTestSessionMock,
        } as any)

        const { result } = renderHook(() => usePlaygroundMessages())

        act(() => {
            result.current.onNewConversation()
        })

        expect(clearTestSessionMock).toHaveBeenCalled()
    })

    it('should not add internal note when postProcess internal note is empty string', async () => {
        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: jest.fn(() => Promise.resolve()),
            isSubmitting: false,
            abortCurrentRequest: jest.fn(),
        })

        const { result } = renderHook(() => usePlaygroundMessages())

        await act(async () => {
            await result.current.onMessageSend(playgroundMessageFixture, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })

        const messageTypes = result.current.messages.map((m) => m.type)
        expect(messageTypes).not.toContain('INTERNAL_NOTE')
    })

    describe('channelIntegrationId resolution', () => {
        it('should use sms_sender_integration_id from journey configuration when available', () => {
            mockUseAIJourneyContextFn.mockReturnValue({
                journeyConfiguration: {
                    sms_sender_integration_id: 999,
                },
            })

            renderHook(() => usePlaygroundMessages())

            expect(mockedUsePlaygroundApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    channelIntegrationId: 999,
                }),
            )
        })

        it('should fall back to chatIntegrationId when channel is chat and no journey configuration', () => {
            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                channel: 'chat',
            } as any)

            renderHook(() => usePlaygroundMessages())

            expect(mockedUsePlaygroundApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    channelIntegrationId:
                        defaultConfigurationContext.chatIntegrationId,
                }),
            )
        })

        it('should pass undefined channelIntegrationId for non-chat channel without journey configuration', () => {
            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                channel: 'email',
            } as any)

            renderHook(() => usePlaygroundMessages())

            expect(mockedUsePlaygroundApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    channelIntegrationId: undefined,
                }),
            )
        })

        it('should prefer journey configuration over chat channel integration id', () => {
            mockUseAIJourneyContextFn.mockReturnValue({
                journeyConfiguration: {
                    sms_sender_integration_id: 777,
                },
            })
            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                channel: 'chat',
            } as any)

            renderHook(() => usePlaygroundMessages())

            expect(mockedUsePlaygroundApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    channelIntegrationId: 777,
                }),
            )
        })
    })

    describe('test session logs', () => {
        it('should process test session logs and add them to messages', async () => {
            // Mock the new architecture flag
            mockedUseFlag.mockReturnValue(true)

            // Mock initial state
            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: undefined,
            })

            const { result, rerender } = renderHook(() =>
                usePlaygroundMessages(),
            )

            expect(result.current.messages.length).toBe(0)

            // Update with test session logs
            const testSessionLogs = {
                id: '123',
                status: 'in-progress' as const,
                logs: [
                    {
                        id: 'log-1',
                        accountId: 456,
                        testModeSessionId: 'session-123',
                        aiAgentExecutionId: 'exec-123',
                        type: TestSessionLogType.AI_AGENT_REPLY,
                        createdDatetime: '2023-03-15T12:00:00Z',
                        data: {
                            message: 'Reply message',
                            isSalesOpportunity: false,
                            isSalesDiscount: false,
                            isSalesOpportunityFieldId: null,
                            isSalesDiscountFieldId: null,
                            outcome: TicketOutcome.CLOSE,
                        },
                    },
                ],
            }

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs,
            })

            // Trigger re-render with new test session logs
            rerender()

            // Should have reply message + placeholder
            expect(result.current.messages.length).toBe(2)
            expect(result.current.messages[0].type).toBe(MessageType.MESSAGE)
            expect(
                (result.current.messages[0] as { content: string }).content,
            ).toBe('Reply message')
            expect(result.current.messages[1].type).toBe(
                MessageType.PLACEHOLDER,
            )
        })

        it('should remove placeholder when session is finished', async () => {
            mockedUseFlag.mockReturnValue(true)

            const { result, rerender } = renderHook(() =>
                usePlaygroundMessages(),
            )

            // Initial state with in-progress session
            const inProgressLogs = {
                id: '123',
                status: 'in-progress' as const,
                logs: [
                    {
                        id: 'log-1',
                        accountId: 456,
                        testModeSessionId: 'session-123',
                        aiAgentExecutionId: 'exec-123',
                        type: TestSessionLogType.AI_AGENT_REPLY,
                        createdDatetime: '2023-03-15T12:00:00Z',
                        data: {
                            message: 'Reply message',
                            isSalesOpportunity: false,
                            isSalesDiscount: false,
                            isSalesOpportunityFieldId: null,
                            isSalesDiscountFieldId: null,
                            outcome: TicketOutcome.CLOSE,
                        },
                    },
                ],
            }

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: inProgressLogs,
            })

            rerender()

            // Should have reply + placeholder
            expect(result.current.messages.length).toBe(2)
            expect(result.current.messages[1].type).toBe(
                MessageType.PLACEHOLDER,
            )

            // Update to finished session
            const finishedLogs = {
                ...inProgressLogs,
                status: 'finished' as const,
                logs: [
                    ...inProgressLogs.logs,
                    {
                        id: 'log-2',
                        accountId: 456,
                        testModeSessionId: 'session-123',
                        aiAgentExecutionId: 'exec-123',
                        type: TestSessionLogType.AI_AGENT_EXECUTION_FINISHED,
                        createdDatetime: '2023-03-15T12:01:00Z',
                        data: {
                            message: '',
                            isSalesOpportunity: false,
                            isSalesDiscount: false,
                            isSalesOpportunityFieldId: null,
                            isSalesDiscountFieldId: null,
                            outcome: TicketOutcome.CLOSE,
                        },
                    },
                ],
            }

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: false,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: finishedLogs,
            })

            rerender()

            // Should have reply + execution finished, no placeholder
            expect(result.current.messages.length).toBe(2)
            expect(result.current.messages[1].type).toBe(
                MessageType.TICKET_EVENT,
            )

            // isWaitingResponse should be false when session is finished
            expect(result.current.isWaitingResponse).toBe(false)
        })

        it('should not add duplicate messages for the same logs', async () => {
            mockedUseFlag.mockReturnValue(true)

            const { result, rerender } = renderHook(() =>
                usePlaygroundMessages(),
            )

            // Initial logs
            const testSessionLogs = {
                id: '123',
                status: 'in-progress' as const,
                logs: [
                    {
                        id: 'log-1',
                        accountId: 456,
                        testModeSessionId: 'session-123',
                        aiAgentExecutionId: 'exec-123',
                        type: TestSessionLogType.AI_AGENT_REPLY,
                        createdDatetime: '2023-03-15T12:00:00Z',
                        data: {
                            message: 'First reply message',
                            isSalesOpportunity: false,
                            isSalesDiscount: false,
                            isSalesOpportunityFieldId: null,
                            isSalesDiscountFieldId: null,
                            outcome: TicketOutcome.CLOSE,
                        },
                    },
                ],
            }

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs,
            })

            rerender()

            // Should have reply message + placeholder
            expect(result.current.messages.length).toBe(2)

            // Add a new log but keep the old one too
            const updatedLogs = {
                ...testSessionLogs,
                logs: [
                    ...testSessionLogs.logs,
                    {
                        id: 'log-2',
                        accountId: 456,
                        testModeSessionId: 'session-123',
                        aiAgentExecutionId: 'exec-123',
                        type: TestSessionLogType.AI_AGENT_REPLY,
                        createdDatetime: '2023-03-15T12:01:00Z',
                        data: {
                            message: 'Second reply message',
                            isSalesOpportunity: false,
                            isSalesDiscount: false,
                            isSalesOpportunityFieldId: null,
                            isSalesDiscountFieldId: null,
                            outcome: TicketOutcome.CLOSE,
                        },
                    },
                ],
            }

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: updatedLogs,
            })

            rerender()

            // Should only add the new message, not duplicate the first reply
            expect(result.current.messages.length).toBe(3)
            expect(result.current.messages[0].type).toBe(MessageType.MESSAGE)
            expect(result.current.messages[1].type).toBe(MessageType.MESSAGE)
            expect(
                (result.current.messages[0] as { content: string }).content,
            ).toBe('First reply message')
            expect(result.current.messages[1].type).toBe(MessageType.MESSAGE)
            expect(
                (result.current.messages[1] as { content: string }).content,
            ).toBe('Second reply message')
        })

        it('should handle null response from handleAiAgentTestSessionLog', async () => {
            mockedUseFlag.mockReturnValue(true)

            const { result, rerender } = renderHook(() =>
                usePlaygroundMessages(),
            )

            // Logs with an unknown type that will return null
            const testSessionLogs = {
                id: '123',
                status: 'in-progress' as const,
                logs: [
                    {
                        id: 'log-1',
                        accountId: 456,
                        testModeSessionId: 'session-123',
                        aiAgentExecutionId: 'exec-123',
                        type: 'unknown-type' as TestSessionLogType,
                        createdDatetime: '2023-03-15T12:00:00Z',
                        data: {
                            message: 'Unknown message',
                            isSalesOpportunity: false,
                            isSalesDiscount: false,
                            isSalesOpportunityFieldId: null,
                            isSalesDiscountFieldId: null,
                            outcome: TicketOutcome.CLOSE,
                        },
                    },
                ],
            }

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs,
            })

            rerender()

            // Should only have placeholder, unknown log type message is filtered out
            expect(result.current.messages.length).toBe(1)
            expect(result.current.messages[0].type).toBe(
                MessageType.PLACEHOLDER,
            )
        })

        it('should deduplicate logs with the same id within a single batch', async () => {
            mockedUseFlag.mockReturnValue(true)

            const { result, rerender } = renderHook(() =>
                usePlaygroundMessages(),
            )

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: getTestSessionLogsWithDuplicateIdsFixture(),
            })

            rerender()

            // Only one message + placeholder despite two logs with the same id
            const fixture = getTestSessionLogsWithDuplicateIdsFixture()
            expect(result.current.messages.length).toBe(2)
            expect(result.current.messages[0].type).toBe(MessageType.MESSAGE)
            expect(
                (result.current.messages[0] as { content: string }).content,
            ).toBe(fixture.logs[0].data.message)
            expect(result.current.messages[1].type).toBe(
                MessageType.PLACEHOLDER,
            )
        })

        it('should start polling when sending message with new agentic architecture', async () => {
            // Enable the flag for new architecture
            mockedUseFlag.mockReturnValue(true)

            const startPollingMock = jest.fn()
            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: false,
                startPolling: startPollingMock,
                stopPolling: jest.fn(),
                testSessionLogs: undefined,
            })

            const { result } = renderHook(() => usePlaygroundMessages())

            // Send a message
            await act(async () => {
                await result.current.onMessageSend(playgroundMessageFixture, {
                    customer: DEFAULT_PLAYGROUND_CUSTOMER,
                })
            })

            // Should start polling for test session logs
            expect(startPollingMock).toHaveBeenCalled()
        })
    })
})
