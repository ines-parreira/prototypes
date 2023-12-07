import {render} from '@testing-library/react'
import React from 'react'

import {ticket} from 'fixtures/ticket'
import useAppSelector from 'hooks/useAppSelector'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

import useTickets from '../../hooks/useTickets'
import {TicketPartial} from '../../types'
import Ticket from '../Ticket'
import TicketListView from '../TicketListView'

jest.mock('../../hooks/useTickets')
const useTicketsMock = useTickets as jest.Mock

jest.mock('../Ticket', () => jest.fn())
const TicketMock = Ticket as jest.Mock

describe('<TicketListView />', () => {
    beforeEach(() => {
        useAppSelectorMock.mockReturnValue({
            name: 'view name',
        })
        TicketMock.mockImplementation(({ticket}: {ticket: TicketPartial}) => {
            return <p>{ticket.id}</p>
        })
        useTicketsMock.mockReturnValue([ticket])
    })

    it('should display a list of tickets', () => {
        const {getByText} = render(<TicketListView viewId={123} />)

        expect(getByText(ticket.id)).toBeInTheDocument()
    })
})
