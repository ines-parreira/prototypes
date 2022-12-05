import {render, fireEvent} from '@testing-library/react'
import React from 'react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from 'state/infobarActions/bigcommerce/createOrder/actions'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {IntegrationType} from 'models/integration/constants'
import {initialState} from 'state/infobarActions/bigcommerce/createOrder/reducers'
import {ShippingAddressesDropdown} from '../ShippingAddressesDropdown'
import {
    BigCommerceCustomerAddress,
    BigCommerceCustomerAddressType,
} from '../types'

const integrationContextValue = {integration: fromJS({}), integrationId: 1}
const mockStore = configureMockStore([thunk])

jest.spyOn(actions, 'addCheckoutBillingAddress')
const addCheckoutBillingAddress = actions.addCheckoutBillingAddress as jest.Mock

const shippingAddresses: BigCommerceCustomerAddress[] = [
    {
        postal_code: '507050',
        address_type: BigCommerceCustomerAddressType.Residential,
        city: 'Paris',
        phone: '',
        last_name: 'Test 1',
        country_code: 'FR',
        country: 'France',
        first_name: 'A',
        id: 5,
        customer_id: 160,
        company: '',
        address1: 'Random Street 19',
        address2: '',
        state_or_province: 'Paris',
        email: 'test2@gorgias.com',
    },
    {
        postal_code: '507051',
        address_type: BigCommerceCustomerAddressType.Residential,
        city: 'Paris',
        phone: '',
        last_name: 'Test 2',
        country_code: 'FR',
        country: 'France',
        first_name: 'A',
        id: 13,
        customer_id: 160,
        company: 'test',
        address1: 'Random Street 19',
        address2: '',
        state_or_province: 'Paris',
        email: 'test2@gorgias.com',
    },
]

const store = mockStore({
    infobarActions: {
        [IntegrationType.BigCommerce]: {
            createOrder: initialState,
        },
    },
})

const emptyProps = {
    shippingAddress: null,
    shippingAddresses: [],
    setShippingAddress: jest.fn(),
}

const shippingAddressesProps = {
    shippingAddress: null,
    shippingAddresses: shippingAddresses,
    setShippingAddress: jest.fn(),
}

const selectedShippingAddressProps = {
    shippingAddress: shippingAddresses[1],
    shippingAddresses: shippingAddresses,
    setShippingAddress: jest.fn(),
}

describe('<ShippingAddressesDropdown/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display `No results` when shippingAddresses = [] & snapshot should render `Select from address book...`', () => {
        const {container, getByText} = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <ShippingAddressesDropdown {...emptyProps} />
                </IntegrationContext.Provider>
            </Provider>
        )

        fireEvent.focus(getByText(/Select from address book.../))
        fireEvent.click(getByText(/^No results$/))

        expect(container).toMatchSnapshot()
        expect(addCheckoutBillingAddress.mock.calls.length).toBe(0)
    })

    it('should display the shipping addresses as options', () => {
        const {getByText} = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <ShippingAddressesDropdown {...shippingAddressesProps} />
                </IntegrationContext.Provider>
            </Provider>
        )

        fireEvent.focus(getByText(/Select from address book.../))

        // check that both address options from list appear in dropdown
        expect(getByText(/.*507050.*/)).toBeTruthy()
        expect(getByText(/.*507051.*/)).toBeTruthy()
    })

    it('snapshot renders the selected shipping address instead of `Select from address book...`', () => {
        const {container} = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <ShippingAddressesDropdown
                        {...selectedShippingAddressProps}
                    />
                </IntegrationContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should call addCheckoutBillingAddress when address option is selected', () => {
        const {getByText} = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <ShippingAddressesDropdown {...shippingAddressesProps} />
                </IntegrationContext.Provider>
            </Provider>
        )

        fireEvent.focus(getByText(/Select from address book.../))
        // select the second address from list
        fireEvent.click(getByText(/.*507051.*/))

        expect(addCheckoutBillingAddress.mock.calls).toMatchSnapshot()
    })
})
