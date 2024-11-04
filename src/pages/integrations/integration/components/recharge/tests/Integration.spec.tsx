import {fireEvent, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import Integration from 'pages/integrations/integration/components/recharge/Integration'
import {
    INTEGRATION_REMOVAL_CONFIGURATION_TEXT,
    INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT,
} from 'pages/integrations/integration/constants'
import {renderWithRouter} from 'utils/testing'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('<RechargeIntegration/>', () => {
    const minProps: ComponentProps<typeof Integration> = {
        integration: fromJS({}),
        availableShopifyIntegrations: fromJS({}),
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

        it('should render an alert because the import is in progress', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                sync_state: {is_initialized: false},
                            },
                        })}
                    />
                </Provider>
            )

            expect(screen.queryByText(/currently importing/))
        })

        it('should render a small paragraph because the import is over', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                sync_state: {is_initialized: true},
                            },
                        })}
                    />
                </Provider>
            )

            expect(screen.queryByText(/All your Recharge customers/))
        })

        it('should display a list of shopify stores to connect to', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        availableShopifyIntegrations={fromJS([
                            {
                                type: 'shopify',
                                name: 'my first mock store',
                                id: '1',
                            },
                            {
                                type: 'shopify',
                                name: 'my second mock store',
                                id: '2',
                            },
                        ])}
                    />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/recharge/new`,
                }
            )

            expect(container).toMatchSnapshot()
        })

        it('should render an integration with a delete button', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Integration {...minProps} />
                </Provider>
            )
            screen.debug()
            expect(container).toMatchSnapshot()
        })

        it('should display delete warning message and it should not contain text about "saved filters"', () => {
            const {getByRole, getByText, queryByText} = renderWithRouter(
                <Provider store={store}>
                    <Integration {...minProps} />
                </Provider>
            )

            fireEvent.click(
                getByRole('button', {
                    name: /Delete app/i,
                })
            )
            expect(
                getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT)
            ).toBeInTheDocument()
            expect(
                queryByText(INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT)
            ).not.toBeInTheDocument()
        })

        it('should display delete warning message and it should contain text about "saved filters"', () => {
            mockFlags({
                [FeatureFlagKey.AnalyticsSavedFilters]: true,
            })
            const {getByRole, getByText} = renderWithRouter(
                <Provider store={store}>
                    <Integration {...minProps} />
                </Provider>
            )

            fireEvent.click(
                getByRole('button', {
                    name: /Delete app/i,
                })
            )
            expect(
                getByText(
                    `${INTEGRATION_REMOVAL_CONFIGURATION_TEXT} ${INTEGRATION_SAVED_FILTERS_REMOVAL_CONFIRMATION_TEXT}`
                )
            ).toBeInTheDocument()
        })

        it('should render an "Update App Permissions" button because the integration need scope update', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                need_scope_update: true,
                            },
                        })}
                    />
                </Provider>
            )

            expect(screen.getByRole('button', {name: 'Update App Permissions'}))
        })

        it('should render a reconnect button because the integration is deactivated', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            deactivated_datetime: '2018-01-01 10:12',
                        })}
                    />
                </Provider>
            )

            expect(screen.getByRole('button', {name: 'Reconnect'}))
        })
    })
})
