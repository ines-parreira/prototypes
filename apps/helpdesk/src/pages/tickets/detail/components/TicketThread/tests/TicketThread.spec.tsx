import type { ReactNode } from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Editor from 'pages/common/editor/Editor'
import useInitialMacroFilters from 'pages/common/editor/hooks/useInitialMacroFilters'
import useCollisionDetection from 'pages/tickets/detail/components/TicketHeaderWrapper/hooks/useCollisionDetection'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import { getTicket, getTicketState } from 'state/ticket/selectors'
import { editorFocused } from 'state/ui/editor/actions'

import { TicketThread } from '../TicketThread'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock(
    'pages/tickets/detail/components/TicketHeaderWrapper/hooks/useCollisionDetection',
    () => jest.fn(),
)

const mockUseParams = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => mockUseParams(),
}))

jest.mock('@repo/routing', () => ({
    useSearchParams: jest.fn(),
}))

var mockTicketThreadContainer: jest.Mock

jest.mock('@repo/ticket-thread', () => {
    mockTicketThreadContainer = jest.fn(
        ({
            items,
            renderThreadItem,
            ticketId,
        }: {
            items: Array<{ _tag: string; data?: unknown }>
            renderThreadItem: (
                index: number,
                item: { _tag: string; data?: unknown },
            ) => ReactNode
            ticketId?: string
        }) => (
            <section
                aria-label="Ticket thread container"
                data-ticket-id={ticketId}
            >
                {items.map((item, index) => (
                    <div key={`thread-item-${index}`}>
                        {renderThreadItem(index, item)}
                    </div>
                ))}
                <div key="composer">
                    {renderThreadItem(items.length, {
                        _tag: 'composer',
                        data: null,
                    })}
                </div>
            </section>
        ),
    )

    return {
        getThreadListItemKey: jest.fn((_item, index) => `thread-item-${index}`),
        isComposerItem: jest.fn(
            (item: { _tag: string }) => item._tag === 'composer',
        ),
        ViewingActivity: ({ agents }: { agents: Array<{ name: string }> }) => (
            <div>{agents.map((agent) => agent.name).join(', ')}</div>
        ),
        TypingActivity: ({
            agents,
            customers,
        }: {
            agents?: Array<{ name: string }>
            customers?: Array<{ name: string }>
        }) => (
            <div>
                {`TypingActivity customers=${customers?.map((customer) => customer.name).join(', ') ?? ''} agents=${agents?.map((agent) => agent.name).join(', ') ?? ''}`}
            </div>
        ),
        TicketThreadContainer: mockTicketThreadContainer,
        TicketThreadItem: jest.fn(({ item }: { item: { _tag: string } }) => (
            <div>{item._tag}</div>
        )),
        useTicketThread: jest.fn(),
    }
})

jest.mock('pages/common/editor/Editor', () =>
    jest.fn(
        ({ onFocus, onBlur }: { onFocus: () => void; onBlur: () => void }) => (
            <div>
                <button type="button" onClick={onFocus}>
                    Focus editor
                </button>
                <button type="button" onClick={onBlur}>
                    Blur editor
                </button>
            </div>
        ),
    ),
)
jest.mock('pages/common/editor/hooks/useInitialMacroFilters', () => jest.fn())
jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(() => createMockStandaloneAiAccess()),
}))
jest.mock('state/ui/editor/actions', () => ({ editorFocused: jest.fn() }))
jest.mock(
    'pages/integrations/integration/components/whatsapp/WhatsAppEditorProvider',
    () =>
        jest.fn(({ children }: { children: ReactNode }) => (
            <div>{children}</div>
        )),
)

const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseCollisionDetection = useCollisionDetection as jest.Mock
const mockUseInitialMacroFilters = useInitialMacroFilters as jest.Mock
const mockUseStandaloneAiAccess = useStandaloneAiAccess as jest.Mock
const mockEditor = Editor as jest.Mock
const mockEditorFocused = editorFocused as unknown as jest.Mock
const mockUseSearchParams = jest.requireMock('@repo/routing')
    .useSearchParams as jest.Mock
const mockTicketThreadItem = jest.requireMock('@repo/ticket-thread')
    .TicketThreadItem as jest.Mock
const mockUseTicketThread = jest.requireMock('@repo/ticket-thread')
    .useTicketThread as jest.Mock

describe('<TicketThread />', () => {
    const dispatch = jest.fn()
    const submit = jest.fn()
    const initialMacroFilters = { languages: ['en'] }
    let ticket: { id: number; customer?: { id?: number; name?: string } }
    let ticketState: ReturnType<typeof fromJS>
    let searchParams: URLSearchParams

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseParams.mockReturnValue({ ticketId: '1' })
        ticket = {
            id: 1,
            customer: { name: 'Jane Doe' },
        }
        searchParams = new URLSearchParams()
        ticketState = fromJS({
            _internal: {
                isShopperTyping: true,
            },
        })

        mockUseAppDispatch.mockReturnValue(dispatch)
        mockUseCollisionDetection.mockReturnValue({
            agentsViewing: [],
            agentsViewingNotTyping: [],
            agentsTyping: [],
            hasBoth: false,
        })
        mockUseInitialMacroFilters.mockReturnValue(initialMacroFilters)
        mockUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess(),
        )
        mockEditorFocused.mockImplementation((focused: boolean) => ({
            focused,
        }))
        mockUseSearchParams.mockReturnValue([searchParams, jest.fn()])
        mockUseTicketThread.mockReturnValue({
            ticketThreadItems: [
                { _tag: 'Thread feed item 1' },
                { _tag: 'Thread feed item 100' },
            ],
        })
        mockUseAppSelector.mockImplementation((selector: unknown) => {
            if (selector === getTicketState) {
                return ticketState
            }

            if (selector === getTicket) {
                return ticket
            }

            return undefined
        })
    })

    it('renders the thread feed, composer, and passes wrapper props to the shared container', () => {
        render(<TicketThread submit={submit} />)

        expect(
            screen.getByRole('region', { name: 'Ticket thread container' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Thread feed item 1')).toBeInTheDocument()
        expect(screen.getByText('Thread feed item 100')).toBeInTheDocument()
        expect(
            screen.getByText('TypingActivity customers=Jane Doe agents='),
        ).toBeInTheDocument()
        expect(mockTicketThreadContainer).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [
                    { _tag: 'Thread feed item 1' },
                    { _tag: 'Thread feed item 100' },
                ],
                renderThreadItem: expect.any(Function),
                ticketId: '1',
            }),
            expect.objectContaining({}),
        )
        expect(mockEditor).toHaveBeenCalledWith(
            {
                initialMacroFilters,
                internalNotesOnly: false,
                onBlur: expect.any(Function),
                onFocus: expect.any(Function),
                submit,
                ticket,
            },
            expect.objectContaining({}),
        )
        expect(mockUseTicketThread).toHaveBeenCalledWith({
            pendingMessages: [],
            showTicketEvents: false,
            ticketId: 1,
        })
        expect(mockTicketThreadItem).toHaveBeenCalledWith(
            expect.objectContaining({
                item: { _tag: 'Thread feed item 1' },
            }),
            expect.objectContaining({}),
        )
    })

    it('renders the agents viewing banner before the thread items', () => {
        mockUseCollisionDetection.mockReturnValue({
            agentsViewing: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
            ],
            agentsViewingNotTyping: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
            ],
            agentsTyping: [],
            hasBoth: false,
        })

        render(<TicketThread submit={submit} />)

        const banner = screen.getByText('Alice, Bob')
        const firstThreadItem = screen.getByText('Thread feed item 1')

        expect(
            banner.compareDocumentPosition(firstThreadItem) &
                Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy()
        expect(mockUseCollisionDetection).toHaveBeenCalledWith(1)
    })

    it.each([
        ['ticket customer has no name', { id: 1, customer: {} }],
        ['ticket has no customer', { id: 1 }],
    ])('falls back to "Customer" when the %s', (_label, nextTicket) => {
        ticket = nextTicket

        render(<TicketThread submit={submit} />)

        expect(
            screen.getByText('TypingActivity customers=Customer agents='),
        ).toBeInTheDocument()
    })

    it('passes agent typing activity to the ticket-thread typing component', () => {
        mockUseCollisionDetection.mockReturnValue({
            agentsViewing: [],
            agentsViewingNotTyping: [],
            agentsTyping: [
                { id: 1, name: 'Alice' },
                { id: 2, name: 'Bob' },
            ],
            hasBoth: false,
        })

        render(<TicketThread submit={submit} />)

        expect(
            screen.getByText(
                'TypingActivity customers=Jane Doe agents=Alice, Bob',
            ),
        ).toBeInTheDocument()
    })

    it('omits shopper typing participants when the shopper is not typing', () => {
        ticketState = fromJS({
            _internal: {
                isShopperTyping: false,
            },
        })

        render(<TicketThread submit={submit} />)

        expect(
            screen.getByText('TypingActivity customers= agents='),
        ).toBeInTheDocument()
    })

    it('dispatches editor focus state on editor focus and blur', async () => {
        render(<TicketThread submit={submit} />)

        await userEvent.click(
            screen.getByRole('button', { name: 'Focus editor' }),
        )
        expect(mockEditorFocused).toHaveBeenCalledWith(true)
        expect(dispatch).toHaveBeenCalledWith({ focused: true })

        await userEvent.click(
            screen.getByRole('button', { name: 'Blur editor' }),
        )
        expect(mockEditorFocused).toHaveBeenCalledWith(false)
        expect(dispatch).toHaveBeenCalledWith({ focused: false })
    })

    it('passes showTicketEvents to the thread hook when enabled in the URL', () => {
        searchParams = new URLSearchParams({
            show_ticket_events: 'true',
        })
        mockUseSearchParams.mockReturnValue([searchParams, jest.fn()])

        render(<TicketThread submit={submit} />)

        expect(mockUseTicketThread).toHaveBeenCalledWith({
            pendingMessages: [],
            showTicketEvents: true,
            ticketId: 1,
        })
    })

    it('passes pending messages from the ticket state to the thread hook', () => {
        ticketState = fromJS({
            _internal: {
                isShopperTyping: true,
                pendingMessages: [{ id: 'pending-1' }],
            },
        })

        render(<TicketThread submit={submit} />)

        expect(mockUseTicketThread).toHaveBeenCalledWith({
            pendingMessages: [{ id: 'pending-1' }],
            showTicketEvents: false,
            ticketId: 1,
        })
    })

    it('enables internal notes only mode for standalone AI agents with read access', () => {
        mockUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
                ticketsView: {
                    canRead: true,
                },
            }),
        )

        render(<TicketThread submit={submit} />)

        expect(mockEditor).toHaveBeenCalledWith(
            expect.objectContaining({
                internalNotesOnly: true,
            }),
            expect.objectContaining({}),
        )
    })
})
