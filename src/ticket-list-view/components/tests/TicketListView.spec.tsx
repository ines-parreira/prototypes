import {render} from '@testing-library/react'
import React, {ComponentProps, ReactElement} from 'react'
import {Virtuoso} from 'react-virtuoso'

import {ticket} from 'fixtures/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import useTickets from '../../hooks/useTickets'
import {TicketPartial} from '../../types'
import Ticket from '../Ticket'
import TicketListView, {listInfoProps} from '../TicketListView'

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('react-virtuoso', () => ({Virtuoso: jest.fn()}))
const VirtuosoMock = Virtuoso as jest.Mock

jest.mock('../../hooks/useTickets')
const useTicketsMock = useTickets as jest.Mock

jest.mock('../Ticket', () => jest.fn())
const TicketMock = Ticket as jest.Mock

jest.mock('../InvalidFiltersAction', () => () => <div>Fix filters</div>)

describe('<TicketListView />', () => {
    let loadMore: jest.Mock
    let setElement: jest.Mock

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(jest.fn())
        useAppSelectorMock.mockReturnValue({
            name: 'view name',
        })
        VirtuosoMock.mockImplementation(
            ({
                data,
                itemContent,
                scrollerRef,
                components: {EmptyPlaceholder},
            }: {
                data: TicketPartial[]
                itemContent: (
                    index: number,
                    ticket: TicketPartial
                ) => ReactElement
                scrollerRef: (ref: HTMLElement | Window | null) => void
                components: {EmptyPlaceholder: () => ReactElement}
            }) => {
                return (
                    <div ref={scrollerRef}>
                        {data.length === 0 && <EmptyPlaceholder />}
                        {data.map((t) => itemContent(0, t))}
                    </div>
                )
            }
        )
        TicketMock.mockImplementation(({ticket}: {ticket: TicketPartial}) => {
            return <p>{ticket.id}</p>
        })
        loadMore = jest.fn()
        setElement = jest.fn()
        useTicketsMock.mockReturnValue({
            loadMore,
            setElement,
            staleTickets: {},
            tickets: [ticket],
            newTickets: {},
            ticketIds: {current: [152]},
            initialLoaded: true,
        })
    })

    it('should display a list of tickets', () => {
        const {getByText} = render(<TicketListView viewId={123} />)

        expect(getByText(ticket.id)).toBeInTheDocument()
    })

    it('should register the scrolling element', () => {
        render(<TicketListView viewId={123} />)

        expect(setElement).toHaveBeenCalledWith(expect.any(HTMLElement))
    })

    it('should call loadMore when the end of the list is reached', () => {
        render(<TicketListView viewId={123} />)
        const [[{endReached}]] = VirtuosoMock.mock.calls as [
            [{endReached: () => void}]
        ]

        endReached()

        expect(loadMore).toHaveBeenCalledWith()
    })

    it('should mark ticket as new', () => {
        TicketMock.mockImplementation(
            ({isNewTicket}: ComponentProps<typeof Ticket>) => {
                return <p>{String(isNewTicket)}</p>
            }
        )
        useTicketsMock.mockReturnValue({
            loadMore,
            setElement,
            staleTickets: {},
            tickets: [ticket],
            newTickets: {[ticket.id]: ticket},
            ticketIds: {current: [152]},
        })

        const {getByText} = render(<TicketListView viewId={123} />)

        expect(getByText('true')).toBeInTheDocument()
    })

    it('should flip exit transition prop for removed ticket', () => {
        const newTickets = [ticket, {...ticket, id: 456}]
        TicketMock.mockImplementation(
            ({exit}: ComponentProps<typeof Ticket>) => {
                return <p>{String(exit)}</p>
            }
        )
        VirtuosoMock.mockImplementation(
            ({
                itemContent,
                scrollerRef,
                components: {Item},
            }: {
                itemContent: (
                    index: number,
                    ticket: ComponentProps<typeof Ticket>['ticket']
                ) => ReactElement
                scrollerRef: (ref: HTMLElement | Window | null) => void
                components: {Item: (props: any) => ReactElement}
            }) => {
                return (
                    <div ref={scrollerRef}>
                        {newTickets.map((t) => (
                            <Item key={t.id}>{itemContent(0, t)}</Item>
                        ))}
                    </div>
                )
            }
        )
        useTicketsMock.mockReturnValue({
            loadMore,
            setElement,
            staleTickets: {},
            tickets: [ticket, {...ticket, id: 456}],
            newTickets: {},
            ticketIds: {current: [152, 456]},
        })

        const {rerender, getByText} = render(<TicketListView viewId={123} />)
        useTicketsMock.mockReturnValue({
            loadMore,
            setElement,
            staleTickets: {},
            tickets: [ticket],
            newTickets: [],
            ticketIds: {current: [152]},
        })
        rerender(<TicketListView viewId={123} />)
        rerender(<TicketListView viewId={123} />)

        expect(getByText('true')).toBeInTheDocument()
    })

    it('should display view emoji decoration', () => {
        useAppSelectorMock.mockReturnValue({
            name: 'view name',
            decoration: {emoji: '🎉'},
        })
        const {getByText} = render(<TicketListView viewId={123} />)
        expect(getByText('🎉')).toBeInTheDocument()
    })

    it('should render empty placeholder', () => {
        useTicketsMock.mockReturnValue({
            loadMore,
            setElement,
            staleTickets: {},
            tickets: [],
            newTickets: {},
            ticketIds: {current: []},
            initialLoaded: true,
        })

        const {getByText} = render(<TicketListView viewId={123} />)

        expect(getByText(listInfoProps.DEFAULT.text)).toBeInTheDocument()
        expect(getByText(listInfoProps.DEFAULT.subText)).toBeInTheDocument()
    })

    it('should render invalid view filters placeholder', () => {
        useTicketsMock.mockReturnValue({
            loadMore,
            setElement,
            staleTickets: {},
            tickets: [],
            newTickets: {},
            ticketIds: {current: []},
            initialLoaded: true,
        })
        useAppSelectorMock.mockReturnValue({
            name: 'view name',
            deactivated_datetime: '2021-01-01T00:00:00Z',
        })

        const {getByText} = render(<TicketListView viewId={123} />)

        expect(
            getByText(listInfoProps.INVALID_FILTERS.text)
        ).toBeInTheDocument()
        expect(
            getByText(listInfoProps.INVALID_FILTERS.subText, {
                trim: false,
                collapseWhitespace: false,
            })
        ).toBeInTheDocument()
        expect(getByText('Fix filters')).toBeInTheDocument()
    })
})
