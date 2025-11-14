import { act, render, screen } from '@testing-library/react'

import {
    MessageType,
    PlaygroundMessage,
    TicketOutcome,
} from 'models/aiAgentPlayground/types'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'

import { useConfigurationContext } from '../../../contexts/ConfigurationContext'
import { useCoreContext } from '../../../contexts/CoreContext'
import { useSettingsContext } from '../../../contexts/SettingsContext'
import { PlaygroundMessageList as RawPlaygroundMessageList } from '../PlaygroundMessageList'

jest.mock('../../../contexts/MessagesContext', () => ({
    useMessagesContext: jest.fn(),
}))

jest.mock('../../../contexts/ConfigurationContext', () => ({
    useConfigurationContext: jest.fn(),
}))

jest.mock('../../../contexts/CoreContext', () => ({
    useCoreContext: jest.fn(),
}))

jest.mock('../../../contexts/SettingsContext', () => ({
    useSettingsContext: jest.fn(),
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

const mockUseConfigurationContext = jest.mocked(useConfigurationContext)
const mockUseCoreContext = jest.mocked(useCoreContext)
const mockUseSettingsContext = jest.mocked(useSettingsContext)

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

const PlaygroundMessageList = ({
    messages,
}: {
    messages: PlaygroundMessage[]
}) => {
    return (
        <RawPlaygroundMessageList
            accountId={1}
            userId={2}
            messages={messages}
        />
    )
}

describe('PlaygroundMessageList', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseConfigurationContext.mockReturnValue(
            defaultConfigurationContext as any,
        )
        mockUseCoreContext.mockReturnValue(defaultCoreContext as any)
        mockUseSettingsContext.mockReturnValue({
            mode: 'inbound',
            chatAvailability: 'online',
            selectedCustomer: null,
            resetSettings: jest.fn(),
            setSettings: jest.fn(),
        } as any)
    })

    describe('Messages rendering', () => {
        it('should render messages when present', () => {
            const messages = [
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
            ] as PlaygroundMessage[]

            render(<PlaygroundMessageList messages={messages} />)

            expect(screen.getByText('Message: Hello')).toBeInTheDocument()
            expect(screen.getByText('Message: Hi there!')).toBeInTheDocument()
        })

        it('should render KnowledgeSourcesWrapper for AI Agent messages with executionId', () => {
            const messages = [
                {
                    sender: 'AI Agent',
                    type: MessageType.MESSAGE,
                    content: 'Response',
                    executionId: 'exec-123',
                    createdDatetime: new Date().toISOString(),
                },
            ] as PlaygroundMessage[]

            render(<PlaygroundMessageList messages={messages} />)

            expect(
                screen.getByText(
                    /KnowledgeSourcesWrapper - executionId: exec-123/,
                ),
            ).toBeInTheDocument()
        })

        it('should not render KnowledgeSourcesWrapper for messages without executionId', () => {
            const messages = [
                {
                    sender: 'AI Agent',
                    type: MessageType.MESSAGE,
                    content: 'Response',
                    createdDatetime: new Date().toISOString(),
                },
            ] as PlaygroundMessage[]

            render(<PlaygroundMessageList messages={messages} />)

            expect(
                screen.queryByText(/KnowledgeSourcesWrapper/),
            ).not.toBeInTheDocument()
        })

        it('should not render KnowledgeSourcesWrapper for non-MESSAGE type messages', () => {
            const messages = [
                {
                    sender: 'AI Agent',
                    type: MessageType.TICKET_EVENT,
                    outcome: TicketOutcome.CLOSE,
                    createdDatetime: new Date().toISOString(),
                },
            ] as PlaygroundMessage[]

            render(<PlaygroundMessageList messages={messages} />)

            expect(
                screen.queryByText(/KnowledgeSourcesWrapper/),
            ).not.toBeInTheDocument()
        })
    })

    describe('Ticket event outcome', () => {
        it('should pass outcome to KnowledgeSourcesWrapper when ticket event message exists', () => {
            const messages = [
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
            ] as PlaygroundMessage[]

            render(<PlaygroundMessageList messages={messages} />)

            expect(
                screen.getByText(
                    /KnowledgeSourcesWrapper - executionId: exec-123, outcome: resolved/,
                ),
            ).toBeInTheDocument()
        })

        it('should pass undefined outcome when no ticket event message', () => {
            const messages = [
                {
                    sender: 'AI Agent',
                    type: MessageType.MESSAGE,
                    content: 'Response',
                    executionId: 'exec-123',
                    createdDatetime: new Date().toISOString(),
                },
            ] as PlaygroundMessage[]

            render(<PlaygroundMessageList messages={messages} />)

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

            const { rerender } = render(<PlaygroundMessageList messages={[]} />)

            act(() => {
                rerender(
                    <PlaygroundMessageList
                        messages={[
                            {
                                sender: 'Customer',
                                type: MessageType.MESSAGE,
                                content: 'Hello',
                                createdDatetime: new Date().toISOString(),
                            },
                        ]}
                    />,
                )
            })

            expect(scrollIntoViewMock).toHaveBeenCalledWith({
                behavior: 'smooth',
                block: 'end',
            })
        })

        it('should not scroll when no messages', () => {
            const scrollIntoViewMock = jest.fn()
            HTMLDivElement.prototype.scrollIntoView = scrollIntoViewMock

            render(<PlaygroundMessageList messages={[]} />)

            expect(scrollIntoViewMock).not.toHaveBeenCalled()
        })
    })

    describe('Store configuration', () => {
        it('should render without KnowledgeSourcesWrapper when storeConfiguration is undefined', () => {
            mockUseConfigurationContext.mockReturnValue({
                ...defaultConfigurationContext,
                storeConfiguration: null,
            } as any)

            const messages = [
                {
                    sender: 'AI Agent',
                    type: MessageType.MESSAGE,
                    content: 'Response',
                    executionId: 'exec-123',
                    createdDatetime: new Date().toISOString(),
                },
            ] as PlaygroundMessage[]

            render(<PlaygroundMessageList messages={messages} />)

            expect(screen.getByText('Message: Response')).toBeInTheDocument()
            expect(
                screen.queryByText(/KnowledgeSourcesWrapper/),
            ).not.toBeInTheDocument()
        })
    })
})
