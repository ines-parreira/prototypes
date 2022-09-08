import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {fireEvent, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import * as actions from 'state/integrations/actions'
import Integration from '../Integration'

jest.spyOn(actions, 'deleteIntegration')
jest.spyOn(actions, 'updateOrCreateIntegrationRequest')
const deleteIntegration = actions.deleteIntegration as jest.Mock
const updateOrCreateIntegrationRequest =
    actions.updateOrCreateIntegrationRequest as jest.Mock

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('<ShopifyIntegration/>', () => {
    const minProps: ComponentProps<typeof Integration> = {
        integration: fromJS({}),
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

        it('should say the import is in progress', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                import_state: {customers: {is_over: false}},
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
                                import_state: {customers: {is_over: true}},
                            },
                        })}
                    />
                </Provider>
            )

            expect(screen.getByText(/All your Shopify customers/))
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
            await screen.findByText(/Are you sure\?/)
            fireEvent.click(
                screen.getByRole('button', {
                    name: /Confirm/,
                })
            )
            expect(deleteIntegration.mock.calls).toMatchSnapshot()
        })

        it('should have a update button that redirects to the Oauth flow because the integration has outdated permissions', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                shop_name: 'kumquat',
                                need_scope_update: true,
                            },
                        })}
                        redirectUri="okok{shop_name}"
                    />
                </Provider>
            )

            fireEvent.click(
                screen.getByRole('button', {name: 'Update App Permissions'})
            )
            expect(window.location.href).toBe('okokkumquat')
        })

        it('should have a reconnect button that redirects to the Oauth flow because the integration is deactivated', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            deactivated_datetime: '2018-01-01 10:12',
                            meta: {shop_name: 'kumquat'},
                        })}
                        redirectUri="okok{shop_name}"
                    />
                </Provider>
            )

            fireEvent.click(screen.getByRole('button', {name: 'Reconnect'}))
            expect(window.location.href).toBe('okokkumquat')
        })

        it('should have a disabled update button that gets enabled when synchronization is changed and trigger an update', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {sync_customer_notes: true},
                        })}
                    />
                </Provider>
            )

            expect(
                screen
                    .getByRole('button', {name: 'Update Connection'})
                    .hasAttribute('disabled')
            ).toBeTruthy()
            fireEvent.click(screen.getByRole('checkbox'))
            expect(
                screen
                    .getByRole('button', {name: 'Update Connection'})
                    .hasAttribute('disabled')
            ).toBeFalsy()
            fireEvent.click(
                screen.getByRole('button', {name: 'Update Connection'})
            )
            expect(
                updateOrCreateIntegrationRequest.mock.calls
            ).toMatchSnapshot()
        })
    })
})
