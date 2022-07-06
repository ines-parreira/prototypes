import React from 'react'
import {fromJS} from 'immutable'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as actions from 'state/integrations/actions'
import ManualIntegrationForm from '../ManualIntegrationForm'

jest.spyOn(actions, 'deleteIntegration')
jest.spyOn(actions, 'updateOrCreateIntegrationRequest')
const deleteIntegration = actions.deleteIntegration as jest.Mock
const updateOrCreateIntegrationRequest =
    actions.updateOrCreateIntegrationRequest as jest.Mock

const mockStore = configureMockStore([thunk])

const store = mockStore({})

describe('<ManualIntegrationForm/>', () => {
    afterEach(() => {
        updateOrCreateIntegrationRequest.mockClear()
        deleteIntegration.mockClear()
    })

    describe('when creating', () => {
        it('should call create action when submitting', () => {
            render(
                <Provider store={store}>
                    <ManualIntegrationForm
                        integration={fromJS({})}
                        isSubmitting={false}
                    />
                </Provider>
            )

            fireEvent.change(screen.getByLabelText('Store admin URL'), {
                target: {value: 'myShopURL/admin'},
            })

            fireEvent.change(screen.getByLabelText(/Consumer Key/), {
                target: {value: 'consumerkey'},
            })

            fireEvent.change(screen.getByLabelText(/Consumer Secret/), {
                target: {value: 'consumersecret'},
            })

            const accesTokens = screen.getAllByLabelText(/Access Token/)

            fireEvent.change(accesTokens[0], {
                target: {value: 'accesstoken'},
            })

            fireEvent.change(accesTokens[1], {
                target: {value: 'tokensecret'},
            })

            fireEvent.click(
                screen.getByRole('button', {name: 'Add integration'})
            )

            expect(updateOrCreateIntegrationRequest.mock.calls)
                .toMatchInlineSnapshot(`
                Array [
                  Array [
                    Immutable.Map {
                      "type": "magento2",
                      "connections": Immutable.List [
                        Immutable.Map {
                          "data": Immutable.Map {
                            "consumer_key": "consumerkey",
                            "consumer_secret": "consumersecret",
                            "oauth_token": "accesstoken",
                            "oauth_token_secret": "tokensecret",
                          },
                        },
                      ],
                      "deactivated_datetime": null,
                      "meta": Immutable.Map {
                        "store_url": "myShopURL/admin",
                        "admin_url_suffix": "",
                        "is_manual": true,
                      },
                    },
                  ],
                ]
            `)
        })
    })

    describe('when updating', () => {
        const store = mockStore({})
        it('should call update action when submitting', () => {
            render(
                <Provider store={store}>
                    <ManualIntegrationForm
                        integration={fromJS({
                            meta: {admin_url_suffix: 'not-admin'},
                        })}
                        isSubmitting={false}
                        isUpdate
                    />
                </Provider>
            )

            fireEvent.change(screen.getByLabelText('Store admin URL'), {
                target: {value: 'admin'},
            })

            fireEvent.change(screen.getByLabelText('Consumer Key'), {
                target: {value: 'consumerkey'},
            })

            fireEvent.change(screen.getByLabelText('Consumer Secret'), {
                target: {value: 'consumersecret'},
            })

            fireEvent.change(screen.getByLabelText('Access Token'), {
                target: {value: 'accesstoken'},
            })

            fireEvent.change(screen.getByLabelText('Access Token Secret'), {
                target: {value: 'tokensecret'},
            })

            fireEvent.click(
                screen.getByRole('button', {name: 'Update integration'})
            )

            expect(updateOrCreateIntegrationRequest.mock.calls)
                .toMatchInlineSnapshot(`
                Array [
                  Array [
                    Immutable.Map {
                      "meta": Immutable.Map {
                        "admin_url_suffix": "admin",
                        "store_url": "",
                        "is_manual": true,
                      },
                      "type": "magento2",
                      "connections": Immutable.List [
                        Immutable.Map {
                          "data": Immutable.Map {
                            "consumer_key": "consumerkey",
                            "consumer_secret": "consumersecret",
                            "oauth_token": "accesstoken",
                            "oauth_token_secret": "tokensecret",
                          },
                        },
                      ],
                      "deactivated_datetime": null,
                    },
                  ],
                ]
            `)
        })

        it('should call delete action when submitting', async () => {
            render(
                <Provider store={store}>
                    <ManualIntegrationForm
                        integration={fromJS({
                            meta: {admin_url_suffix: 'admin'},
                        })}
                        isSubmitting={false}
                        isUpdate
                    />
                </Provider>
            )

            fireEvent.change(screen.getByLabelText('Store admin URL'), {
                target: {value: 'myShopURL1/admin'},
            })

            fireEvent.click(screen.getByRole('button', {name: /Delete/}))

            await screen.findByText(/Are you sure\?/)
            fireEvent.click(
                screen.getByRole('button', {
                    name: /Confirm/,
                })
            )

            expect(deleteIntegration.mock.calls).toMatchInlineSnapshot(`
                Array [
                  Array [
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
