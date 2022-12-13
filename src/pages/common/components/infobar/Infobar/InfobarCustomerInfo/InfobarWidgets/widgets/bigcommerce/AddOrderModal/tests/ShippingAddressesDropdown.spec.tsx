import {render, fireEvent} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as utils from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/utils'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {integrationsState} from 'fixtures/integrations'
import {bigCommerceShippingAddressesFixture} from 'fixtures/bigcommerce'
import {ShippingAddressesDropdown} from '../ShippingAddressesDropdown'

const integrationContextValue = {integration: fromJS({}), integrationId: 1}

jest.spyOn(utils, 'addCheckoutBillingAddress')
const addCheckoutBillingAddress = utils.addCheckoutBillingAddress as jest.Mock

const defaultState = {
    integrations: fromJS(integrationsState),
}
const mockStore = configureMockStore([thunk])
const store = mockStore(defaultState)

type Props = ComponentProps<typeof ShippingAddressesDropdown>

const emptyProps: Props = {
    shippingAddress: null,
    shippingAddresses: [],
    onSelectAddress: jest.fn(),
}

const shippingAddressesProps: Props = {
    shippingAddress: null,
    shippingAddresses: bigCommerceShippingAddressesFixture,
    onSelectAddress: jest.fn(),
}

const selectedShippingAddressProps: Props = {
    shippingAddress: bigCommerceShippingAddressesFixture[1],
    shippingAddresses: bigCommerceShippingAddressesFixture,
    onSelectAddress: jest.fn(),
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

    it('should call onSelectAddress when address option is selected', () => {
        const onSelectAddress = jest.fn()

        const {getByText} = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <ShippingAddressesDropdown
                        {...shippingAddressesProps}
                        onSelectAddress={onSelectAddress}
                    />
                </IntegrationContext.Provider>
            </Provider>
        )

        fireEvent.focus(getByText(/Select from address book.../))
        // select the second address from list
        fireEvent.click(getByText(/.*507051.*/))

        expect(onSelectAddress).toHaveBeenCalledWith(
            bigCommerceShippingAddressesFixture[1]
        )
    })
})
