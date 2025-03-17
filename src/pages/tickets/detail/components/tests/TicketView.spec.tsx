import React, { ComponentProps } from 'react'

import { render, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import Timeline from 'pages/common/components/timeline/Timeline'
import { getCustomersState } from 'state/customers/selectors'
import {
    getBody,
    getDisplayHistory,
    getTicketState,
} from 'state/ticket/selectors'
import { assumeMock, getLastMockCall } from 'utils/testing'

import TicketView from '../TicketView'

jest.mock('hooks/useAppSelector', () => jest.fn((fn: () => unknown) => fn()))
jest.mock('state/customers/selectors', () => {
    const original = jest.requireActual('state/customers/selectors')

    return {
        ...original,
        getCustomersState: jest.fn(),
    }
})
jest.mock('state/ticket/selectors', () => {
    const original = jest.requireActual('state/ticket/selectors')

    return {
        ...original,
        getBody: jest.fn(),
        getDisplayHistory: jest.fn(),
        getTicketState: jest.fn(),
    }
})
jest.mock('pages/common/components/timeline/Timeline', () =>
    jest.fn(() => <div>Timeline</div>),
)
jest.mock('../TicketBody', () => () => <div>TicketBody</div>)
jest.mock('../TicketBodyNonVirtualized', () => () => (
    <div>TicketBodyNonVirtualized</div>
))
jest.mock('../TicketHeaderWrapper/TicketHeaderWrapper', () => () => (
    <div>TicketHeaderWrapper</div>
))
jest.mock('../ReplyForm', () => () => <div>ReplyForm</div>)

const TimelineMock = assumeMock(Timeline)
const getCustomersStateMock = assumeMock(getCustomersState)
const getDisplayHistoryMock = assumeMock(getDisplayHistory)
const getTicketStateMock = assumeMock(getTicketState)
const getBodyMock = assumeMock(getBody)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
const scrollToMock = jest.fn()

describe('<TicketView />', () => {
    const minProps = {
        hideTicket: jest.fn(),
        isTicketHidden: false,
        setStatus: jest.fn(),
        submit: jest.fn(),
    } as unknown as ComponentProps<typeof TicketView>

    beforeEach(() => {
        HTMLElement.prototype.scrollTo = jest.fn(scrollToMock)
        getCustomersStateMock.mockReturnValue(
            fromJS({}) as ReturnType<typeof getCustomersState>,
        )
        getDisplayHistoryMock.mockReturnValue(
            false as ReturnType<typeof getDisplayHistory>,
        )
        getTicketStateMock.mockReturnValue(
            fromJS({
                id: 0,
                _internal: {
                    isShopperTyping: false,
                },
            }) as ReturnType<typeof getTicketState>,
        )
        getBodyMock.mockReturnValue(fromJS({}) as ReturnType<typeof getBody>)
    })

    it('should not have the hidden classes', () => {
        const { container } = render(<TicketView {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should have the hidden classes', () => {
        const { container } = render(
            <TicketView {...minProps} isTicketHidden />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call the `Timeline` with correct props', async () => {
        getDisplayHistoryMock.mockReturnValue(
            (() => true) as unknown as ReturnType<typeof getDisplayHistory>,
        )

        render(<TicketView {...minProps} />)

        expect(TimelineMock).toHaveBeenCalledWith(
            {
                onLoaded: expect.any(Function),
                ticketId: 0,
            },
            {},
        )

        getLastMockCall(TimelineMock)[0].onLoaded?.()

        await waitFor(() =>
            expect(scrollToMock).toHaveBeenCalledWith({
                top: 0,
            }),
        )
    })
})
