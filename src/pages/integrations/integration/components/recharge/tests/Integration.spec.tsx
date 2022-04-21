import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import Integration from '../Integration'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('<RechargeIntegration/>', () => {
    const minProps: ComponentProps<typeof Integration> = {
        integration: fromJS({}),
        availableShopifyIntegrations: fromJS({}),
        loading: fromJS({}),
        redirectUri: '',
    }

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

            expect(
                screen.queryByText('Importing your Recharge customers')
                    ?.parentElement?.parentElement
            ).toMatchSnapshot()
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

            expect(
                screen.queryByText(/All your Recharge customers/)
            ).toMatchSnapshot()
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

            expect(container).toMatchSnapshot()
        })

        it('should render an "Update app permissions" button because the integration need scope update', () => {
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

            expect(screen.getByRole('button', {name: 'Update app permissions'}))
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
