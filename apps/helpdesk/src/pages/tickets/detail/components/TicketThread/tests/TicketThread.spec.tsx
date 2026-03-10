import type { ReactNode } from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Editor from 'pages/common/editor/Editor'
import useInitialMacroFilters from 'pages/common/editor/hooks/useInitialMacroFilters'
import { getTicket, getTicketState } from 'state/ticket/selectors'
import { editorFocused } from 'state/ui/editor/actions'

import { TicketThread } from '../TicketThread'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ ticketId: '1' }),
}))
jest.mock('@repo/routing', () => ({
    useSearchParams: jest.fn(),
}))
jest.mock('@repo/ticket-thread', () => ({
    TicketThreadContainer: ({ children }: { children: ReactNode }) => (
        <section aria-label="Ticket thread container">{children}</section>
    ),
    TicketThreadItemsContainer: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
    TicketThreadItem: ({ item }: { item: { _tag: string } }) => (
        <div>{item._tag}</div>
    ),
    useTicketThread: jest.fn(),
}))
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
jest.mock('state/ui/editor/actions', () => ({ editorFocused: jest.fn() }))
jest.mock('pages/tickets/detail/components/TypingActivity', () =>
    jest.fn(({ isTyping, name }: { isTyping: boolean; name: string }) => (
        <p>{`TypingActivity ${name} ${isTyping}`}</p>
    )),
)
jest.mock(
    'pages/integrations/integration/components/whatsapp/WhatsAppEditorProvider',
    () =>
        jest.fn(({ children }: { children: ReactNode }) => (
            <div>{children}</div>
        )),
)

const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseInitialMacroFilters = useInitialMacroFilters as jest.Mock
const mockEditor = Editor as jest.Mock
const mockEditorFocused = editorFocused as unknown as jest.Mock
const mockUseSearchParams = jest.requireMock('@repo/routing')
    .useSearchParams as jest.Mock
const mockUseTicketThread = jest.requireMock('@repo/ticket-thread')
    .useTicketThread as jest.Mock

describe('<TicketThread />', () => {
    const dispatch = jest.fn()
    const submit = jest.fn()
    const initialMacroFilters = { languages: ['en'] }
    let ticket: { id: number; customer?: { name?: string } }
    let ticketState: ReturnType<typeof fromJS>
    let searchParams: URLSearchParams

    beforeEach(() => {
        jest.clearAllMocks()

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
        mockUseInitialMacroFilters.mockReturnValue(initialMacroFilters)
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

    it('renders the thread feed and passes the expected props to Editor', () => {
        render(<TicketThread submit={submit} />)

        expect(
            screen.getByRole('region', { name: 'Ticket thread container' }),
        ).toBeInTheDocument()
        expect(screen.getByText('Thread feed item 1')).toBeInTheDocument()
        expect(screen.getByText('Thread feed item 100')).toBeInTheDocument()
        expect(
            screen.getByText('TypingActivity Jane Doe true'),
        ).toBeInTheDocument()
        expect(mockEditor).toHaveBeenCalledWith(
            {
                initialMacroFilters,
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
    })

    it('falls back to "Customer" when the ticket customer has no name', () => {
        ticket = { id: 1, customer: {} }

        render(<TicketThread submit={submit} />)

        expect(
            screen.getByText('TypingActivity Customer true'),
        ).toBeInTheDocument()
    })

    it('falls back to "Customer" when the ticket has no customer', () => {
        ticket = { id: 1 }

        render(<TicketThread submit={submit} />)

        expect(
            screen.getByText('TypingActivity Customer true'),
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
})
