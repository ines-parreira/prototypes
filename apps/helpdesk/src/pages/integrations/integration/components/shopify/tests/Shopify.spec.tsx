import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Shopify from '../Shopify'

const mockStore = configureMockStore([thunk])
const store = mockStore({})
describe('<Shopify/>', () => {
    const minProps: ComponentProps<typeof Shopify> = {
        integration: fromJS({}),
        integrations: fromJS([
            {
                id: '1',
                type: 'shopify',
                name: 'myShop1',
                meta: { shop_name: 'myShop1' },
            },
        ]),
        loading: fromJS({}),
        redirectUri: '',
    }
    describe('Detail', () => {
        it('should render a detail view', () => {
            const { container } = render(<Shopify {...minProps} />, {
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('Integration', () => {
        it('should render', () => {
            const { container } = render(<Shopify {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/shopify/1/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('List', () => {
        it('should render', () => {
            const { container } = render(<Shopify {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/shopify/connections/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should show no integrations', () => {
            render(<Shopify {...minProps} integrations={fromJS([])} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/shopify/connections/`],
                storeState: store.getState() as object,
            })
            expect(screen.getByText(/You have no integration/))
        })
        it('should have a reconnect button', () => {
            render(
                <Shopify
                    {...minProps}
                    integrations={fromJS([
                        {
                            id: '1',
                            type: 'Shopify',
                            name: 'myShop1',
                            meta: { shop_id: '1337' },
                            deactivated_datetime: true,
                        },
                    ])}
                />,
                {
                    path: '/:integrationType/:integrationId?',
                    initialEntries: [`/shopify/connections/`],
                    storeState: store.getState() as object,
                },
            )
            expect(screen.getByRole('button', { name: 'Reconnect' }))
        })
    })
})
