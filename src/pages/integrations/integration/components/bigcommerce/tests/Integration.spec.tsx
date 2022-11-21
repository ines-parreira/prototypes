import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {fireEvent, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import * as actions from 'state/integrations/actions'
import Integration from '../Integration'
import {getConnectUrl} from '../Utils'

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
            await screen.findByText(/Are you sure\?/)
            fireEvent.click(
                screen.getByRole('button', {
                    name: /Confirm/,
                })
            )
            expect(deleteIntegration.mock.calls).toMatchSnapshot()
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
