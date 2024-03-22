import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import userEvent from '@testing-library/user-event'

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
        highlight: {},
    }

    it('should render render customer information', () => {
        const {container} = render(
            <WrappedSpotlightCustomerRow {...defaultProps} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with customer id when no customer name is available', () => {
        const {container} = render(
            <WrappedSpotlightCustomerRow
                {...defaultProps}
                item={{...customer, name: ''}}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render customer mail and phone sections if not available', () => {
        const {container} = render(
            <WrappedSpotlightCustomerRow
                {...defaultProps}
                item={{...customer, email: null, channels: []}}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onClick when customer row is clicked', () => {
        const {container} = render(
            <WrappedSpotlightCustomerRow {...defaultProps} />
        )
        userEvent.click(container.firstChild! as Element)
        expect(mockOnClick).toHaveBeenCalled()
    })

    it('should render a highlight when highlight is passed', () => {
        const {getByText} = render(
            <WrappedSpotlightCustomerRow
                {...defaultProps}
                highlight={{
                    email: ['<em>some email</em>'],
                    name: ['<em>some name</em>'],
                    'channels.address': ['<em>+32 000 000</em>'],
                }}
            />
        )

        expect(getByText('some email')).toBeInTheDocument()
        expect(getByText('some email').tagName.toLocaleLowerCase()).toBe('em')
        expect(getByText('some name')).toBeInTheDocument()
        expect(getByText('some name').tagName.toLocaleLowerCase()).toBe('em')
        expect(getByText('+32 000 000')).toBeInTheDocument()
        expect(getByText('+32 000 000').tagName.toLocaleLowerCase()).toBe('em')
    })
})
