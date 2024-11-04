import {fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import Integration from 'pages/integrations/integration/components/bigcommerce/Integration'
import {getConnectUrl} from 'pages/integrations/integration/components/bigcommerce/Utils'
import * as actions from 'state/integrations/actions'
import {renderWithRouter} from 'utils/testing'

jest.spyOn(actions, 'deleteIntegration')
jest.spyOn(actions, 'updateOrCreateIntegrationRequest')
const deleteIntegration = actions.deleteIntegration as jest.Mock

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('<BigCommerceIntegration/>', () => {
    const minProps: ComponentProps<typeof Integration> = {
        integration: fromJS({}),
        loading: fromJS({}),
        redirectUri: '',
    }

    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.AnalyticsSavedFilters]: false,
        })
    })

    describe('render()', () => {
        it('should render a loader because the integration is loading', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        loading={fromJS({integration: true})}
                    />
                </Provider>
            )

            expect(container).toMatchSnapshot()
        })

        it('should say the import is in progress', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                import_state: {
                                    products: {is_over: true},
                                    customers: {is_over: false},
                                    external_orders: {is_over: true},
                                },
                            },
                        })}
                    />
                </Provider>
            )

            expect(screen.getByText(/Import in progress/))
        })

        it('should say that the import is over', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                import_state: {
                                    products: {is_over: true},
                                    customers: {is_over: true},
                                    external_orders: {is_over: true},
                                },
                            },
                        })}
                    />
                </Provider>
            )

            expect(
                screen.getByText(
                    /Import complete. The real-time sync with BigCommerce is active./
                )
            )
        })

        it('should render an integration with a delete button that deletes the integration', async () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Integration {...minProps} />
                </Provider>
            )

            expect(container).toMatchSnapshot()
            fireEvent.click(
                screen.getByRole('button', {
                    name: /Delete/,
                })
            )

            expect(screen.queryByText(/Saved Filters/i)).not.toBeInTheDocument()

            await screen.findByText(/Are you sure\?/)

            fireEvent.click(
                screen.getByRole('button', {
                    name: /Confirm/,
                })
            )
            expect(deleteIntegration.mock.calls).toMatchSnapshot()
        })

        it('should render an integration with a delete button and warning text should contain "saved filters" text', () => {
            mockFlags({
                [FeatureFlagKey.AnalyticsSavedFilters]: true,
            })
            renderWithRouter(
                <Provider store={store}>
                    <Integration {...minProps} />
                </Provider>
            )

            fireEvent.click(
                screen.getByRole('button', {
                    name: /Delete/,
                })
            )

            expect(screen.getByText(/Saved Filters/i)).toBeInTheDocument()
        })

        it('should have a reconnect button that redirects to the Oauth flow because the integration is deactivated', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            deactivated_datetime: '2018-01-01 10:12',
                            meta: {shop_id: 'kumbawa'},
                        })}
                        redirectUri={getConnectUrl()}
                    />
                </Provider>
            )

            fireEvent.click(screen.getByRole('button', {name: 'Reconnect'}))
            expect(window.location.href).toBe(getConnectUrl())
        })
    })
})
