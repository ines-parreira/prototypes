import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import {TicketStatus} from 'business/types/ticket'
import {ticket} from 'fixtures/ticket'
import {agents} from 'fixtures/agents'

import SpotlightTicketRow from '../SpotlightTicketRow'

const mockStore = configureMockStore([thunk])

const WrappedSpotlightTicketIcon = (
    props: ComponentProps<typeof SpotlightTicketRow>
) => (
    <Provider store={mockStore({agents: fromJS(agents)})}>
        <SpotlightTicketRow {...props} />
    </Provider>
)

describe('<SpotlightTicketRow/>', () => {
    const defaultProps: ComponentProps<typeof SpotlightTicketRow> = {
        item: ticket,
        onCloseModal: jest.fn(),
    }

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render ticket information', () => {
        const {container} = render(
            <WrappedSpotlightTicketIcon {...defaultProps} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render closed icon', () => {
        const {container} = render(
            <WrappedSpotlightTicketIcon
                {...defaultProps}
                item={{...ticket, status: TicketStatus.Closed}}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the open ticket info tooltip on hover', () => {
        jest.useFakeTimers()
        const {getByText, getByRole} = render(
            <WrappedSpotlightTicketIcon {...defaultProps} />
        )

        fireEvent.mouseOver(getByText('email'))
        jest.runAllTimers()
        expect(getByRole('tooltip')).toMatchSnapshot()
    })

    it('should render the closed ticket info tooltip on hover', () => {
        jest.useFakeTimers()
        const {getByText, getByRole} = render(
            <WrappedSpotlightTicketIcon
                {...defaultProps}
                item={{...ticket, status: TicketStatus.Closed}}
            />
        )

        fireEvent.mouseOver(getByText('email'))
        jest.runAllTimers()
        expect(getByRole('tooltip')).toMatchSnapshot()
    })

    it('should render without customer name', () => {
        const {container} = render(
            <WrappedSpotlightTicketIcon
                {...defaultProps}
                item={{...ticket, customer: {...ticket.customer, name: null}}}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render without customer name', () => {
        const {container} = render(
            <WrappedSpotlightTicketIcon
                {...defaultProps}
                item={{...ticket, customer: {...ticket.customer, name: null}}}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render current date as "today"', () => {
        jest.spyOn(Date, 'now').mockImplementation(() =>
            new Date(ticket.created_datetime).getTime()
        )

        const {container} = render(
            <WrappedSpotlightTicketIcon {...defaultProps} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a date from the current year without the year', () => {
        const mockDate = '2021-12-12T08:46:47+00:00'
        const mockPastDate = '2021-11-12T08:46:47+00:00'
        jest.spyOn(Date, 'now').mockImplementation(() =>
            new Date(mockDate).getTime()
        )

        const {container} = render(
            <WrappedSpotlightTicketIcon
                {...defaultProps}
                item={{...ticket, created_datetime: mockPastDate}}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})
