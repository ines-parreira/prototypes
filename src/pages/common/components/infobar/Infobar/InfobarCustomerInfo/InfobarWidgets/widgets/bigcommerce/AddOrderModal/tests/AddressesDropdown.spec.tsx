import React, { ComponentProps } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { bigCommerceShippingAddressesFixture } from 'fixtures/bigcommerce'
import { integrationsState } from 'fixtures/integrations'
import * as utils from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/AddOrderModal/utils'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'

import { AddressesDropdown } from '../AddressesDropdown'

const integrationContextValue = { integration: fromJS({}), integrationId: 1 }

jest.spyOn(utils, 'addCheckoutBillingAddress')
const addCheckoutBillingAddress = utils.addCheckoutBillingAddress as jest.Mock

const defaultState = {
    integrations: fromJS(integrationsState),
}
const mockStore = configureMockStore([thunk])
const store = mockStore(defaultState)

type Props = ComponentProps<typeof AddressesDropdown>

const emptyProps: Props = {
    addressType: 'shipping',
    selectedAddress: null,
    availableAddresses: [],
    onSelectAddress: jest.fn(),
    integrationId: 1,
    currencyCode: 'USD',
    customerEmail: 'test2@gorgias.com',
}

const shippingAddressesProps: Props = {
    addressType: 'shipping',
    selectedAddress: null,
    availableAddresses: bigCommerceShippingAddressesFixture,
    onSelectAddress: jest.fn(),
    integrationId: 1,
    currencyCode: 'USD',
    customerEmail: 'test2@gorgias.com',
}

const selectedShippingAddressProps: Props = {
    addressType: 'shipping',
    selectedAddress: bigCommerceShippingAddressesFixture[1],
    availableAddresses: bigCommerceShippingAddressesFixture,
    onSelectAddress: jest.fn(),
    integrationId: 1,
    currencyCode: 'USD',
    customerEmail: 'test2@gorgias.com',
}

describe('<ShippingAddressesDropdown/>', () => {
    it('should display `No results` when shippingAddresses = [] & snapshot should render `Select from address book...`', () => {
        const { container, getByText } = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <AddressesDropdown {...emptyProps} />
                </IntegrationContext.Provider>
            </Provider>,
        )

        fireEvent.focus(getByText(/Select from address book.../))
        fireEvent.click(getByText(/^No results$/))

        expect(container).toMatchSnapshot()
        expect(addCheckoutBillingAddress.mock.calls.length).toBe(0)
    })

    it('should display the shipping addresses as options', () => {
        const { getByText } = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <AddressesDropdown {...shippingAddressesProps} />
                </IntegrationContext.Provider>
            </Provider>,
        )

        fireEvent.focus(getByText(/Select from address book.../))

        // check that both address options from list appear in dropdown
        expect(getByText(/.*507050.*/)).toBeTruthy()
        expect(getByText(/.*507051.*/)).toBeTruthy()
    })

    it('snapshot renders the selected shipping address instead of `Select from address book...`', () => {
        const { container } = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <AddressesDropdown {...selectedShippingAddressProps} />
                </IntegrationContext.Provider>
            </Provider>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should call onSelectAddress when address option is selected', () => {
        const onSelectAddress = jest.fn()

        const { getByText } = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <AddressesDropdown
                        {...shippingAddressesProps}
                        onSelectAddress={onSelectAddress}
                    />
                </IntegrationContext.Provider>
            </Provider>,
        )

        fireEvent.focus(getByText(/Select from address book.../))
        // select the second address from list
        fireEvent.click(getByText(/.*507051.*/))

        expect(onSelectAddress).toHaveBeenCalledWith(
            bigCommerceShippingAddressesFixture[1],
            'shipping',
            'test2@gorgias.com',
        )
    })
})
