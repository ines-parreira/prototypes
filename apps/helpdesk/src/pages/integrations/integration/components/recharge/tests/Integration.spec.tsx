import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Integration } from 'pages/integrations/integration/components/recharge/Integration'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'

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
            const { container } = render(
                <Integration
                    {...minProps}
                    loading={fromJS({ integration: true })}
                />,
                {
                    storeState: store.getState() as object,
                },
            )
            expect(container).toMatchSnapshot()
        })
        it('should render an alert because the import is in progress', () => {
            render(
                <Integration
                    {...minProps}
                    integration={fromJS({
                        meta: {
                            sync_state: { is_initialized: false },
                        },
                    })}
                />,
                {
                    storeState: store.getState() as object,
                },
            )
            expect(screen.queryByText(/currently importing/))
        })
        it('should render a small paragraph because the import is over', () => {
            render(
                <Integration
                    {...minProps}
                    integration={fromJS({
                        meta: {
                            sync_state: { is_initialized: true },
                        },
                    })}
                />,
                {
                    storeState: store.getState() as object,
                },
            )
            expect(screen.queryByText(/All your Recharge customers/))
        })
        it('should display a list of shopify stores to connect to', () => {
            const { container } = render(
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
                />,
                {
                    path: '/:integrationType/:integrationId?',
                    initialEntries: [`/recharge/new`],
                    storeState: store.getState() as object,
                },
            )
            expect(container).toMatchSnapshot()
        })
        it('should render an integration with a delete button', () => {
            const { container } = render(<Integration {...minProps} />, {
                storeState: store.getState() as object,
            })
            expect(container).toMatchSnapshot()
        })
        it('should display delete warning message and it should contain text about "saved filters"', () => {
            const { getByRole, getByText } = render(
                <Integration {...minProps} />,
                {
                    storeState: store.getState() as object,
                },
            )
            fireEvent.click(
                getByRole('button', {
                    name: /Delete app/i,
                }),
            )
            expect(
                getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT),
            ).toBeInTheDocument()
        })
        it('should render an "Update App Permissions" button because the integration need scope update', () => {
            render(
                <Integration
                    {...minProps}
                    integration={fromJS({
                        meta: {
                            need_scope_update: true,
                        },
                    })}
                />,
                {
                    storeState: store.getState() as object,
                },
            )
            expect(
                screen.getByRole('button', { name: 'Update App Permissions' }),
            )
        })
        it('should render a reconnect button because the integration is deactivated', () => {
            render(
                <Integration
                    {...minProps}
                    integration={fromJS({
                        deactivated_datetime: '2018-01-01 10:12',
                    })}
                />,
                {
                    storeState: store.getState() as object,
                },
            )
            expect(screen.getByRole('button', { name: 'Reconnect' }))
        })
    })
})
