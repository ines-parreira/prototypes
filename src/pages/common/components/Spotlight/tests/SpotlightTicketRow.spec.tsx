import React, {ComponentProps} from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import userEvent from '@testing-library/user-event'

import {TicketStatus} from 'business/types/ticket'
import {ticket} from 'fixtures/ticket'
import {agents} from 'fixtures/agents'
import {user} from 'fixtures/users'

import SpotlightTicketRow, {
    PickedTicket,
} from 'pages/common/components/Spotlight/SpotlightTicketRow'

const mockStore = configureMockStore([thunk])

const WrappedSpotlightTicketRow = (
    props: ComponentProps<typeof SpotlightTicketRow>
) => (
    <Provider
        store={mockStore({agents: fromJS(agents), currentUser: fromJS(user)})}
    >
        <SpotlightTicketRow {...props} />
    </Provider>
)

const mockOnClick = jest.fn()

describe('<SpotlightTicketRow/>', () => {
    const defaultProps: ComponentProps<typeof SpotlightTicketRow> = {
        item: ticket as PickedTicket,
        onCloseModal: jest.fn(),
        id: 1,
        index: 1,
        onClick: mockOnClick,
    }

    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render ticket information', () => {
        const {container} = render(
            <WrappedSpotlightTicketRow {...defaultProps} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render closed icon', () => {
        const {container} = render(
            <WrappedSpotlightTicketRow
                {...defaultProps}
                item={{...ticket, status: TicketStatus.Closed} as PickedTicket}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the open ticket info tooltip on hover', () => {
        jest.useFakeTimers()
        const {getByText, getByRole} = render(
            <WrappedSpotlightTicketRow {...defaultProps} />
        )

        fireEvent.mouseOver(getByText('email'))
        jest.runAllTimers()
        expect(getByRole('tooltip')).toMatchSnapshot()
    })

    it('should render the closed ticket info tooltip on hover', () => {
        jest.useFakeTimers()
        const {getByText, getByRole} = render(
            <WrappedSpotlightTicketRow
                {...defaultProps}
                item={{...ticket, status: TicketStatus.Closed} as PickedTicket}
            />
        )

        fireEvent.mouseOver(getByText('email'))
        jest.runAllTimers()
        expect(getByRole('tooltip')).toMatchSnapshot()
    })

    it('should render without customer name', () => {
        const {container} = render(
            <WrappedSpotlightTicketRow
                {...defaultProps}
                item={
                    {
                        ...ticket,
                        customer: {...ticket.customer, name: null},
                    } as unknown as PickedTicket
                }
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render without customer name and without email', () => {
        const {container} = render(
            <WrappedSpotlightTicketRow
                {...defaultProps}
                item={
                    {
                        ...ticket,
                        customer: {...ticket.customer, name: null, email: null},
                    } as unknown as PickedTicket
                }
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render current date as "today"', () => {
        jest.spyOn(Date, 'now').mockImplementation(() =>
            new Date(ticket.created_datetime).getTime()
        )

        const {container} = render(
            <WrappedSpotlightTicketRow {...defaultProps} />
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
            <WrappedSpotlightTicketRow
                {...defaultProps}
                item={
                    {...ticket, created_datetime: mockPastDate} as PickedTicket
                }
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onClick when ticket row is clicked', () => {
        const {container} = render(
            <WrappedSpotlightTicketRow {...defaultProps} />
        )
        if (container.firstChild) {
            userEvent.click(container.firstChild as Element)
        }
        expect(mockOnClick).toHaveBeenCalled()
    })

    it('should render title with item.excerpt value form props', () => {
        const exceptValue = 'Excerpt test'
        render(
            <WrappedSpotlightTicketRow
                {...{
                    ...defaultProps,
                    item: {
                        ...defaultProps.item,
                        subject: '',
                        excerpt: exceptValue,
                    },
                }}
            />
        )

        expect(screen.getByText(exceptValue)).toBeInTheDocument()
    })

    it('should render title as empty string', () => {
        render(
            <WrappedSpotlightTicketRow
                {...{
                    ...defaultProps,
                    item: {
                        ...defaultProps.item,
                        subject: '',
                        excerpt: '',
                    },
                }}
            />
        )

        expect(document.querySelector('.title')?.textContent).toBe('')
    })

    it('should render CustomerId when no name nor email', () => {
        const props = {
            ...defaultProps,
            item: {
                ...defaultProps.item,
                customer: {
                    ...defaultProps.item.customer,
                    email: null,
                    name: '',
                },
            },
        }
        const {getByText} = render(<WrappedSpotlightTicketRow {...props} />)

        expect(
            getByText(`#${props.item.customer.id}`, {exact: false})
        ).toBeInTheDocument()
    })

    it('should render ticket information with highlight items', () => {
        const {getByText} = render(
            <WrappedSpotlightTicketRow
                {...defaultProps}
                highlights={{
                    subject: ['<em>subject</em>'],
                    messages: {
                        to: {
                            name: ['<em>to name</em>'],
                        },
                        from: {
                            name: ['<em>from name</em>'],
                        },
                    },
                }}
            />
        )

        expect(getByText('subject')).toBeInTheDocument()
        expect(getByText('subject').tagName.toLocaleLowerCase()).toEqual('em')
        expect(getByText('from name')).toBeInTheDocument()
        expect(getByText('from name').tagName.toLocaleLowerCase()).toEqual('em')
    })
})
