import { useFlag } from '@repo/feature-flags'
import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import {
    MessageType,
    TestSessionLogType,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import { useGetCustomer } from 'models/customer/queries'
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

jest.mock('models/customer/queries', () => ({
    useGetCustomer: jest.fn(),
}))
const mockedUseGetCustomer = jest.mocked(useGetCustomer)

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
const mockUseSettingsContextFn = jest.fn()

jest.mock('../../contexts/ConfigurationContext', () => ({
    useConfigurationContext: () => mockUseConfigurationContextFn(),
}))

jest.mock('../../contexts/CoreContext', () => ({
    useCoreContext: () => mockUseCoreContextFn(),
}))

jest.mock('../../contexts/EventsContext', () => ({
    useSubscribeToEvent: (...args: any[]) => mockUseRegisterEventFn(...args),
}))

jest.mock('../../contexts/SettingsContext', () => ({
    useSettingsContext: () => mockUseSettingsContextFn(),
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
    smsIntegrationId: undefined,
    emailIntegrationId: 456,
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

        mockUseSettingsContextFn.mockReturnValue({
            selectedCustomer: DEFAULT_PLAYGROUND_CUSTOMER,
            setSettings: jest.fn(),
        })

        mockedUseGetCustomer.mockReturnValue({
            data: undefined,
            error: null,
            isLoading: false,
        } as any)

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

        it('should use emailIntegrationId from configuration context when channel is email', () => {
            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                channel: 'email',
            } as any)

            renderHook(() => usePlaygroundMessages())

            expect(mockedUsePlaygroundApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    channelIntegrationId:
                        defaultConfigurationContext.emailIntegrationId,
                }),
            )
        })

        it('should use smsIntegrationId from configuration context when channel is sms', () => {
            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                channel: 'sms',
            } as any)
            mockUseConfigurationContextFn.mockReturnValue({
                ...defaultConfigurationContext,
                smsIntegrationId: 555,
            })

            renderHook(() => usePlaygroundMessages())

            expect(mockedUsePlaygroundApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    channelIntegrationId: 555,
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

        it('should pass undefined channelIntegrationId for email channel when emailIntegrationId is not configured', () => {
            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                channel: 'email',
            } as any)
            mockUseConfigurationContextFn.mockReturnValue({
                ...defaultConfigurationContext,
                emailIntegrationId: undefined,
            })

            renderHook(() => usePlaygroundMessages())

            expect(mockedUsePlaygroundApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    channelIntegrationId: undefined,
                }),
            )
        })
    })

    describe('playgroundUseCase resolution', () => {
        it("passes 'ai_journey' when settings mode is outbound", () => {
            mockUseSettingsContextFn.mockReturnValue({
                selectedCustomer: DEFAULT_PLAYGROUND_CUSTOMER,
                setSettings: jest.fn(),
                mode: 'outbound',
            })

            renderHook(() => usePlaygroundMessages())

            expect(mockedUsePlaygroundApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    playgroundUseCase: 'ai_journey',
                }),
            )
        })

        it("passes 'ai_agent' when settings mode is inbound", () => {
            mockUseSettingsContextFn.mockReturnValue({
                selectedCustomer: DEFAULT_PLAYGROUND_CUSTOMER,
                setSettings: jest.fn(),
                mode: 'inbound',
            })

            renderHook(() => usePlaygroundMessages())

            expect(mockedUsePlaygroundApi).toHaveBeenCalledWith(
                expect.objectContaining({
                    playgroundUseCase: 'ai_agent',
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

        it('should drop the optimistic shopper message when the matching SHOPPER_MESSAGE log arrives', async () => {
            mockedUseFlag.mockReturnValue(true)

            const submitMessageMock = jest.fn(() => Promise.resolve())
            mockedUsePlaygroundApi.mockReturnValue({
                submitMessage: submitMessageMock,
                isSubmitting: false,
                abortCurrentRequest: jest.fn(),
            })

            const { result, rerender } = renderHook(() =>
                usePlaygroundMessages(),
            )

            // Send an optimistic shopper message
            await act(async () => {
                await result.current.onMessageSend(
                    {
                        id: '00000000-0000-0000-0000-000000000000',
                        type: MessageType.MESSAGE,
                        sender: DEFAULT_PLAYGROUND_CUSTOMER.name as string,
                        content: 'Where is my order?',
                        createdDatetime: '2023-03-15T11:59:00Z',
                    },
                    { customer: DEFAULT_PLAYGROUND_CUSTOMER },
                )
            })

            // Polling returns the same shopper message with a real log id
            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: {
                    id: '123',
                    status: 'in-progress' as const,
                    logs: [
                        {
                            id: 'shopper-log-1',
                            accountId: 456,
                            testModeSessionId: 'session-123',
                            aiAgentExecutionId: 'exec-123',
                            type: TestSessionLogType.SHOPPER_MESSAGE,
                            createdDatetime: '2023-03-15T12:00:00Z',
                            data: {
                                message: 'Where is my order?',
                                isSalesOpportunity: false,
                                isSalesDiscount: false,
                                isSalesOpportunityFieldId: null,
                                isSalesDiscountFieldId: null,
                                outcome: TicketOutcome.WAIT,
                                customerId: '0',
                            },
                        },
                    ],
                },
            })

            rerender()

            const messageEntries = result.current.messages.filter(
                (m) => m.type === MessageType.MESSAGE,
            )
            expect(messageEntries).toHaveLength(1)
            expect((messageEntries[0] as { id?: string }).id).toBe(
                'shopper-log-1',
            )
            expect((messageEntries[0] as { content: string }).content).toBe(
                'Where is my order?',
            )
        })

        it('should sync the selected customer with the latest non-zero shopper customerId', async () => {
            mockedUseFlag.mockReturnValue(true)

            const setSettingsMock = jest.fn()
            mockUseSettingsContextFn.mockReturnValue({
                selectedCustomer: DEFAULT_PLAYGROUND_CUSTOMER,
                setSettings: setSettingsMock,
            })

            mockedUseGetCustomer.mockReturnValue({
                data: {
                    data: {
                        id: 42,
                        email: 'jane@example.com',
                        name: 'Jane Doe',
                        firstname: 'Jane',
                        lastname: 'Doe',
                    },
                },
                error: null,
                isLoading: false,
            } as any)

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: {
                    id: '123',
                    status: 'in-progress' as const,
                    logs: [
                        {
                            id: 'shopper-log-1',
                            accountId: 1,
                            testModeSessionId: '123',
                            aiAgentExecutionId: 'exec-1',
                            type: TestSessionLogType.SHOPPER_MESSAGE,
                            createdDatetime: '2023-03-15T12:00:00Z',
                            data: {
                                message: 'hi',
                                isSalesOpportunity: false,
                                isSalesDiscount: false,
                                isSalesOpportunityFieldId: null,
                                isSalesDiscountFieldId: null,
                                outcome: TicketOutcome.WAIT,
                                customerId: '42',
                            },
                        },
                    ],
                },
            })

            renderHook(() => usePlaygroundMessages())

            expect(mockedUseGetCustomer).toHaveBeenCalledWith(42, {
                enabled: true,
            })
            expect(setSettingsMock).toHaveBeenCalledWith({
                selectedCustomer: {
                    id: 42,
                    email: 'jane@example.com',
                    name: 'Jane Doe',
                },
            })
        })

        it('should not fetch a customer when the latest shopper customerId is "0"', async () => {
            mockedUseFlag.mockReturnValue(true)

            const setSettingsMock = jest.fn()
            mockUseSettingsContextFn.mockReturnValue({
                selectedCustomer: DEFAULT_PLAYGROUND_CUSTOMER,
                setSettings: setSettingsMock,
            })

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: {
                    id: '123',
                    status: 'in-progress' as const,
                    logs: [
                        {
                            id: 'shopper-log-1',
                            accountId: 1,
                            testModeSessionId: '123',
                            aiAgentExecutionId: 'exec-1',
                            type: TestSessionLogType.SHOPPER_MESSAGE,
                            createdDatetime: '2023-03-15T12:00:00Z',
                            data: {
                                message: 'hi',
                                isSalesOpportunity: false,
                                isSalesDiscount: false,
                                isSalesOpportunityFieldId: null,
                                isSalesDiscountFieldId: null,
                                outcome: TicketOutcome.WAIT,
                                customerId: '0',
                            },
                        },
                    ],
                },
            })

            renderHook(() => usePlaygroundMessages())

            expect(mockedUseGetCustomer).toHaveBeenCalledWith(0, {
                enabled: false,
            })
            expect(setSettingsMock).not.toHaveBeenCalled()
        })

        it('should pick the latest shopper customerId across multiple logs', async () => {
            mockedUseFlag.mockReturnValue(true)

            mockUseSettingsContextFn.mockReturnValue({
                selectedCustomer: DEFAULT_PLAYGROUND_CUSTOMER,
                setSettings: jest.fn(),
            })

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: {
                    id: '123',
                    status: 'in-progress' as const,
                    logs: [
                        {
                            id: 'shopper-log-1',
                            accountId: 1,
                            testModeSessionId: '123',
                            aiAgentExecutionId: 'exec-1',
                            type: TestSessionLogType.SHOPPER_MESSAGE,
                            createdDatetime: '2023-03-15T12:00:00Z',
                            data: {
                                message: 'hi',
                                isSalesOpportunity: false,
                                isSalesDiscount: false,
                                isSalesOpportunityFieldId: null,
                                isSalesDiscountFieldId: null,
                                outcome: TicketOutcome.WAIT,
                                customerId: '11',
                            },
                        },
                        {
                            id: 'shopper-log-2',
                            accountId: 1,
                            testModeSessionId: '123',
                            aiAgentExecutionId: 'exec-1',
                            type: TestSessionLogType.SHOPPER_MESSAGE,
                            createdDatetime: '2023-03-15T12:01:00Z',
                            data: {
                                message: 'hello again',
                                isSalesOpportunity: false,
                                isSalesDiscount: false,
                                isSalesOpportunityFieldId: null,
                                isSalesDiscountFieldId: null,
                                outcome: TicketOutcome.WAIT,
                                customerId: '99',
                            },
                        },
                    ],
                },
            })

            renderHook(() => usePlaygroundMessages())

            expect(mockedUseGetCustomer).toHaveBeenCalledWith(99, {
                enabled: true,
            })
        })

        it('should rewrite the fallback sender on existing messages once the customer resolves', () => {
            mockedUseFlag.mockReturnValue(true)

            // Start with the default customer; logs with customerId "42"
            // produce shopper messages whose sender falls back to "Customer".
            let currentSelectedCustomer: typeof DEFAULT_PLAYGROUND_CUSTOMER = {
                ...DEFAULT_PLAYGROUND_CUSTOMER,
            }
            mockUseSettingsContextFn.mockImplementation(() => ({
                selectedCustomer: currentSelectedCustomer,
                setSettings: jest.fn(),
            }))

            mockedUseCoreContext.mockReturnValue({
                ...defaultCoreContext,
                isPolling: true,
                startPolling: jest.fn(),
                stopPolling: jest.fn(),
                testSessionLogs: {
                    id: '123',
                    status: 'in-progress' as const,
                    logs: [
                        {
                            id: 'shopper-log-1',
                            accountId: 1,
                            testModeSessionId: '123',
                            aiAgentExecutionId: 'exec-1',
                            type: TestSessionLogType.SHOPPER_MESSAGE,
                            createdDatetime: '2023-03-15T12:00:00Z',
                            data: {
                                message: 'olá',
                                isSalesOpportunity: false,
                                isSalesDiscount: false,
                                isSalesOpportunityFieldId: null,
                                isSalesDiscountFieldId: null,
                                outcome: TicketOutcome.WAIT,
                                customerId: '42',
                            },
                        },
                    ],
                },
            })

            const { result, rerender } = renderHook(() =>
                usePlaygroundMessages(),
            )

            const messageEntries = result.current.messages.filter(
                (m) => m.type === MessageType.MESSAGE,
            )
            expect(messageEntries).toHaveLength(1)
            expect((messageEntries[0] as { sender: string }).sender).toBe(
                'Customer',
            )

            // Simulate the sync resolving the customer.
            currentSelectedCustomer = {
                id: 42,
                email: 'joao@example.com',
                name: 'João',
            }
            rerender()

            const updatedEntries = result.current.messages.filter(
                (m) => m.type === MessageType.MESSAGE,
            )
            expect((updatedEntries[0] as { sender: string }).sender).toBe(
                'João',
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
