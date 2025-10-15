import React from 'react'

import { act, render, screen } from '@testing-library/react'

import { MessageType } from 'models/aiAgentPlayground/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { AI_AGENT_SENDER } from 'pages/aiAgent/PlaygroundV2/components/PlaygroundMessage/PlaygroundMessage'

import { usePlaygroundContext } from '../../../contexts/PlaygroundContext'
import { PlaygroundMessageList } from '../PlaygroundMessageList'

jest.mock('../../../contexts/PlaygroundContext', () => ({
    usePlaygroundContext: jest.fn(),
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

const mockUsePlaygroundContext = jest.mocked(usePlaygroundContext)

const defaultContext = {
    uiState: {
        isInitialMessage: true,
        setIsInitialMessage: jest.fn(),
    },
    channelState: {
        channel: 'email' as const,
        channelAvailability: 'online' as const,
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
    storeConfiguration: getStoreConfigurationFixture({
        storeName: 'test-store',
        guidanceHelpCenterId: 123,
    }),
    snippetHelpCenterId: 456,
    httpIntegrationId: 789,
    baseUrl: 'https://test-base-url.com',
    gorgiasDomain: 'test-domain',
    accountId: 123,
    chatIntegrationId: 456,
    events: {
        on: jest.fn(),
        emit: jest.fn(),
    },
}

describe('PlaygroundMessageList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUsePlaygroundContext.mockReturnValue(defaultContext as any)
    })

    describe('Empty state', () => {
        it('should render initial content when no messages', () => {
            render(<PlaygroundMessageList />)

            expect(screen.getByText('Initial Content')).toBeInTheDocument()
        })

        it('should set isInitialMessage to true when no customer messages', () => {
            const setIsInitialMessage = jest.fn()
            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                uiState: {
                    isInitialMessage: true,
                    setIsInitialMessage,
                },
            } as any)

            render(<PlaygroundMessageList />)

            expect(setIsInitialMessage).toHaveBeenCalledWith(true)
        })
    })

    describe('Messages rendering', () => {
        it('should render messages when present', () => {
            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                messagesState: {
                    ...defaultContext.messagesState,
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
                },
            } as any)

            render(<PlaygroundMessageList />)

            expect(screen.getByText('Message: Hello')).toBeInTheDocument()
            expect(screen.getByText('Message: Hi there!')).toBeInTheDocument()
        })

        it('should render KnowledgeSourcesWrapper for AI Agent messages with executionId', () => {
            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                messagesState: {
                    ...defaultContext.messagesState,
                    messages: [
                        {
                            sender: 'AI Agent',
                            type: MessageType.MESSAGE,
                            content: 'Response',
                            executionId: 'exec-123',
                            createdDatetime: new Date().toISOString(),
                        },
                    ],
                },
            } as any)

            render(<PlaygroundMessageList />)

            expect(
                screen.getByText(
                    /KnowledgeSourcesWrapper - executionId: exec-123/,
                ),
            ).toBeInTheDocument()
        })

        it('should not render KnowledgeSourcesWrapper for messages without executionId', () => {
            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                messagesState: {
                    ...defaultContext.messagesState,
                    messages: [
                        {
                            sender: 'AI Agent',
                            type: MessageType.MESSAGE,
                            content: 'Response',
                            createdDatetime: new Date().toISOString(),
                        },
                    ],
                },
            } as any)

            render(<PlaygroundMessageList />)

            expect(
                screen.queryByText(/KnowledgeSourcesWrapper/),
            ).not.toBeInTheDocument()
        })

        it('should not render KnowledgeSourcesWrapper for non-MESSAGE type messages', () => {
            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                messagesState: {
                    ...defaultContext.messagesState,
                    messages: [
                        {
                            sender: 'AI Agent',
                            type: MessageType.TICKET_EVENT,
                            executionId: 'exec-123',
                            outcome: 'resolved',
                            createdDatetime: new Date().toISOString(),
                        },
                    ],
                },
            } as any)

            render(<PlaygroundMessageList />)

            expect(
                screen.queryByText(/KnowledgeSourcesWrapper/),
            ).not.toBeInTheDocument()
        })
    })

    describe('Ticket event outcome', () => {
        it('should pass outcome to KnowledgeSourcesWrapper when ticket event message exists', () => {
            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                messagesState: {
                    ...defaultContext.messagesState,
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
                },
            } as any)

            render(<PlaygroundMessageList />)

            expect(
                screen.getByText(
                    /KnowledgeSourcesWrapper - executionId: exec-123, outcome: resolved/,
                ),
            ).toBeInTheDocument()
        })

        it('should pass undefined outcome when no ticket event message', () => {
            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                messagesState: {
                    ...defaultContext.messagesState,
                    messages: [
                        {
                            sender: 'AI Agent',
                            type: MessageType.MESSAGE,
                            content: 'Response',
                            executionId: 'exec-123',
                            createdDatetime: new Date().toISOString(),
                        },
                    ],
                },
            } as any)

            render(<PlaygroundMessageList />)

            const knowledgeSourcesWrapper = screen.getByText(
                (content, element) => {
                    return (
                        element?.textContent ===
                        'KnowledgeSourcesWrapper - executionId: exec-123, outcome: '
                    )
                },
            )
            expect(knowledgeSourcesWrapper).toBeInTheDocument()
        })
    })

    describe('isInitialMessage state', () => {
        it('should set isInitialMessage to false when customer messages exist', () => {
            const setIsInitialMessage = jest.fn()
            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                uiState: {
                    isInitialMessage: true,
                    setIsInitialMessage,
                },
                messagesState: {
                    ...defaultContext.messagesState,
                    messages: [
                        {
                            sender: 'Customer',
                            type: MessageType.MESSAGE,
                            content: 'Hello',
                            createdDatetime: new Date().toISOString(),
                        },
                    ],
                },
            } as any)

            render(<PlaygroundMessageList />)

            expect(setIsInitialMessage).toHaveBeenCalledWith(false)
        })

        it('should set isInitialMessage to true when only AI Agent messages exist', () => {
            const setIsInitialMessage = jest.fn()
            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                uiState: {
                    isInitialMessage: false,
                    setIsInitialMessage,
                },
                messagesState: {
                    ...defaultContext.messagesState,
                    messages: [
                        {
                            sender: AI_AGENT_SENDER,
                            type: MessageType.MESSAGE,
                            content: 'Hello',
                            createdDatetime: new Date().toISOString(),
                        },
                    ],
                },
            } as any)

            render(<PlaygroundMessageList />)

            expect(setIsInitialMessage).toHaveBeenCalledWith(true)
        })
    })

    describe('Auto-scroll behavior', () => {
        it('should scroll to bottom when messages are added', () => {
            const scrollIntoViewMock = jest.fn()
            HTMLDivElement.prototype.scrollIntoView = scrollIntoViewMock

            const { rerender } = render(<PlaygroundMessageList />)

            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                messagesState: {
                    ...defaultContext.messagesState,
                    messages: [
                        {
                            sender: 'Customer',
                            type: MessageType.MESSAGE,
                            content: 'Hello',
                            createdDatetime: new Date().toISOString(),
                        },
                    ],
                },
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
        it('should return null when storeConfiguration is undefined', () => {
            mockUsePlaygroundContext.mockReturnValue({
                ...defaultContext,
                storeConfiguration: undefined,
            } as any)

            const { container } = render(<PlaygroundMessageList />)

            expect(container).toBeEmptyDOMElement()
        })
    })
})
