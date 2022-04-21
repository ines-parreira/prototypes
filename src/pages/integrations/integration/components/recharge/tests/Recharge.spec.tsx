import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import Recharge from '../Recharge'

const mockStore = configureMockStore([thunk])
const store = mockStore({
    integrations: fromJS({
        integrations: [
            {
                type: 'shopify',
                name: 'myShop1',
                meta: {shop_name: 'myShop1'},
            },
            {
                type: 'shopify',
                name: 'myShop2',
                meta: {shop_name: 'myShop2'},
            },
            {type: 'recharge', name: 'myShop1', meta: {store_name: 'myShop1'}},
        ],
    }),
})

describe('<Recharge/>', () => {
    const minProps: ComponentProps<typeof Recharge> = {
        integration: fromJS({}),
        integrations: fromJS([
            {
                id: '1',
                type: 'recharge',
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
                    <Recharge {...minProps} />
                </Provider>
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it.each([
            [[], [], 'at least one Shopify'],
            [
                [
                    {type: 'recharge', name: 'myShop1'},
                    {type: 'shopify', name: 'myShop1'},
                ],
                [{type: 'recharge', name: 'myShop1'}],
                'You are all set',
            ],
        ])(
            'should render the appropriate notification banner and disable buttons',
            (storeIntegrations, rechargeIntegrations, bannerText) => {
                renderWithRouter(
                    <Provider
                        store={mockStore({
                            integrations: fromJS({storeIntegrations}),
                        })}
                    >
                        <Recharge
                            {...minProps}
                            integrations={fromJS(rechargeIntegrations)}
                        />
                    </Provider>
                )

                expect(screen.getByText(new RegExp(bannerText)))
                expect(
                    screen.getByRole('button', {name: 'Connect App'})
                ).toHaveProperty('disabled')
            }
        )
    })

    describe('Integration', () => {
        it('should render', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Recharge {...minProps} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/recharge/1/`,
                }
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render shopify integrations list', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Recharge {...minProps} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/recharge/new/`,
                }
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('List', () => {
        it('should render', () => {
            const {container} = renderWithRouter(
                <Provider store={store}>
                    <Recharge {...minProps} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/recharge/connections/`,
                }
            )
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should show no integrations', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Recharge {...minProps} integrations={fromJS([])} />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/recharge/connections/`,
                }
            )
            expect(screen.getByText(/You have no integration/))
        })
        it('should have a reconnect button', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Recharge
                        {...minProps}
                        integrations={fromJS([
                            {
                                id: '1',
                                type: 'recharge',
                                name: 'myShop1',
                                meta: {store_name: 'myShop1'},
                                deactivated_datetime: true,
                            },
                        ])}
                    />
                </Provider>,
                {
                    path: '/:integrationType/:integrationId?',
                    route: `/recharge/connections/`,
                }
            )
            expect(screen.getByRole('button', {name: 'Reconnect'}))
        })
    })
})
