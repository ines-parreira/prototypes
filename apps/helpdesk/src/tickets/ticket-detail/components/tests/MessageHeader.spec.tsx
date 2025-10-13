import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { mockGetCurrentUserHandler } from '@gorgias/helpdesk-mocks'
import type { TicketMessage } from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'
import { isForwardedMessage } from 'tickets/common/utils'
import { useTicketModalContext } from 'timeline/ticket-modal/hooks/useTicketModalContext'

import { MessageHeader } from '../MessageHeader'

jest.mock('core/flags')
jest.mock('timeline/ticket-modal/hooks/useTicketModalContext')
jest.mock('tickets/common/utils')

jest.mock('pages/common/utils/labels', () => ({
    AgentLabel: jest.fn(({ name, isAIAgent }) => (
        <span>
            {name} {isAIAgent && '(AI)'}
        </span>
    )),
    CustomerLabel: jest.fn(({ customer }) => (
        <span>{customer.get('name')}</span>
    )),
}))

jest.mock('pages/tickets/detail/components/TicketMessages/Meta', () =>
    jest.fn(() => <span>Meta Component</span>),
)

jest.mock('pages/tickets/detail/components/TicketMessages/Source', () =>
    jest.fn(() => <span>Source Component</span>),
)

jest.mock(
    'pages/tickets/detail/components/TicketMessages/SourceActionsHeader',
    () => jest.fn(() => <span>Actions Header</span>),
)

jest.mock('tickets/ticket-detail/components/MessageMetadata', () => ({
    MessageMetadata: jest.fn(() => <span>Message Metadata</span>),
}))

const mockUseFlag = jest.mocked(useFlag)
const mockUseTicketModalContext = jest.mocked(useTicketModalContext)
const mockIsForwardedMessage = jest.mocked(isForwardedMessage)

const server = setupServer()
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: 0,
            cacheTime: 0,
        },
        mutations: {
            retry: false,
        },
    },
})

const mockStore = configureMockStore([thunk])({})

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    queryClient.clear()

    const mockGetCurrentUser = mockGetCurrentUserHandler()

    server.use(mockGetCurrentUser.handler)

    mockUseFlag.mockReturnValue(false)
    mockUseTicketModalContext.mockReturnValue({
        containerRef: null,
        isInsideTicketModal: false,
    })
    mockIsForwardedMessage.mockReturnValue(false)
})

afterEach(() => {
    server.resetHandlers()
    jest.clearAllMocks()
})

afterAll(() => {
    server.close()
})

const renderComponent = (ui: React.ReactElement) => {
    return render(
        <MemoryRouter>
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    {ui}
                </QueryClientProvider>
            </Provider>
        </MemoryRouter>,
    )
}

describe('MessageHeader', () => {
    it('renders agent message correctly', async () => {
        const message = {
            id: 'msg-123',
            ticket_id: 123,
            from_agent: true,
            sender: { name: 'Agent Smith' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        renderComponent(<MessageHeader message={message} />)

        await waitFor(() => {
            expect(screen.getByText('Agent Smith')).toBeInTheDocument()
            expect(screen.getByText('Meta Component')).toBeInTheDocument()
            expect(screen.getByText('Source Component')).toBeInTheDocument()
        })
    })

    it('renders customer message correctly', async () => {
        const message = {
            id: 'msg-124',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        renderComponent(<MessageHeader message={message} />)

        await waitFor(() => {
            expect(screen.getByText('Customer')).toBeInTheDocument()
            expect(screen.getByText('Meta Component')).toBeInTheDocument()
            expect(screen.getByText('Source Component')).toBeInTheDocument()
        })
    })

    it('renders AI agent correctly', async () => {
        const message = {
            id: 'msg-125',
            ticket_id: 123,
            from_agent: true,
            sender: { name: 'AI Agent' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        renderComponent(<MessageHeader message={message} isAI={true} />)

        await waitFor(() => {
            expect(screen.getByText('AI Agent (AI)')).toBeInTheDocument()
        })
    })

    it('handles deleted message state', async () => {
        const message = {
            id: 'msg-126',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        renderComponent(
            <MessageHeader message={message} isMessageDeleted={true} />,
        )

        await waitFor(() => {
            expect(
                screen.getByText('Comment deleted on Facebook'),
            ).toBeInTheDocument()
            expect(screen.queryByText('Meta Component')).not.toBeInTheDocument()
        })
    })

    it('handles hidden message state', async () => {
        const message = {
            id: 'msg-127',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        renderComponent(
            <MessageHeader message={message} isMessageHidden={true} />,
        )

        await waitFor(() => {
            expect(screen.getByText('Message hidden')).toBeInTheDocument()
            expect(screen.queryByText('Meta Component')).not.toBeInTheDocument()
        })
    })

    it('handles duplicated hidden message', async () => {
        const message = {
            id: 'msg-128',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            meta: { is_duplicated: true },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        renderComponent(
            <MessageHeader message={message} isMessageHidden={true} />,
        )

        await waitFor(() => {
            expect(screen.getByText('Meta Component')).toBeInTheDocument()
            expect(screen.queryByText('Message hidden')).not.toBeInTheDocument()
        })
    })

    it('applies error styling when isFailed is true', async () => {
        const message = {
            id: 'msg-129',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        const { container } = renderComponent(
            <MessageHeader message={message} isFailed={true} />,
        )

        await waitFor(() => {
            expect(container.querySelector('.failed')).toBeInTheDocument()
        })
    })

    it('hides SourceActionsHeader in readonly mode', async () => {
        const message = {
            id: 'msg-130',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        renderComponent(<MessageHeader message={message} readonly={true} />)

        await waitFor(() => {
            expect(screen.queryByText('Actions Header')).not.toBeInTheDocument()
        })
    })

    it('shows SourceActionsHeader when not readonly', async () => {
        const message = {
            id: 'msg-131',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        renderComponent(<MessageHeader message={message} readonly={false} />)

        await waitFor(() => {
            expect(screen.getByText('Actions Header')).toBeInTheDocument()
        })
    })

    it('renders MessageMetadata in headerDetails when TicketThreadRevamp is true', async () => {
        mockUseFlag.mockImplementation(
            (flag: string) => flag === FeatureFlagKey.TicketThreadRevamp,
        )

        const message = {
            id: 'msg-132',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        const { container } = renderComponent(
            <MessageHeader message={message} />,
        )

        await waitFor(() => {
            const headerDetails = container.querySelector('.headerDetails')
            const metadataText = screen.getByText('Message Metadata')
            expect(headerDetails).toContainElement(metadataText)
        })
    })

    it('renders MessageMetadata in rightWrapper when TicketThreadRevamp is disabled', async () => {
        const message = {
            id: 'msg-133',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        const { container } = renderComponent(
            <MessageHeader message={message} />,
        )

        await waitFor(() => {
            const rightWrapper = container.querySelector('.rightWrapper')
            const metadataText = screen.getByText('Message Metadata')
            expect(rightWrapper).toContainElement(metadataText)
        })
    })

    it('does not render Source when message.source is missing', async () => {
        const message = {
            id: 'msg-134',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        renderComponent(<MessageHeader message={message} />)

        await waitFor(() => {
            expect(
                screen.queryByText('Source Component'),
            ).not.toBeInTheDocument()
        })
    })

    it('applies correct CSS classes for different message states', async () => {
        const message = {
            id: 'msg-135',
            ticket_id: 123,
            from_agent: false,
            sender: { name: 'Customer' },
            source: { type: 'email' },
            created_datetime: '2023-01-01T10:00:00Z',
        } as unknown as TicketMessage

        const { container, rerender } = renderComponent(
            <MessageHeader message={message} />,
        )

        await waitFor(() => {
            let authorElement = container.querySelector('.author')
            expect(authorElement).not.toHaveClass('isAgent')
            expect(authorElement).not.toHaveClass('hiddenMessage')
            expect(authorElement).not.toHaveClass('deletedMessage')
        })

        const agentMessage = { ...message, from_agent: true }
        rerender(
            <MemoryRouter>
                <Provider store={mockStore}>
                    <QueryClientProvider client={queryClient}>
                        <MessageHeader message={agentMessage} />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        await waitFor(() => {
            const authorElement = container.querySelector('.author')
            expect(authorElement).toHaveClass('isAgent')
        })

        rerender(
            <MemoryRouter>
                <Provider store={mockStore}>
                    <QueryClientProvider client={queryClient}>
                        <MessageHeader
                            message={message}
                            isMessageHidden={true}
                        />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        await waitFor(() => {
            const authorElement = container.querySelector('.author')
            expect(authorElement).toHaveClass('hiddenMessage')
        })

        rerender(
            <MemoryRouter>
                <Provider store={mockStore}>
                    <QueryClientProvider client={queryClient}>
                        <MessageHeader
                            message={message}
                            isMessageDeleted={true}
                        />
                    </QueryClientProvider>
                </Provider>
            </MemoryRouter>,
        )

        await waitFor(() => {
            const authorElement = container.querySelector('.author')
            expect(authorElement).toHaveClass('deletedMessage')
        })
    })
})
