import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { getCustomerHistory, getLoading } from 'state/customers/selectors'
import { assumeMock } from 'utils/testing'

import TicketCard from '../TicketCard'
import Timeline from '../Timeline'

jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())
jest.mock('state/customers/selectors', () => {
    const original = jest.requireActual('state/customers/selectors')

    return {
        ...original,
        getCustomerHistory: jest.fn(),
        getLoading: jest.fn(),
    }
})
jest.mock('../TicketCard', () => jest.fn(() => <div>TicketCard</div>))

const getCustomerHistoryMock = assumeMock(getCustomerHistory)
const getLoadingMock = assumeMock(getLoading)

describe('<Timeline />', () => {
    const ticket1 = { id: 1, channel: 'email' }
    const ticket2 = { id: 2 }
    const ticket3 = { id: 3, channel: 'email' }
    beforeEach(() => {
        getCustomerHistoryMock.mockReturnValue(
            fromJS({
                triedLoading: true,
                tickets: [ticket1, ticket2, ticket3],
            }),
        )
        getLoadingMock.mockReturnValue(
            fromJS({
                history: false,
            }),
        )
    })

    it('should render loading spinner', () => {
        getLoadingMock.mockReturnValue(
            fromJS({
                history: true,
            }),
        )

        render(<Timeline />)

        expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('should render no results', () => {
        getCustomerHistoryMock.mockReturnValue(
            fromJS({
                triedLoading: true,
                tickets: [],
            }),
        )

        render(<Timeline />)

        expect(
            screen.getByText('This customer doesn’t have any tickets yet.'),
        ).toBeInTheDocument()
    })

    it('should call onLoaded when triedLoading is true and hasCalledOnLoaded is false', () => {
        const onLoaded = jest.fn()
        const { rerender } = render(<Timeline onLoaded={onLoaded} />)

        expect(onLoaded).toHaveBeenCalledTimes(1)

        // Should not call onLoaded again
        rerender(<Timeline onLoaded={onLoaded} />)
        expect(onLoaded).toHaveBeenCalledTimes(1)
    })

    it('should call TicketCard for each ticket with a channel, in correct order, with correct props', () => {
        const onTicketClick = jest.fn()
        const ticketId = 3
        render(<Timeline onTicketClick={onTicketClick} ticketId={ticketId} />)

        expect(TicketCard).toHaveBeenCalledTimes(2)
        expect(TicketCard).toHaveBeenNthCalledWith(
            1,
            {
                onClick: onTicketClick,
                isHighlighted: false,
                ticket: ticket1,
            },
            {},
        )
        expect(TicketCard).toHaveBeenNthCalledWith(
            2,
            {
                onClick: onTicketClick,
                isHighlighted: true,
                ticket: ticket3,
            },
            {},
        )
    })
})
