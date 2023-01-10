import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {integrationsState} from 'fixtures/integrations'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {bigCommerceAvailableCurrenciesFixture} from 'fixtures/bigcommerce'
import {CurrencyPickerDropdown} from '../CurrencyPickerDropdown'

const integrationContextValue = {integration: fromJS({}), integrationId: 1}

const defaultState = {
    integrations: fromJS(integrationsState),
}
const mockStore = configureMockStore([thunk])
const store = mockStore(defaultState)

type Props = ComponentProps<typeof CurrencyPickerDropdown>

const unselectedCurrencyProps: Props = {
    availableCurrencies: bigCommerceAvailableCurrenciesFixture,
    setCurrency: jest.fn(),
}

const selectedCurrencyProps: Props = {
    availableCurrencies: bigCommerceAvailableCurrenciesFixture,
    currency: bigCommerceAvailableCurrenciesFixture[0],
    setCurrency: jest.fn(),
}

describe('<CurrencyPickerDropdown/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should display the available currencies as options', () => {
        const {getByText} = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <CurrencyPickerDropdown {...unselectedCurrencyProps} />
                </IntegrationContext.Provider>
            </Provider>
        )

        fireEvent.focus(getByText(/Select currency/))

        // check that both address options from list appear in dropdown
        expect(getByText(/EUR/)).toBeInTheDocument()
        expect(getByText(/USD/)).toBeInTheDocument()
    })
    it('should display the selected currency', () => {
        const {container} = render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <CurrencyPickerDropdown {...selectedCurrencyProps} />
                </IntegrationContext.Provider>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
