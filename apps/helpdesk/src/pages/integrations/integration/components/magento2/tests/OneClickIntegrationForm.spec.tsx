import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from 'models/integration/types'
import * as actions from 'state/integrations/actions'

import OneClickIntegrationForm from '../OneClickIntegrationForm'

jest.spyOn(actions, 'deleteIntegration')
jest.spyOn(actions, 'updateOrCreateIntegrationRequest')
const deleteIntegration = actions.deleteIntegration as jest.Mock
const updateOrCreateIntegrationRequest =
    actions.updateOrCreateIntegrationRequest as jest.Mock

const STORE_URL = 'myShopURL/admin'

const mockStore = configureMockStore([thunk])

const realLocation = window.location

describe('<OneClickIntegrationForm/>', () => {
    afterEach(() => {
        ;(window as unknown as { location: Location }).location = realLocation
        updateOrCreateIntegrationRequest.mockClear()
        deleteIntegration.mockClear()
    })

    describe('when creating', () => {
        const store = mockStore({
            integrations: fromJS({
                integrations: [
                    {
                        type: IntegrationType.Magento2,
                        name: STORE_URL,
                        meta: {
                            store_url: STORE_URL,
                        },
                    },
                ],
            }),
        })

        it('should display an error', () => {
            render(
                <Provider store={store}>
                    <OneClickIntegrationForm
                        integration={fromJS({})}
                        redirectUri=""
                        isSubmitting={false}
                    />
                </Provider>,
            )

            fireEvent.change(screen.getByLabelText(/Store admin URL/), {
                target: { value: STORE_URL },
            })

            expect(screen.queryByText(/already an integration/)).toBeTruthy()
        })

        it('should redirect when submitting', () => {
            Reflect.deleteProperty(window, 'location')
            Object.defineProperty(window, 'location', {
                writable: true,
                value: {
                    href: 'truc',
                },
            })
            render(
                <Provider store={store}>
                    <OneClickIntegrationForm
                        integration={fromJS({})}
                        redirectUri="something"
                        isSubmitting={false}
                    />
                </Provider>,
            )

            fireEvent.change(screen.getByLabelText(/Store admin URL/), {
                target: { value: 'myShopURL1/admin' },
            })

            fireEvent.submit(
                screen.getByRole('button', { name: 'Connect App' }),
            )
            expect(window.location.href).toBe(
                `something?store_url=myShopURL1&admin_url_suffix=admin`,
            )
        })
    })

    describe('when updating', () => {
        const store = mockStore({})
        it('should call update action when submitting', () => {
            render(
                <Provider store={store}>
                    <OneClickIntegrationForm
                        integration={fromJS({
                            meta: { admin_url_suffix: 'not-admin' },
                        })}
                        redirectUri="something"
                        isSubmitting={false}
                        isUpdate
                    />
                </Provider>,
            )

            fireEvent.change(screen.getByLabelText(/Store admin URL/), {
                target: { value: 'admin' },
            })

            fireEvent.click(
                screen.getByRole('button', { name: 'Update Connection' }),
            )

            expect(updateOrCreateIntegrationRequest.mock.calls)
                .toMatchInlineSnapshot(`
                [
                  [
                    Immutable.Map {
                      "meta": Immutable.Map {
                        "admin_url_suffix": "admin",
                        "is_manual": false,
                        "auth": null,
                      },
                    },
                  ],
                ]
            `)
        })

        it('should call delete action when submitting', async () => {
            render(
                <Provider store={store}>
                    <OneClickIntegrationForm
                        integration={fromJS({
                            meta: { admin_url_suffix: 'admin' },
                        })}
                        redirectUri="something"
                        isSubmitting={false}
                        isUpdate
                    />
                </Provider>,
            )

            fireEvent.change(screen.getByLabelText(/Store admin URL/), {
                target: { value: 'myShopURL1/admin' },
            })

            fireEvent.click(screen.getByRole('button', { name: /Delete/ }))

            await screen.findByText(/Are you sure\?/)
            fireEvent.click(
                screen.getByRole('button', {
                    name: /Confirm/,
                }),
            )

            expect(deleteIntegration.mock.calls).toMatchInlineSnapshot(`
                [
                  [
                    Immutable.Map {
                      "meta": Immutable.Map {
                        "admin_url_suffix": "admin",
                      },
                    },
                  ],
                ]
            `)
        })
    })
})
