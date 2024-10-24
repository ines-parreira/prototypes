import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {TicketChannel} from 'business/types/ticket'
import {customer} from 'fixtures/customer'
import {user} from 'fixtures/users'

import SpotlightCustomerRow from '../SpotlightCustomerRow'

const mockStore = configureMockStore([thunk])

const WrappedSpotlightCustomerRow = (
    props: ComponentProps<typeof SpotlightCustomerRow>
) => (
    <Provider store={mockStore({currentUser: fromJS(user)})}>
        <SpotlightCustomerRow {...props} />
    </Provider>
)

const mockOnClick = jest.fn()

describe('<SpotlightCustomerRow/>', () => {
    const defaultProps: ComponentProps<typeof SpotlightCustomerRow> = {
        item: customer,
        onCloseModal: jest.fn(),
        id: 1,
        index: 1,
        onClick: mockOnClick,
    }
    const customerEmail = customer.channels?.find(
        (channel) => channel.type === TicketChannel.Email
    )?.address
    const customerPhone = customer.channels?.find(
        (channel) => channel.type === TicketChannel.Phone
    )?.address

    it('should render render customer information', () => {
        render(<WrappedSpotlightCustomerRow {...defaultProps} />)

        expect(screen.getByText(customer.name)).toBeInTheDocument()
        expect(customerPhone).toBeDefined()
        expect(customerEmail).toBeDefined()
        if (customerEmail && customerPhone) {
            expect(screen.getByText(customerEmail)).toBeInTheDocument()
            expect(screen.getByText(customerPhone)).toBeInTheDocument()
        }
    })

    it('should render with customer id when no customer name is available', () => {
        render(
            <WrappedSpotlightCustomerRow
                {...defaultProps}
                item={{...customer, name: ''}}
            />
        )

        expect(screen.getByText(`Customer #${customer.id}`)).toBeInTheDocument()
    })

    it('should not render customer mail and phone sections if not available', () => {
        render(
            <WrappedSpotlightCustomerRow
                {...defaultProps}
                item={{...customer, email: null, channels: []}}
            />
        )

        expect(document.querySelector('.customerInfo')).toBeNull()
    })

    it('should call onClick when customer row is clicked', () => {
        const {container} = render(
            <WrappedSpotlightCustomerRow {...defaultProps} />
        )
        userEvent.click(container.firstChild! as Element)
        expect(mockOnClick).toHaveBeenCalled()
    })

    it('should render a highlight when highlight is passed', () => {
        const item = {
            ...defaultProps.item,
            highlights: {
                email: ['<em>some email</em>'],
                name: ['<em>some name</em>'],
                channels: {
                    address: ['<em>+32 000 000</em>'],
                },
            },
        }
        const {getByText} = render(
            <WrappedSpotlightCustomerRow {...defaultProps} item={item} />
        )

        expect(getByText('some email')).toBeInTheDocument()
        expect(getByText('some email').tagName.toLocaleLowerCase()).toBe('em')
        expect(getByText('some name')).toBeInTheDocument()
        expect(getByText('some name').tagName.toLocaleLowerCase()).toBe('em')
        expect(getByText('+32 000 000')).toBeInTheDocument()
        expect(getByText('+32 000 000').tagName.toLocaleLowerCase()).toBe('em')
    })
})
