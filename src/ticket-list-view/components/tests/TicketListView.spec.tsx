import {render} from '@testing-library/react'
import React, {ReactElement} from 'react'
import {Virtuoso} from 'react-virtuoso'

import {ticket} from 'fixtures/ticket'
import useAppSelector from 'hooks/useAppSelector'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

import useTickets from '../../hooks/useTickets'
import {TicketPartial} from '../../types'
import Ticket from '../Ticket'
import TicketListView from '../TicketListView'

jest.mock('react-virtuoso', () => ({Virtuoso: jest.fn()}))
const VirtuosoMock = Virtuoso as jest.Mock

jest.mock('../../hooks/useTickets')
const useTicketsMock = useTickets as jest.Mock

jest.mock('../Ticket', () => jest.fn())
const TicketMock = Ticket as jest.Mock

describe('<TicketListView />', () => {
    let loadMore: jest.Mock
    let setElement: jest.Mock

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue({
            name: 'view name',
        })
        VirtuosoMock.mockImplementation(
            ({
                data,
                itemContent,
                scrollerRef,
            }: {
                data: TicketPartial[]
                itemContent: (
                    index: number,
                    ticket: TicketPartial
                ) => ReactElement
                scrollerRef: (ref: HTMLElement | Window | null) => void
            }) => {
                return (
                    <div ref={scrollerRef}>
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
})
