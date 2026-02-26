import React from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { shopifyIntegration } from 'fixtures/integrations'
import { BundleInstallationMethod } from 'models/convert/bundle/types'
import * as useThemeAppExtensionInstallation from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation'

import WizardInstallStep from '../WizardInstallStep'

const mockStore = configureMockStore()

const defaultState = {
    integrations: fromJS({
        integrations: [shopifyIntegration],
    }),
}

const useThemeAppExtensionInstallationSpy = jest.spyOn(
    useThemeAppExtensionInstallation,
    'default',
)

describe('WizardInstallStep', () => {
    const integration = Map({
        meta: fromJS({
            shop_integration_id: shopifyIntegration.id,
        }),
    })

    const setInstallationMethod = jest.fn()

    beforeEach(() => {
        useThemeAppExtensionInstallationSpy.mockReturnValue({
            shouldUseThemeAppExtensionInstallation: false,
            themeAppExtensionInstallationUrl: null,
            themeAppExtensionEnabled: false,
        })
        setInstallationMethod.mockClear()
    })

    test('calls setInstallationMethod with OneClick method when OneClick option is clicked', () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <WizardInstallStep
                    integration={integration}
                    isManualMethodRequired={false}
                    installationMethod={BundleInstallationMethod.Manual}
                    setInstallationMethod={setInstallationMethod}
                />
            </Provider>,
        )

        expect(
            getByText('1-click installation for Shopify'),
        ).toBeInTheDocument()
        expect(getByText('Manual installation')).toBeInTheDocument()

        fireEvent.click(getByText('1-click installation for Shopify'))

        expect(setInstallationMethod).toHaveBeenCalledWith(
            BundleInstallationMethod.OneClick,
        )
    })

    test('calls setInstallationMethod with Manual method when Manual option is clicked', () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <WizardInstallStep
                    integration={integration}
                    isManualMethodRequired={false}
                    installationMethod={BundleInstallationMethod.OneClick}
                    setInstallationMethod={setInstallationMethod}
                />
            </Provider>,
        )

        expect(
            getByText('1-click installation for Shopify'),
        ).toBeInTheDocument()
        expect(getByText('Manual installation')).toBeInTheDocument()

        fireEvent.click(getByText('Manual installation'))

        expect(setInstallationMethod).toHaveBeenCalledWith(
            BundleInstallationMethod.Manual,
        )
    })

    test('displays only manual installation option when should use theme app method', () => {
        useThemeAppExtensionInstallationSpy.mockReturnValue({
            shouldUseThemeAppExtensionInstallation: true,
            themeAppExtensionInstallationUrl: 'test.com',
            themeAppExtensionEnabled: true,
        })

        const { getByText, queryByText } = render(
            <Provider store={mockStore(defaultState)}>
                <WizardInstallStep
                    integration={integration}
                    isManualMethodRequired={true}
                    installationMethod={BundleInstallationMethod.OneClick}
                    setInstallationMethod={setInstallationMethod}
                />
            </Provider>,
        )

        expect(
            queryByText('1-click installation for Shopify'),
        ).not.toBeInTheDocument()
        expect(getByText('Manual installation')).toBeInTheDocument()
    })
})
