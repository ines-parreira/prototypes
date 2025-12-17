import '@testing-library/jest-dom'

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { MessageType } from 'models/aiAgentPlayground/types'

import { OutboundContentView } from './OutboundContentView'

const mockStore = configureMockStore()
const mockTriggerMessage = jest.fn()

jest.mock('pages/aiAgent/PlaygroundV2/contexts/ConfigurationContext', () => ({
    useConfigurationContext: () => ({
        shopName: 'Test Shop',
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/contexts/CoreContext', () => ({
    useCoreContext: () => ({
        isPolling: false,
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/hooks/useAiJourneyMessages', () => ({
    useAiJourneyMessages: () => ({
        triggerMessage: mockTriggerMessage,
        isTriggeringMessage: false,
    }),
}))

jest.mock('pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext', () => ({
    useAIJourneyContext: () => ({
        followUpMessagesSent: 0,
        aiJourneySettings: {
            totalFollowUp: 3,
        },
    }),
}))

jest.mock('../PlaygroundInitialContent/PlaygroundInitialContent', () => ({
    PlaygroundInitialContent: ({
        onStartClick,
        isLoading,
    }: {
        onStartClick?: () => void
        isLoading?: boolean
    }) => (
        <div data-testid="initial-content">
            <button onClick={onStartClick} disabled={isLoading}>
                Start Conversation
            </button>
        </div>
    ),
}))

jest.mock('../PlaygroundMessageList/PlaygroundMessageList', () => ({
    PlaygroundMessageList: ({ messages }: { messages: unknown[] }) => (
        <div data-testid="message-list">
            Message List ({messages.length} messages)
        </div>
    ),
}))

describe('OutboundContentView', () => {
    const defaultProps = {
        accountId: 1,
        userId: 2,
        onGuidanceClick: jest.fn(),
        shouldDisplayReasoning: false,
        messages: [],
    }

    const store = mockStore({})

    const totalFollowUp = 3
    const mockUseAIJourneyContext = jest.requireMock(
        'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext',
    )

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAIJourneyContext.useAIJourneyContext = () => ({
            followUpMessagesSent: 0,
            aiJourneySettings: {
                totalFollowUp: totalFollowUp,
            },
            currentJourney: {
                id: '01JZAPAD606K1JSKNHC8KVA4BA',
                type: 'session_abandoned',
            },
        })
    })

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={store}>
                <OutboundContentView {...defaultProps} {...props} />
            </Provider>,
        )
    }

    describe('Empty State', () => {
        it('should render initial content when no messages (messages.length === 0)', () => {
            renderComponent({ messages: [] })

            expect(screen.getByTestId('initial-content')).toBeInTheDocument()
            expect(screen.queryByTestId('message-list')).not.toBeInTheDocument()
        })

        it('should not render follow-up button when no messages (messages.length > 0 is false)', () => {
            renderComponent({ messages: [] })

            expect(
                screen.queryByRole('button', {
                    name: /view follow-up message/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('should call triggerMessage when start conversation clicked', async () => {
            const user = userEvent.setup()
            renderComponent({ messages: [] })

            const startButton = screen.getByRole('button', {
                name: /start conversation/i,
            })
            await act(() => user.click(startButton))

            expect(mockTriggerMessage).toHaveBeenCalledTimes(1)
        })
    })

    describe('With Messages', () => {
        const mockMessages = [
            {
                id: '1',
                type: MessageType.MESSAGE,
                sender: 'user',
                text: 'Hello',
            },
            {
                id: '2',
                type: MessageType.MESSAGE,
                sender: 'agent',
                text: 'Hi there',
            },
        ]

        it('should render message list when messages exist (messages.length > 0)', () => {
            renderComponent({ messages: mockMessages })

            expect(screen.getByTestId('message-list')).toBeInTheDocument()
            expect(
                screen.getByText('Message List (2 messages)'),
            ).toBeInTheDocument()
        })

        it('should not render initial content when messages exist', () => {
            renderComponent({ messages: mockMessages })

            expect(
                screen.queryByTestId('initial-content'),
            ).not.toBeInTheDocument()
        })

        it('should render follow-up button when messages exist', () => {
            renderComponent({ messages: mockMessages })

            const followUpButton = screen.getByRole('button', {
                name: /view follow-up message/i,
            })
            expect(followUpButton).toBeInTheDocument()
        })

        it('should call triggerMessage when follow-up button clicked', async () => {
            const user = userEvent.setup()
            renderComponent({ messages: mockMessages })

            const followUpButton = screen.getByRole('button', {
                name: /view follow-up message/i,
            })
            await act(() => user.click(followUpButton))

            expect(mockTriggerMessage).toHaveBeenCalledTimes(1)
        })

        it('should not disable follow-up button by default', () => {
            renderComponent({ messages: mockMessages })

            const followUpButton = screen.getByRole('button', {
                name: /view follow-up message/i,
            })
            expect(followUpButton).not.toBeDisabled()
        })
    })

    describe('Follow-up Limit', () => {
        const mockMessages = [
            {
                id: '1',
                type: MessageType.MESSAGE,
                sender: 'user',
                text: 'Hello',
            },
        ]

        it('should disable follow-up button when limit reached', () => {
            mockUseAIJourneyContext.useAIJourneyContext = () => ({
                followUpMessagesSent: totalFollowUp + 1,
                aiJourneySettings: {
                    totalFollowUp: totalFollowUp,
                },
                currentJourney: {
                    id: '01JZAPAD606K1JSKNHC8KVA4BA',
                    type: 'session_abandoned',
                },
            })

            renderComponent({ messages: mockMessages })

            const followUpButton = screen.getByRole('button', {
                name: /view follow-up message/i,
            })
            expect(followUpButton).toBeDisabled()
        })

        it('should not render follow-up components when campaign is selected', () => {
            mockUseAIJourneyContext.useAIJourneyContext = () => ({
                followUpMessagesSent: totalFollowUp + 1,
                aiJourneySettings: {
                    totalFollowUp: totalFollowUp,
                },
                currentJourney: {
                    id: '01JZAPAD606K1JSKNHC8KVA4BA',
                    type: 'campaign',
                },
            })

            renderComponent({ messages: mockMessages })

            const followUpButton = screen.queryByRole('button', {
                name: /view follow-up message/i,
            })
            expect(followUpButton).not.toBeInTheDocument()
        })
    })

    describe('Loading and Polling States', () => {
        const mockMessages = [
            {
                id: '1',
                type: MessageType.MESSAGE,
                sender: 'user',
                text: 'Hello',
            },
        ]

        it('should disable follow-up button when polling', () => {
            const mockUseCoreContext = jest.requireMock(
                'pages/aiAgent/PlaygroundV2/contexts/CoreContext',
            )
            mockUseCoreContext.useCoreContext = () => ({
                isPolling: true,
            })

            renderComponent({ messages: mockMessages })

            const followUpButton = screen.getByRole('button', {
                name: /view follow-up message/i,
            })
            expect(followUpButton).toBeDisabled()
        })

        it('should show loading state on follow-up button when triggering', () => {
            const mockUseAiJourneyMessages = jest.requireMock(
                'pages/aiAgent/PlaygroundV2/hooks/useAiJourneyMessages',
            )
            mockUseAiJourneyMessages.useAiJourneyMessages = () => ({
                triggerMessage: mockTriggerMessage,
                isTriggeringMessage: true,
            })

            renderComponent({ messages: mockMessages })

            const followUpButton = screen.getByRole('button', {
                name: /view follow-up message/i,
            })
            expect(followUpButton).toBeDisabled()
        })
    })
})
