import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { getCustomerHistory, getLoading } from 'state/customers/selectors'
import { assumeMock } from 'utils/testing'

import Timeline from '../Timeline'
import TimelineTicket from '../TimelineTicket'

jest.mock('hooks/useAppSelector', () => (fn: () => unknown) => fn())
jest.mock('state/customers/selectors', () => {
    const original = jest.requireActual('state/customers/selectors')

    return {
        ...original,
        getCustomerHistory: jest.fn(),
        getLoading: jest.fn(),
    }
})
jest.mock('../TimelineTicket', () => jest.fn(() => <div>TimelineTicket</div>))

const getCustomerHistoryMock = assumeMock(getCustomerHistory)
const getLoadingMock = assumeMock(getLoading)

describe('<Timeline />', () => {
    beforeEach(() => {
        getCustomerHistoryMock.mockReturnValue(
            fromJS({
                triedLoading: true,
                tickets: [
                    { id: 1, channel: 'email' },
                    { id: 2 },
                    { id: 3, channel: 'email' },
                ],
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

    it('should call TimelineTicket for each ticket with a channel, in correct order, with correct props', () => {
        const onTicketClick = jest.fn()
        const ticketId = 3
        render(<Timeline onTicketClick={onTicketClick} ticketId={ticketId} />)

        expect(TimelineTicket).toHaveBeenCalledTimes(2)
        expect(TimelineTicket).toHaveBeenNthCalledWith(
            1,
            {
                displayHistoryOnNextPage: onTicketClick,
                isCurrent: false,
                ticket: fromJS({ id: 1, channel: 'email' }),
            },
            {},
        )
        expect(TimelineTicket).toHaveBeenNthCalledWith(
            2,
            {
                displayHistoryOnNextPage: onTicketClick,
                isCurrent: true,
                ticket: fromJS({ id: 3, channel: 'email' }),
            },
            {},
        )
    })
})
