import React from 'react'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import '@testing-library/jest-dom'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import MockAdapter from 'axios-mock-adapter'

import {IntegrationType} from 'models/integration/constants'
import client from 'models/api/resources'
import {convertBundle} from 'fixtures/convertBundle'
import {
    BundleInstallationMethodResponse,
    BundleStatus,
} from 'models/convert/bundle/types'
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

    describe('when method is script tag', () => {
        const defaultProps = {
            chatIntegrationId: 1,
            isConnectedToShopify: true,
            isThemeAppExtensionInstallation: false,
        }

        it('renders installation card with install button if not installed', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <ConvertBundle1ClickInstallCard
                        {...defaultProps}
                        bundle={{
                            ...convertBundle,
                            status: BundleStatus.Uninstalled,
                            method: BundleInstallationMethodResponse.OneClick,
                        }}
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
                        {...defaultProps}
                        bundle={{
                            ...convertBundle,
                            status: BundleStatus.Installed,
                            method: BundleInstallationMethodResponse.OneClick,
                        }}
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
            mockedServer
                .onPost('/api/revenue-addon-bundle/install/')
                .reply(200, {})

            const onChange = jest.fn()
            render(
                <Provider store={mockStore(defaultState)}>
                    <ConvertBundle1ClickInstallCard
                        {...defaultProps}
                        bundle={{
                            ...convertBundle,
                            status: BundleStatus.Uninstalled,
                            method: BundleInstallationMethodResponse.OneClick,
                        }}
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
                .onPost(
                    `/api/revenue-addon-bundle/${convertBundle.id}/uninstall/`
                )
                .reply(200, {})

            const onChange = jest.fn()
            render(
                <Provider store={mockStore(defaultState)}>
                    <ConvertBundle1ClickInstallCard
                        {...defaultProps}
                        bundle={{
                            ...convertBundle,
                            status: BundleStatus.Installed,
                            method: BundleInstallationMethodResponse.OneClick,
                        }}
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

    describe('when method is theme app', () => {
        const defaultProps = {
            chatIntegrationId: 1,
            isConnectedToShopify: true,
            isThemeAppExtensionInstallation: true,
        }

        it('renders nothing if theme app is not installed', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <ConvertBundle1ClickInstallCard
                        {...defaultProps}
                        bundle={{
                            ...convertBundle,
                            status: BundleStatus.Uninstalled,
                            method: BundleInstallationMethodResponse.ThemeApp,
                        }}
                    />
                </Provider>
            )

            expect(
                screen.queryByText('Quick installation for Shopify')
            ).not.toBeInTheDocument()
        })

        it('renders installation card with uninstall button if installed', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <ConvertBundle1ClickInstallCard
                        {...defaultProps}
                        bundle={{
                            ...convertBundle,
                            status: BundleStatus.Installed,
                            method: BundleInstallationMethodResponse.ThemeApp,
                        }}
                    />
                </Provider>
            )

            expect(
                screen.getByText('Quick installation for Shopify')
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Campaign bundle added to your Shopify store together with Chat.'
                )
            ).toBeInTheDocument()
            expect(screen.queryByText('Install')).not.toBeInTheDocument()
            expect(screen.getByText('Uninstall')).toBeInTheDocument()
        })

        it('triggers onChange when uninstall button is clicked', async () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <ConvertBundle1ClickInstallCard
                        {...defaultProps}
                        bundle={{
                            ...convertBundle,
                            status: BundleStatus.Installed,
                            method: BundleInstallationMethodResponse.ThemeApp,
                        }}
                    />
                </Provider>
            )

            const uninstallButton = screen.getByText('Uninstall')
            fireEvent.click(uninstallButton)

            await waitFor(() => {
                expect(window.location.href).toBe(
                    '/app/settings/channels/gorgias_chat/1/installation'
                )
            })
        })
    })
})
