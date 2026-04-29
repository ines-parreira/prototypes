import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

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
                meta: { store_name: 'myShop1' },
            },
        ]),
        loading: fromJS({}),
        redirectUri: '',
    }
    describe('Detail', () => {
        it('should render a detail view', () => {
            const { container } = render(<BigCommerce {...minProps} />, {
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('Integration', () => {
        it('should render', () => {
            const { container } = render(<BigCommerce {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/bigcommerce/1/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
    })
    describe('List', () => {
        it('should render', () => {
            const { container } = render(<BigCommerce {...minProps} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/bigcommerce/connections/`],
                storeState: store.getState() as object,
            })
            expect(container.firstChild).toMatchSnapshot()
        })
        it('should show no integrations', () => {
            render(<BigCommerce {...minProps} integrations={fromJS([])} />, {
                path: '/:integrationType/:integrationId?',
                initialEntries: [`/bigcommerce/connections/`],
                storeState: store.getState() as object,
            })
            expect(screen.getByText(/You have no integration/))
        })
        it('should have a reconnect button', () => {
            render(
                <BigCommerce
                    {...minProps}
                    integrations={fromJS([
                        {
                            id: '1',
                            type: 'bigcommerce',
                            name: 'myShop1',
                            meta: { shop_id: '1337' },
                            deactivated_datetime: true,
                        },
                    ])}
                />,
                {
                    path: '/:integrationType/:integrationId?',
                    initialEntries: [`/bigcommerce/connections/`],
                    storeState: store.getState() as object,
                },
            )
            expect(screen.getByRole('button', { name: 'Reconnect' }))
        })
    })
})
