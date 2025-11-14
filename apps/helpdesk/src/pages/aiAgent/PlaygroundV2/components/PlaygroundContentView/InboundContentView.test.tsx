import '@testing-library/jest-dom'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { MessageType } from 'models/aiAgentPlayground/types'

import { InboundContentView } from './InboundContentView'

const mockStore = configureMockStore()

jest.mock('../PlaygroundInitialContent/PlaygroundInitialContent', () => ({
    PlaygroundInitialContent: () => (
        <div data-testid="initial-content">Initial Content</div>
    ),
}))

jest.mock('../PlaygroundMessageList/PlaygroundMessageList', () => ({
    PlaygroundMessageList: ({ messages }: { messages: unknown[] }) => (
        <div data-testid="message-list">
            Message List ({messages.length} messages)
        </div>
    ),
}))

describe('InboundContentView', () => {
    const defaultProps = {
        accountId: 1,
        userId: 2,
        onGuidanceClick: jest.fn(),
        shouldDisplayReasoning: false,
        messages: [],
    }

    const store = mockStore({})

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={store}>
                <InboundContentView {...defaultProps} {...props} />
            </Provider>,
        )
    }

    describe('Empty State', () => {
        it('should render initial content when no messages (messages.length === 0)', () => {
            renderComponent({ messages: [] })

            expect(screen.getByTestId('initial-content')).toBeInTheDocument()
            expect(screen.queryByTestId('message-list')).not.toBeInTheDocument()
        })

        it('should not render message list when no messages (messages.length > 0 is false)', () => {
            renderComponent({ messages: [] })

            expect(screen.queryByTestId('message-list')).not.toBeInTheDocument()
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

        it('should not render initial content when messages exist (messages.length === 0 is false)', () => {
            renderComponent({ messages: mockMessages })

            expect(
                screen.queryByTestId('initial-content'),
            ).not.toBeInTheDocument()
        })

        it('should pass correct props to PlaygroundMessageList', () => {
            renderComponent({
                messages: mockMessages,
                accountId: 123,
                userId: 456,
                shouldDisplayReasoning: true,
            })

            expect(screen.getByTestId('message-list')).toBeInTheDocument()
        })
    })
})
