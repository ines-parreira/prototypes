import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import BigCommerce from '../BigCommerce'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('<BigCommerce/>', () => {
    const minProps: ComponentProps<typeof BigCommerce> = {
        integration: fromJS({}),
        integrations: fromJS([
            {
                id: '1',
                type: 'bigcommerce',
                name: 'myShop1',
                meta: {store_name: 'myShop1'},
            },
        ]),
        loading: fromJS({}),
        redirectUri: '',
    }

    describe('Detail', () => {
        it('should render a detail view', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <BigCommerce {...minProps} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('Integration', () => {
        it('should render', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <BigCommerce {...minProps} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/bigcommerce/1/`,
                }
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('List', () => {
        it('should render', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <BigCommerce {...minProps} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/bigcommerce/connections/`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should show no integrations', () => {
            renderWithRouter(
                <Provider store={store}>
                    <BigCommerce {...minProps} integrations={fromJS([])} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/bigcommerce/connections/`,
                }
            )
            expect(screen.getByText(/You have no integration/))
        })
        it('should have a reconnect button', () => {
            renderWithRouter(
                <Provider store={store}>
                    <BigCommerce
                        {...minProps}
                        integrations={fromJS([
                            {
                                id: '1',
                                type: 'bigcommerce',
                                name: 'myShop1',
                                meta: {shop_id: '1337'},
                                deactivated_datetime: true,
                            },
                        ])}
                    />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/bigcommerce/connections/`,
                }
            )
            expect(screen.getByRole('button', {name: 'Reconnect'}))
        })
    })
})
