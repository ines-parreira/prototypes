import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS, Map} from 'immutable'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {shopifyIntegration} from 'fixtures/integrations'
import {BundleInstallationMethod} from 'models/convert/bundle/types'
import WizardInstallStep from '../WizardInstallStep'

const mockStore = configureMockStore()

const defaultState = {
    integrations: fromJS({
        integrations: [shopifyIntegration],
    }),
}

describe('WizardInstallStep', () => {
    const integration = Map({
        meta: fromJS({
            shop_integration_id: shopifyIntegration.id,
        }),
    })

    const setInstallationMethod = jest.fn()

    beforeEach(() => {
        setInstallationMethod.mockClear()
    })

    test('calls setInstallationMethod with OneClick method when OneClick option is clicked', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <WizardInstallStep
                    integration={integration}
                    installationMethod={BundleInstallationMethod.Manual}
                    setInstallationMethod={setInstallationMethod}
                />
            </Provider>
        )

        expect(
            getByText('1-click installation for Shopify')
        ).toBeInTheDocument()
        expect(getByText('Manual installation')).toBeInTheDocument()

        fireEvent.click(getByText('1-click installation for Shopify'))

        expect(setInstallationMethod).toHaveBeenCalledWith(
            BundleInstallationMethod.OneClick
        )
    })

    test('calls setInstallationMethod with Manual method when Manual option is clicked', () => {
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <WizardInstallStep
                    integration={integration}
                    installationMethod={BundleInstallationMethod.OneClick}
                    setInstallationMethod={setInstallationMethod}
                />
            </Provider>
        )

        expect(
            getByText('1-click installation for Shopify')
        ).toBeInTheDocument()
        expect(getByText('Manual installation')).toBeInTheDocument()

        fireEvent.click(getByText('Manual installation'))

        expect(setInstallationMethod).toHaveBeenCalledWith(
            BundleInstallationMethod.Manual
        )
    })
})
