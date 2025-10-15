import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { useFlag } from 'core/flags'
import {
    AiAgentMessageType,
    MessageType,
    TestSessionLogType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import { DEFAULT_PLAYGROUND_CUSTOMER } from 'pages/aiAgent/constants'

import { playgroundMessageFixture } from '../../../fixtures/playgroundMessages.fixture'
import { getStoreConfigurationFixture } from '../../../fixtures/storeConfiguration.fixtures'
import { getSubmitPlaygroundTicketResponseFixture } from '../../../fixtures/submitPlaygroundTicketResponse.fixture'
import { usePlaygroundApi } from '../usePlaygroundApi'
import { usePlaygroundMessages } from '../usePlaygroundMessages'
import { usePlaygroundPolling } from '../usePlaygroundPolling'
import { useTestSession } from '../useTestSession'

// Mock the hooks
jest.mock('../usePlaygroundApi', () => ({
    usePlaygroundApi: jest.fn(),
}))
const mockedUsePlaygroundApi = jest.mocked(usePlaygroundApi)

jest.mock('../usePlaygroundPolling', () => ({
    usePlaygroundPolling: jest.fn(),
}))
const mockedUsePlaygroundPolling = jest.mocked(usePlaygroundPolling)

jest.mock('../useTestSession', () => ({
    useTestSession: jest.fn(),
}))
const mockedUseTestSession = jest.mocked(useTestSession)

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockedUseFlag = jest.mocked(useFlag)

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

const mockUsePlaygroundContextFn = jest.fn()

jest.mock('../../contexts/PlaygroundContext', () => ({
    ...jest.requireActual('../../contexts/PlaygroundContext'),
    usePlaygroundContext: () => mockUsePlaygroundContextFn(),
}))

const mockedUsePlaygroundContext = mockUsePlaygroundContextFn

const defaultParams = {
    storeData: getStoreConfigurationFixture(),
    gorgiasDomain: 'acme',
    accountId: 1,
    httpIntegrationId: 1,
    channel: 'email' as const,
    channelIntegrationId: 123,
    events: {
        on: jest.fn(() => jest.fn()),
        emit: jest.fn(),
    },
}

describe('usePlaygroundMessages hook', () => {
    beforeEach(() => {
        // Setup mocks for each test
        const submitMessageMock = jest.fn(() =>
            Promise.resolve(getSubmitPlaygroundTicketResponseFixture()),
        )

        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: submitMessageMock,
            isSubmitting: false,
            abortCurrentRequest: jest.fn(),
        })

        mockedUseTestSession.mockReturnValue({
            testSessionId: '123',
            createTestSession: jest.fn(() => Promise.resolve('123')),
            isTestSessionLoading: false,
        })

        mockedUseFlag.mockReturnValue(false)

        mockedUsePlaygroundContext.mockImplementation(
            () =>
                ({
                    storeConfiguration: {},
                    snippetHelpCenterId: 123,
                    httpIntegrationId: 456,
                    baseUrl: 'https://test.com',
                    gorgiasDomain: 'test.gorgias.com',
                    accountId: 789,
                    chatIntegrationId: 101,
                    events: {
                        on: jest.fn(() => jest.fn()),
                        emit: jest.fn(),
                    },
                    uiState: {
                        isInitialMessage: true,
                        setIsInitialMessage: jest.fn(),
                    },
                    channelState: {
                        channel: 'email',
                        channelAvailability: 'online',
                        onChannelChange: jest.fn(),
                        onChannelAvailabilityChange: jest.fn(),
                    },
                    messagesState: {
                        messages: [],
                        onMessageSend: jest.fn(),
                        isMessageSending: false,
                        onNewConversation: jest.fn(),
                        isWaitingResponse: false,
                    },
                }) as any,
        )

        mockedUsePlaygroundPolling.mockReturnValue({
            isPolling: false,
            startPolling: jest.fn(),
            stopPolling: jest.fn(),
            testSessionLogs: undefined,
        })

        jest.useFakeTimers().setSystemTime(new Date('2020-01-01'))
    })

    it('should submit a message', async () => {
        const submitMessageMock = jest.fn(() =>
            Promise.resolve(getSubmitPlaygroundTicketResponseFixture()),
        )

        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: submitMessageMock,
            isSubmitting: false,
            abortCurrentRequest: jest.fn(),
        })

        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )

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
            storeData: defaultParams.storeData,
            channelAvailability: undefined,
            testSessionId: '123',
            createTestSession: expect.any(Function),
        })

        expect(result.current.messages.length).toBe(2)
    })

    it('should handle errors during message submission', async () => {
        const errorMock = new Error('Submission failed')

        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: jest.fn(() => Promise.reject(errorMock)),
            isSubmitting: false,
            abortCurrentRequest: jest.fn(),
        })

        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )

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

        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )

        act(() => {
            result.current.onNewConversation()
        })

        expect(abortMock).toHaveBeenCalled()
        expect(result.current.messages.length).toBe(0)
    })

    it('should update waiting response state based on action display', async () => {
        const response = getSubmitPlaygroundTicketResponseFixture({
            postProcessing: {
                internalNote: '',
                htmlReply: null,
                chatTicketMessageMeta: {
                    ai_agent_message_type:
                        AiAgentMessageType.WAIT_FOR_CLOSE_TICKET_CONFIRMATION,
                },
                isSalesOpportunity: false,
            },
        })

        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: jest.fn(() => Promise.resolve(response)),
            isSubmitting: false,
            abortCurrentRequest: jest.fn(),
        })

        const { result } = renderHook(() =>
            usePlaygroundMessages({
                ...defaultParams,
                channel: 'chat',
            }),
        )

        await act(async () => {
            await result.current.onMessageSend(playgroundMessageFixture, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })

        expect(result.current.isWaitingResponse).toBeTruthy()
    })

    it('should not add internal note when postProcess internal note is empty string', async () => {
        const response = getSubmitPlaygroundTicketResponseFixture({
            postProcessing: {
                internalNote: '',
                htmlReply: 'reply',
                isSalesOpportunity: false,
            },
        })

        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: jest.fn(() => Promise.resolve(response)),
            isSubmitting: false,
            abortCurrentRequest: jest.fn(),
        })

        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )

        await act(async () => {
            await result.current.onMessageSend(playgroundMessageFixture, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })

        const messageTypes = result.current.messages.map((m) => m.type)
        expect(messageTypes).not.toContain('INTERNAL_NOTE')
    })

    it('should add internal note when postProcess internal note is not empty string', async () => {
        const response = getSubmitPlaygroundTicketResponseFixture({
            postProcessing: {
                internalNote: 'internal note',
                htmlReply: 'reply',
                isSalesOpportunity: false,
            },
        })

        mockedUsePlaygroundApi.mockReturnValue({
            submitMessage: jest.fn(() => Promise.resolve(response)),
            isSubmitting: false,
            abortCurrentRequest: jest.fn(),
        })

        const { result } = renderHook(() =>
            usePlaygroundMessages(defaultParams),
        )

        await act(async () => {
            await result.current.onMessageSend(playgroundMessageFixture, {
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
            })
        })

        const messageTypes = result.current.messages.map((m) => m.type)
        expect(messageTypes).toContain('INTERNAL_NOTE')
    })

    describe('test session logs', () => {
        it('should process test session logs and add them to messages', async () => {
            // Mock the new architecture flag
            mockedUseFlag.mockReturnValue(true)

            // Mock initial state
            mockedUsePlaygroundPolling.mockReturnValue({
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: undefined,
            })

            const { result, rerender } = renderHook(() =>
                usePlaygroundMessages(defaultParams),
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

            mockedUsePlaygroundPolling.mockReturnValue({
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
                usePlaygroundMessages(defaultParams),
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

            mockedUsePlaygroundPolling.mockReturnValue({
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

            mockedUsePlaygroundPolling.mockReturnValue({
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
                usePlaygroundMessages(defaultParams),
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

            mockedUsePlaygroundPolling.mockReturnValue({
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

            mockedUsePlaygroundPolling.mockReturnValue({
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
                usePlaygroundMessages(defaultParams),
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

            mockedUsePlaygroundPolling.mockReturnValue({
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

        it('should start polling when sending message with new agentic architecture', async () => {
            // Enable the flag for new architecture
            mockedUseFlag.mockReturnValue(true)

            const startPollingMock = jest.fn()
            mockedUsePlaygroundPolling.mockReturnValue({
                isPolling: false,
                startPolling: startPollingMock,
                stopPolling: jest.fn(),
                testSessionLogs: undefined,
            })

            const { result } = renderHook(() =>
                usePlaygroundMessages(defaultParams),
            )

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
