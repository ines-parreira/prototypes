import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { Integration } from 'pages/integrations/integration/components/bigcommerce/Integration'
import { getConnectUrl } from 'pages/integrations/integration/components/bigcommerce/Utils'
import * as actions from 'state/integrations/actions'

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
        it('should say the import is in progress', () => {
            render(
                <Integration
                    {...minProps}
                    integration={fromJS({
                        meta: {
                            import_state: {
                                products: { is_over: true },
                                customers: { is_over: false },
                                external_orders: { is_over: true },
                            },
                        },
                    })}
                />,
                {
                    storeState: store.getState() as object,
                },
            )
            expect(screen.getByText(/Import in progress/))
        })
        it('should say that the import is over', () => {
            render(
                <Integration
                    {...minProps}
                    integration={fromJS({
                        meta: {
                            import_state: {
                                products: { is_over: true },
                                customers: { is_over: true },
                                external_orders: { is_over: true },
                            },
                        },
                    })}
                />,
                {
                    storeState: store.getState() as object,
                },
            )
            expect(
                screen.getByText(
                    /Import complete. The real-time sync with BigCommerce is active./,
                ),
            )
        })
        it('should render an integration with a delete button that deletes the integration', async () => {
            const { container } = render(<Integration {...minProps} />, {
                storeState: store.getState() as object,
            })
            expect(container).toMatchSnapshot()
            fireEvent.click(
                screen.getByRole('button', {
                    name: /Delete/,
                }),
            )
            await screen.findByText(/Are you sure\?/)
            fireEvent.click(
                screen.getByRole('button', {
                    name: /Confirm/,
                }),
            )
            expect(deleteIntegration.mock.calls).toMatchSnapshot()
        })
        it('should have a reconnect button that redirects to the Oauth flow because the integration is deactivated', () => {
            render(
                <Integration
                    {...minProps}
                    integration={fromJS({
                        deactivated_datetime: '2018-01-01 10:12',
                        meta: { shop_id: 'kumbawa' },
                    })}
                    redirectUri={getConnectUrl()}
                />,
                {
                    storeState: store.getState() as object,
                },
            )
            fireEvent.click(screen.getByRole('button', { name: 'Reconnect' }))
            expect(window.location.href).toBe(getConnectUrl())
        })
    })
})
