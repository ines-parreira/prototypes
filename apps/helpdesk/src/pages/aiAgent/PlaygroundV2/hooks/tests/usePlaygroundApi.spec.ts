import { renderHook } from '@repo/testing'

import {
    useSubmitPlaygroundTicket,
    useSubmitTestModeMessageMutation,
} from 'models/aiAgent/queries'
import type { StoreConfiguration } from 'models/aiAgent/types'
import {
    DEFAULT_PLAYGROUND_CUSTOMER,
    PLAYGROUND_CUSTOMER_MOCK,
} from 'pages/aiAgent/constants'
import { playgroundCustomerMessage } from 'pages/aiAgent/fixtures/playgroundMessages.fixture'

import { useCoreContext } from '../../contexts/CoreContext'
import { getTicketCustomer } from '../../utils/playground-ticket.util'
import { usePlaygroundApi } from '../usePlaygroundApi'

// Mock dependencies
jest.mock('models/aiAgent/queries', () => ({
    useSubmitPlaygroundTicket: jest.fn(),
    useSubmitTestModeMessageMutation: jest.fn(),
}))

jest.mock('../../utils/playground-ticket.util', () => ({
    getTicketCustomer: jest.fn(),
}))

jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))

jest.mock('../../contexts/CoreContext', () => ({
    useCoreContext: jest.fn(),
}))

const mockSubmitPlaygroundTicket = jest.fn()
const mockSubmitTestModeMessage = jest.fn()
const mockedUseSubmitPlaygroundTicket = jest.mocked(useSubmitPlaygroundTicket)
const mockedUseSubmitTestModeMessageMutation = jest.mocked(
    useSubmitTestModeMessageMutation,
)
const mockedGetTicketCustomer = jest.mocked(getTicketCustomer)
const mockedUseCoreContext = jest.mocked(useCoreContext)

let abortControllerMock = jest.fn()

const defaultParams = {
    gorgiasDomain: 'acme',
    accountId: 123,
    httpIntegrationId: 456,
    channelIntegrationId: 789,
    isNewAgenticArchitectureEnabled: false,
}

describe('usePlaygroundApi', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseSubmitPlaygroundTicket.mockReturnValue({
            mutateAsync: mockSubmitPlaygroundTicket,
            isLoading: false,
        } as any)

        mockSubmitPlaygroundTicket.mockResolvedValue({
            data: { _action_serialized_state: 'serialized_state_value' },
        })

        mockedUseSubmitTestModeMessageMutation.mockReturnValue({
            mutateAsync: mockSubmitTestModeMessage,
            isLoading: false,
        } as any)

        mockSubmitTestModeMessage.mockResolvedValue({
            sessionId: 'session-123',
            workflow: { workflowId: 'wf-1' },
        })

        mockedGetTicketCustomer.mockResolvedValue(PLAYGROUND_CUSTOMER_MOCK)

        mockedUseCoreContext.mockReturnValue({
            draftKnowledge: undefined,
            useV3: false,
            areActionsEnabled: false,
        } as any)

        // Mock AbortController
        global.AbortController = jest.fn().mockImplementation(() => ({
            abort: abortControllerMock,
            signal: {},
        }))
    })

    const defaultProps = {
        ...defaultParams,
        storeData: { storeName: 'Test Store' } as StoreConfiguration,
    }

    it('should initialize and return expected functions', () => {
        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        expect(result.current).toHaveProperty('submitMessage')
        expect(result.current).toHaveProperty('isSubmitting')
        expect(result.current).toHaveProperty('abortCurrentRequest')
        expect(typeof result.current.submitMessage).toBe('function')
        expect(typeof result.current.abortCurrentRequest).toBe('function')
    })

    it('should abort ongoing request when abortCurrentRequest is called', async () => {
        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            subject: 'Test Subject',
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            channelAvailability: undefined,
            testSessionId: null,
            createTestSession: jest.fn(),
        })

        result.current.abortCurrentRequest()

        expect(abortControllerMock).toHaveBeenCalled()
    })

    it('should submit message', async () => {
        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            subject: 'Test Subject',
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            channelAvailability: undefined,
            testSessionId: null,
            createTestSession: jest.fn(),
        })

        expect(mockSubmitPlaygroundTicket).toHaveBeenCalled()
    })

    it('should use mock customer when getTicketCustomer fails', async () => {
        mockedGetTicketCustomer.mockRejectedValue(
            new Error('Failed to get customer'),
        )

        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            testSessionId: '',
            createTestSession: jest.fn(),
        })

        expect(mockSubmitPlaygroundTicket).toHaveBeenCalledWith([
            expect.objectContaining({
                customer: PLAYGROUND_CUSTOMER_MOCK,
            }),
            '',
            expect.any(Object),
        ])
    })

    it('should create new test session when isNewAgenticArchitectureEnabled is true and it is the first customer message', async () => {
        const createTestSession = jest.fn().mockResolvedValue('new-session-id')

        const { result } = renderHook(() =>
            usePlaygroundApi({
                ...defaultProps,
                isNewAgenticArchitectureEnabled: true,
            }),
        )

        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            testSessionId: 'existing-session-id',
            createTestSession,
        })

        expect(createTestSession).toHaveBeenCalled()
        expect(mockSubmitPlaygroundTicket).toHaveBeenCalledWith([
            expect.any(Object),
            'new-session-id',
            expect.any(Object),
        ])
    })

    it('should use existing test session when not the first customer message', async () => {
        const createTestSession = jest.fn().mockResolvedValue('new-session-id')

        const { result } = renderHook(() =>
            usePlaygroundApi({
                ...defaultProps,
                isNewAgenticArchitectureEnabled: true,
            }),
        )

        // Create a conversation with both AI and customer messages
        const messages = [
            playgroundCustomerMessage, // Customer message
            playgroundCustomerMessage, // Customer message
        ]

        await result.current.submitMessage({
            messages,
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            testSessionId: 'existing-session-id',
            createTestSession,
        })

        expect(createTestSession).not.toHaveBeenCalled()
        expect(mockSubmitPlaygroundTicket).toHaveBeenCalledWith([
            expect.any(Object),
            'existing-session-id',
            expect.any(Object),
        ])
    })

    it('should include empty _knowledge_override_rules when draftKnowledge is undefined', async () => {
        mockedUseCoreContext.mockReturnValue({
            draftKnowledge: undefined,
            useV3: false,
            areActionsEnabled: false,
        } as any)

        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            testSessionId: '',
            createTestSession: jest.fn(),
        })

        expect(mockSubmitPlaygroundTicket).toHaveBeenCalledWith([
            expect.objectContaining({
                _knowledge_override_rules: [],
            }),
            '',
            expect.any(Object),
        ])
    })

    it('should include _knowledge_override_rules when draftKnowledge is provided', async () => {
        const draftKnowledge = {
            sourceId: 123,
            sourceSetId: 456,
        }

        mockedUseCoreContext.mockReturnValue({
            draftKnowledge,
            useV3: false,
        } as any)

        const { result } = renderHook(() => usePlaygroundApi(defaultProps))

        await result.current.submitMessage({
            messages: [playgroundCustomerMessage],
            customer: DEFAULT_PLAYGROUND_CUSTOMER,
            channel: 'email',
            storeData: { storeName: 'Test Store' } as StoreConfiguration,
            testSessionId: '',
            createTestSession: jest.fn(),
        })

        expect(mockSubmitPlaygroundTicket).toHaveBeenCalledWith([
            expect.objectContaining({
                _knowledge_override_rules: [
                    {
                        name: 'overridesLiveKnowledgeWithDraftKnowledge',
                        knowledge: [
                            {
                                sourceId: 123,
                                sourceSetId: 456,
                            },
                        ],
                    },
                ],
            }),
            '',
            expect.any(Object),
        ])
    })

    describe('V3 offline eval flow', () => {
        beforeEach(() => {
            mockedUseCoreContext.mockReturnValue({
                draftKnowledge: undefined,
                useV3: true,
                areActionsEnabled: false,
            } as any)
        })

        it('creates a session with offline eval payload when no session exists and submits via new API', async () => {
            const createTestSession = jest.fn().mockResolvedValue('v3-session')

            const { result } = renderHook(() => usePlaygroundApi(defaultProps))

            await result.current.submitMessage({
                messages: [playgroundCustomerMessage],
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
                channel: 'chat',
                storeData: { storeName: 'Test Store' } as StoreConfiguration,
                testSessionId: null,
                createTestSession,
            })

            expect(createTestSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    areActionsAllowedToExecute: false,
                    offlineEvalSettings: expect.objectContaining({
                        app: expect.objectContaining({
                            shopName: 'Test Store',
                            gorgiasDomain: 'acme',
                        }),
                        session: expect.objectContaining({ channel: 'chat' }),
                    }),
                }),
            )
            expect(mockSubmitTestModeMessage).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({
                    sessionId: 'v3-session',
                    isDirectModelCall: false,
                    userMessage: expect.objectContaining({
                        type: 'message',
                        role: 'user',
                    }),
                }),
            ])
            expect(mockSubmitPlaygroundTicket).not.toHaveBeenCalled()
        })

        it('passes areActionsEnabled from context into the offline eval payload', async () => {
            mockedUseCoreContext.mockReturnValue({
                draftKnowledge: undefined,
                useV3: true,
                areActionsEnabled: true,
            } as any)

            const createTestSession = jest.fn().mockResolvedValue('v3-session')

            const { result } = renderHook(() => usePlaygroundApi(defaultProps))

            await result.current.submitMessage({
                messages: [playgroundCustomerMessage],
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
                channel: 'chat',
                storeData: { storeName: 'Test Store' } as StoreConfiguration,
                testSessionId: null,
                createTestSession,
            })

            expect(createTestSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    areActionsAllowedToExecute: true,
                }),
            )
        })

        it('skips session creation and submits via new API when session already exists', async () => {
            const createTestSession = jest.fn()

            const { result } = renderHook(() => usePlaygroundApi(defaultProps))

            await result.current.submitMessage({
                messages: [playgroundCustomerMessage],
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
                channel: 'email',
                storeData: { storeName: 'Test Store' } as StoreConfiguration,
                testSessionId: 'existing-v3-session',
                createTestSession,
            })

            expect(createTestSession).not.toHaveBeenCalled()
            expect(mockSubmitTestModeMessage).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({ sessionId: 'existing-v3-session' }),
            ])
            expect(mockSubmitPlaygroundTicket).not.toHaveBeenCalled()
        })

        it('returns undefined for V3 path', async () => {
            const { result } = renderHook(() => usePlaygroundApi(defaultProps))

            const response = await result.current.submitMessage({
                messages: [playgroundCustomerMessage],
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
                channel: 'email',
                storeData: { storeName: 'Test Store' } as StoreConfiguration,
                testSessionId: 'v3-session',
                createTestSession: jest.fn(),
            })

            expect(response).toBeUndefined()
        })

        it('still submits via new API with null session ID when session creation returns null', async () => {
            const createTestSession = jest.fn().mockResolvedValue(null)

            const { result } = renderHook(() => usePlaygroundApi(defaultProps))

            await result.current.submitMessage({
                messages: [playgroundCustomerMessage],
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
                channel: 'email',
                storeData: { storeName: 'Test Store' } as StoreConfiguration,
                testSessionId: null,
                createTestSession,
            })

            expect(mockSubmitTestModeMessage).toHaveBeenCalledWith([
                undefined,
                expect.objectContaining({ sessionId: null }),
            ])
            expect(mockSubmitPlaygroundTicket).not.toHaveBeenCalled()
        })

        it('includes chatConfig in offline eval payload when channel is chat and channelIntegrationId is set', async () => {
            const createTestSession = jest.fn().mockResolvedValue('v3-session')

            const { result } = renderHook(() => usePlaygroundApi(defaultProps))

            await result.current.submitMessage({
                messages: [playgroundCustomerMessage],
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
                channel: 'chat',
                storeData: { storeName: 'Test Store' } as StoreConfiguration,
                channelAvailability: 'offline',
                testSessionId: null,
                createTestSession,
            })

            expect(createTestSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    offlineEvalSettings: expect.objectContaining({
                        chatConfig: {
                            availability: 'offline',
                            integrationId: defaultParams.channelIntegrationId,
                        },
                    }),
                }),
            )
        })

        it('defaults chatConfig availability to online when channelAvailability is undefined', async () => {
            const createTestSession = jest.fn().mockResolvedValue('v3-session')

            const { result } = renderHook(() => usePlaygroundApi(defaultProps))

            await result.current.submitMessage({
                messages: [playgroundCustomerMessage],
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
                channel: 'chat',
                storeData: { storeName: 'Test Store' } as StoreConfiguration,
                channelAvailability: undefined,
                testSessionId: null,
                createTestSession,
            })

            expect(createTestSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    offlineEvalSettings: expect.objectContaining({
                        chatConfig: expect.objectContaining({
                            availability: 'online',
                        }),
                    }),
                }),
            )
        })

        it('omits chatConfig from offline eval payload when channel is not chat', async () => {
            const createTestSession = jest.fn().mockResolvedValue('v3-session')

            const { result } = renderHook(() => usePlaygroundApi(defaultProps))

            await result.current.submitMessage({
                messages: [playgroundCustomerMessage],
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
                channel: 'email',
                storeData: { storeName: 'Test Store' } as StoreConfiguration,
                testSessionId: null,
                createTestSession,
            })

            expect(createTestSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    offlineEvalSettings: expect.not.objectContaining({
                        chatConfig: expect.anything(),
                    }),
                }),
            )
        })

        it('includes knowledgeOverrideRules in offline eval payload when draftKnowledge is set', async () => {
            const draftKnowledge = { sourceId: 10, sourceSetId: 20 }
            mockedUseCoreContext.mockReturnValue({
                draftKnowledge,
                useV3: true,
                areActionsEnabled: false,
            } as any)

            const createTestSession = jest.fn().mockResolvedValue('v3-session')

            const { result } = renderHook(() => usePlaygroundApi(defaultProps))

            await result.current.submitMessage({
                messages: [playgroundCustomerMessage],
                customer: DEFAULT_PLAYGROUND_CUSTOMER,
                channel: 'email',
                storeData: { storeName: 'Test Store' } as StoreConfiguration,
                testSessionId: null,
                createTestSession,
            })

            expect(createTestSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    offlineEvalSettings: expect.objectContaining({
                        knowledgeOverrideRules: [
                            {
                                name: 'overridesLiveKnowledgeWithDraftKnowledge',
                                knowledge: [
                                    {
                                        sourceId: 10,
                                        sourceSetId: 20,
                                    },
                                ],
                            },
                        ],
                    }),
                }),
            )
        })
    })
})
