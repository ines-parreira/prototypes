import {fireEvent, render} from '@testing-library/react'
import React, {ComponentProps, ReactElement} from 'react'
import {Virtuoso} from 'react-virtuoso'

import {useFlag} from 'common/flags'
import {ticket} from 'fixtures/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {useSplitTicketView} from 'split-ticket-view-toggle'
import {setViewEditMode} from 'state/views/actions'
import useTickets from 'ticket-list-view/hooks/useTickets'
import {TicketPartial} from 'ticket-list-view/types'

import Ticket from '../Ticket'
import TicketListView, {listInfoProps} from '../TicketListView'

jest.mock('common/flags', () => ({useFlag: jest.fn()}))
const useFlagMock = useFlag as jest.Mock

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('react-virtuoso', () => ({Virtuoso: jest.fn()}))
const VirtuosoMock = Virtuoso as jest.Mock

jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const mockUseSplitTicketViewMock = useSplitTicketView as jest.Mock

jest.mock('../../hooks/useTickets')
const useTicketsMock = useTickets as jest.Mock

jest.mock('../Ticket', () => jest.fn())
const TicketMock = Ticket as jest.Mock

jest.mock('../InvalidFiltersAction', () => () => <div>Fix filters</div>)

describe('<TicketListView />', () => {
    let loadMore: jest.Mock
    let setElement: jest.Mock
    let setIsEnabled: jest.Mock
    let setShouldRedirectToSplitView: jest.Mock
    let dispatch: jest.Mock

    beforeEach(() => {
        useFlagMock.mockReturnValue(false)
        dispatch = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatch)
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
        setIsEnabled = jest.fn()
        setShouldRedirectToSplitView = jest.fn()
        mockUseSplitTicketViewMock.mockReturnValue({
            isEnabled: false,
            setIsEnabled,
            setShouldRedirectToSplitView,
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

    it('should render inaccessible view placeholder', () => {
        useTicketsMock.mockReturnValue({
            loadMore,
            setElement,
            staleTickets: {},
            tickets: [],
            newTickets: {},
            ticketIds: {current: []},
            initialLoaded: true,
        })
        useAppSelectorMock.mockReturnValue(null)

        const {getByText} = render(<TicketListView viewId={123} />)

        expect(getByText(listInfoProps.INACCESSIBLE.text)).toBeInTheDocument()
        expect(
            getByText(listInfoProps.INACCESSIBLE.subText)
        ).toBeInTheDocument()
    })

    it('should redirect to edition view', () => {
        useAppSelectorMock.mockReturnValue(null)

        const {getByText} = render(<TicketListView viewId={123} />)
        fireEvent.click(getByText('tune'))

        expect(dispatch).toHaveBeenCalledWith(setViewEditMode())
        expect(setIsEnabled).toHaveBeenCalledWith(false)
        expect(setShouldRedirectToSplitView).toHaveBeenCalledWith(true)
    })
})
