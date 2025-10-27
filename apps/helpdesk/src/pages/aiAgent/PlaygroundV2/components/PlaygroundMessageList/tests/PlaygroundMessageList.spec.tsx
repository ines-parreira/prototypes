import { act, render, screen } from '@testing-library/react'

import { MessageType } from 'models/aiAgentPlayground/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import { useConfigurationContext } from '../../../contexts/ConfigurationContext'
import { useCoreContext } from '../../../contexts/CoreContext'
import { useMessagesContext } from '../../../contexts/MessagesContext'
import { PlaygroundMessageList } from '../PlaygroundMessageList'

jest.mock('../../../contexts/MessagesContext', () => ({
    useMessagesContext: jest.fn(),
}))

jest.mock('../../../contexts/ConfigurationContext', () => ({
    useConfigurationContext: jest.fn(),
}))

jest.mock('../../../contexts/CoreContext', () => ({
    useCoreContext: jest.fn(),
}))

jest.mock('../../PlaygroundInitialContent/PlaygroundInitialContent', () => ({
    PlaygroundInitialContent: () => <div>Initial Content</div>,
}))

jest.mock('../../PlaygroundMessage/PlaygroundMessage', () => ({
    __esModule: true,
    default: ({ message, children }: any) => (
        <div>
            <div>Message: {message.content || message.type}</div>
            {children}
        </div>
    ),
}))

jest.mock('../../KnowledgeSourcesWrapper/KnowledgeSourcesWrapper', () => ({
    __esModule: true,
    default: ({ executionId, outcome }: any) => (
        <div>
            KnowledgeSourcesWrapper - executionId: {executionId}, outcome:{' '}
            {outcome}
        </div>
    ),
}))

const mockUseMessagesContext = jest.mocked(useMessagesContext)
const mockUseConfigurationContext = jest.mocked(useConfigurationContext)
const mockUseCoreContext = jest.mocked(useCoreContext)

const defaultMessagesState = {
    messages: [],
    onMessageSend: jest.fn(),
    isMessageSending: false,
    onNewConversation: jest.fn(),
    isWaitingResponse: false,
}

const defaultConfigurationContext = {
    storeConfiguration: getStoreConfigurationFixture({
        storeName: 'test-store',
        guidanceHelpCenterId: 123,
    }),
    accountConfiguration: null,
    snippetHelpCenterId: 456,
    httpIntegrationId: 789,
    baseUrl: 'https://test-base-url.com',
    gorgiasDomain: 'test-domain',
    accountId: 123,
    chatIntegrationId: 456,
    shopName: 'test-store',
}

const defaultCoreContext = {
    channel: 'email' as const,
    channelAvailability: 'online' as const,
    onChannelChange: jest.fn(),
    onChannelAvailabilityChange: jest.fn(),
    testSessionId: 'test-session-123',
    isTestSessionLoading: false,
    createTestSession: jest.fn(),
    testSessionLogs: undefined,
    isPolling: false,
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
}

describe('PlaygroundMessageList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseMessagesContext.mockReturnValue(defaultMessagesState as any)
        mockUseConfigurationContext.mockReturnValue(
            defaultConfigurationContext as any,
        )
        mockUseCoreContext.mockReturnValue(defaultCoreContext as any)
    })

    describe('Empty state', () => {
        it('should render initial content when no messages', () => {
            render(<PlaygroundMessageList />)

            expect(screen.getByText('Initial Content')).toBeInTheDocument()
        })
    })

    describe('Messages rendering', () => {
        it('should render messages when present', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesState,
                messages: [
                    {
                        sender: 'Customer',
                        type: MessageType.MESSAGE,
                        content: 'Hello',
                        createdDatetime: new Date().toISOString(),
                    },
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'Hi there!',
                        createdDatetime: new Date().toISOString(),
                    },
                ],
            } as any)

            render(<PlaygroundMessageList />)

            expect(screen.getByText('Message: Hello')).toBeInTheDocument()
            expect(screen.getByText('Message: Hi there!')).toBeInTheDocument()
        })

        it('should render KnowledgeSourcesWrapper for AI Agent messages with executionId', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesState,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'Response',
                        executionId: 'exec-123',
                        createdDatetime: new Date().toISOString(),
                    },
                ],
            } as any)

            render(<PlaygroundMessageList />)

            expect(
                screen.getByText(
                    /KnowledgeSourcesWrapper - executionId: exec-123/,
                ),
            ).toBeInTheDocument()
        })

        it('should not render KnowledgeSourcesWrapper for messages without executionId', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesState,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'Response',
                        createdDatetime: new Date().toISOString(),
                    },
                ],
            } as any)

            render(<PlaygroundMessageList />)

            expect(
                screen.queryByText(/KnowledgeSourcesWrapper/),
            ).not.toBeInTheDocument()
        })

        it('should not render KnowledgeSourcesWrapper for non-MESSAGE type messages', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesState,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.TICKET_EVENT,
                        executionId: 'exec-123',
                        outcome: 'resolved',
                        createdDatetime: new Date().toISOString(),
                    },
                ],
            } as any)

            render(<PlaygroundMessageList />)

            expect(
                screen.queryByText(/KnowledgeSourcesWrapper/),
            ).not.toBeInTheDocument()
        })
    })

    describe('Ticket event outcome', () => {
        it('should pass outcome to KnowledgeSourcesWrapper when ticket event message exists', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesState,
                messages: [
                    {
                        sender: 'Customer',
                        type: MessageType.MESSAGE,
                        content: 'Hello',
                        createdDatetime: new Date().toISOString(),
                    },
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'Response',
                        executionId: 'exec-123',
                        createdDatetime: new Date().toISOString(),
                    },
                    {
                        sender: 'AI Agent',
                        type: MessageType.TICKET_EVENT,
                        outcome: 'resolved',
                        createdDatetime: new Date().toISOString(),
                    },
                ],
            } as any)

            render(<PlaygroundMessageList />)

            expect(
                screen.getByText(
                    /KnowledgeSourcesWrapper - executionId: exec-123, outcome: resolved/,
                ),
            ).toBeInTheDocument()
        })

        it('should pass undefined outcome when no ticket event message', () => {
            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesState,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'Response',
                        executionId: 'exec-123',
                        createdDatetime: new Date().toISOString(),
                    },
                ],
            } as any)

            render(<PlaygroundMessageList />)

            const knowledgeSourcesWrapper = screen.getByText((_, element) => {
                return (
                    element?.textContent ===
                    'KnowledgeSourcesWrapper - executionId: exec-123, outcome: '
                )
            })
            expect(knowledgeSourcesWrapper).toBeInTheDocument()
        })
    })

    describe('Auto-scroll behavior', () => {
        it('should scroll to bottom when messages are added', () => {
            const scrollIntoViewMock = jest.fn()
            HTMLDivElement.prototype.scrollIntoView = scrollIntoViewMock

            const { rerender } = render(<PlaygroundMessageList />)

            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesState,
                messages: [
                    {
                        sender: 'Customer',
                        type: MessageType.MESSAGE,
                        content: 'Hello',
                        createdDatetime: new Date().toISOString(),
                    },
                ],
            } as any)

            act(() => {
                rerender(<PlaygroundMessageList />)
            })

            expect(scrollIntoViewMock).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'end',
            })
        })

        it('should not scroll when no messages', () => {
            const scrollIntoViewMock = jest.fn()
            HTMLDivElement.prototype.scrollIntoView = scrollIntoViewMock

            render(<PlaygroundMessageList />)

            expect(scrollIntoViewMock).not.toHaveBeenCalled()
        })
    })

    describe('Store configuration', () => {
        it('should render without KnowledgeSourcesWrapper when storeConfiguration is undefined', () => {
            mockUseConfigurationContext.mockReturnValue({
                ...defaultConfigurationContext,
                storeConfiguration: null,
            } as any)

            mockUseMessagesContext.mockReturnValue({
                ...defaultMessagesState,
                messages: [
                    {
                        sender: 'AI Agent',
                        type: MessageType.MESSAGE,
                        content: 'Response',
                        executionId: 'exec-123',
                        createdDatetime: new Date().toISOString(),
                    },
                ],
            } as any)

            render(<PlaygroundMessageList />)

            expect(screen.getByText('Message: Response')).toBeInTheDocument()
            expect(
                screen.queryByText(/KnowledgeSourcesWrapper/),
            ).not.toBeInTheDocument()
        })
    })
})
