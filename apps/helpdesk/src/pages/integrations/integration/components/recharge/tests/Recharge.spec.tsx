import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Recharge from '../Recharge'

const mockStore = configureMockStore([thunk])
const store = mockStore({
    integrations: fromJS({
        integrations: [
            {
                type: 'shopify',
                name: 'myShop1',
                meta: { shop_name: 'myShop1' },
            },
            {
                type: 'shopify',
                name: 'myShop2',
                meta: { shop_name: 'myShop2' },
            },
            {
                type: 'recharge',
                name: 'myShop1',
                meta: { store_name: 'myShop1' },
            },
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
                meta: { store_name: 'myShop1' },
            },
        ]),
        loading: fromJS({}),
        redirectUri: '',
    }
    describe('Detail', () => {
        it('should render a detail view', () => {
            const { container } = render(<Recharge {...minProps} />, {
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it.each([
            [[], [], 'at least one Shopify'],
            [
                [
                    { type: 'recharge', name: 'myShop1' },
                    { type: 'shopify', name: 'myShop1' },
                ],
                [{ type: 'recharge', name: 'myShop1' }],
                'You are all set',
            ],
        ])(
            'should render the appropriate notification banner and disable buttons',
            (storeIntegrations, rechargeIntegrations, bannerText) => {
                render(
                    <Recharge
                        {...minProps}
                        integrations={fromJS(rechargeIntegrations)}
                    />,
                    {
                        storeState: mockStore({
                            integrations: fromJS({ storeIntegrations }),
                        }).getState() as object,
                    },
                )
                expect(screen.getByText(new RegExp(bannerText)))
                expect(
                    screen.getByRole('button', { name: /Connect/ }),
                ).toHaveProperty('disabled')
            },
        )
    })
    describe('Integration', () => {
        it('should render', () => {
            const { container } = render(<Recharge {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/1/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render shopify integrations list', () => {
            const { container } = render(<Recharge {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/new/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('List', () => {
        it('should render', () => {
            const { container } = render(<Recharge {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/connections/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should show no integrations', () => {
            render(<Recharge {...minProps} integrations={fromJS([])} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/recharge/connections/`],
                storeState: store.getState() as object,
            })
            expect(screen.getByText(/You have no integration/))
        })
        it('should have a reconnect button', () => {
            render(
                <Recharge
                    {...minProps}
                    integrations={fromJS([
                        {
                            id: '1',
                            type: 'recharge',
                            name: 'myShop1',
                            meta: { store_name: 'myShop1' },
                            deactivated_datetime: true,
                        },
                    ])}
                />,
                {
                    path: '/:integrationType/:integrationId?',
                    initialEntries: [`/recharge/connections/`],
                    storeState: store.getState() as object,
                },
            )
            expect(screen.getByRole('button', { name: 'Reconnect' }))
        })
    })
})
