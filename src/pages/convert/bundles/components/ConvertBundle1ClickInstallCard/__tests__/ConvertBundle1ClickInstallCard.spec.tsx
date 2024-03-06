import React from 'react'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import '@testing-library/jest-dom'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'
import {
    RevenueBundle,
    RevenueBundleInstallationMethodResponse,
    RevenueBundleStatus,
} from 'models/revenueBundles/types'
import {IntegrationType} from 'models/integration/constants'
import client from 'models/api/resources'
import ConvertBundle1ClickInstallCard from '../ConvertBundle1ClickInstallCard'

const mockStore = configureMockStore([thunk])

const mockedServer = new MockAdapter(client)

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'My shopify store',
            },
        ],
    }),
}
describe('ConvertBundle1ClickInstallCard Component', () => {
    afterEach(() => {
        mockedServer.reset()
    })

    it('renders installation card with install button if not installed', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ConvertBundle1ClickInstallCard
                    isConnectedToShopify={true}
                    bundle={
                        {
                            id: 1,
                            status: RevenueBundleStatus.Uninstalled,
                            method: RevenueBundleInstallationMethodResponse.OneClick,
                        } as unknown as RevenueBundle
                    }
                />
            </Provider>
        )

        expect(
            screen.getByText('1-click installation for Shopify')
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Add the Campaign bundle to your Shopify store in one click.'
            )
        ).toBeInTheDocument()
        expect(screen.getByText('Install')).toBeInTheDocument()
        expect(screen.queryByText('Uninstall')).not.toBeInTheDocument()
    })

    it('renders installation card with uninstall button if installed', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <ConvertBundle1ClickInstallCard
                    isConnectedToShopify={true}
                    bundle={
                        {
                            id: 1,
                            status: RevenueBundleStatus.Installed,
                            method: RevenueBundleInstallationMethodResponse.OneClick,
                        } as unknown as RevenueBundle
                    }
                />
            </Provider>
        )

        expect(
            screen.getByText('1-click installation for Shopify')
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Add the Campaign bundle to your Shopify store in one click.'
            )
        ).toBeInTheDocument()
        expect(screen.queryByText('Install')).not.toBeInTheDocument()
        expect(screen.getByText('Uninstall')).toBeInTheDocument()
    })

    it('triggers onChange when install button is clicked', async () => {
        mockedServer.onPost('/api/revenue-addon-bundle/install/').reply(200, {})

        const onChange = jest.fn()
        render(
            <Provider store={mockStore(defaultState)}>
                <ConvertBundle1ClickInstallCard
                    isConnectedToShopify={true}
                    bundle={
                        {
                            id: 1,
                            status: RevenueBundleStatus.Uninstalled,
                            method: RevenueBundleInstallationMethodResponse.OneClick,
                        } as unknown as RevenueBundle
                    }
                    onChange={onChange}
                />
            </Provider>
        )

        const installButton = screen.getByText('Install')
        fireEvent.click(installButton)

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith(true)
        })
    })

    it('triggers onChange when uninstall button is clicked', async () => {
        mockedServer
            .onPost('/api/revenue-addon-bundle/1/uninstall/')
            .reply(200, {})

        const onChange = jest.fn()
        render(
            <Provider store={mockStore(defaultState)}>
                <ConvertBundle1ClickInstallCard
                    isConnectedToShopify={true}
                    bundle={
                        {
                            id: 1,
                            status: RevenueBundleStatus.Installed,
                            method: RevenueBundleInstallationMethodResponse.OneClick,
                        } as unknown as RevenueBundle
                    }
                    onChange={onChange}
                />
            </Provider>
        )

        const uninstallButton = screen.getByText('Uninstall')
        fireEvent.click(uninstallButton)

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith(false)
        })
    })
})
