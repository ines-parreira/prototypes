import type { ComponentProps } from 'react'

import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'
import * as actions from 'state/integrations/actions'
import { renderWithRouter } from 'utils/testing'

import Integration from '../Integration'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

describe('<ShopifyIntegration/>', () => {
    const minProps: ComponentProps<typeof Integration> = {
        integration: fromJS({}),
        loading: fromJS({}),
        redirectUri: '',
    }

    beforeEach(() => {
        jest.restoreAllMocks()
    })

    describe('render()', () => {
        it('should render a loader because the integration is loading', () => {
            const { container } = renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        loading={fromJS({ integration: true })}
                    />
                </Provider>,
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
                                import_state: { customers: { is_over: false } },
                            },
                        })}
                    />
                </Provider>,
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
                                import_state: { customers: { is_over: true } },
                            },
                        })}
                    />
                </Provider>,
            )

            expect(
                screen.getByText(
                    /Import complete. The real-time sync with Shopify is active./,
                ),
            )
        })

        it('should render an integration with a delete button that deletes the integration', async () => {
            jest.spyOn(actions, 'deleteIntegration')
            const deleteIntegration = actions.deleteIntegration as jest.Mock

            const { container } = renderWithRouter(
                <Provider store={store}>
                    <Integration {...minProps} />
                </Provider>,
            )

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

        it('should display delete warning message and it should contain text about "saved filters"', () => {
            const { getByRole, getByText } = renderWithRouter(
                <Provider store={store}>
                    <Integration {...minProps} />
                </Provider>,
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

        it('should have a update button that redirects to the Oauth flow because the integration has outdated permissions', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                shop_name: 'kumquat',
                                need_scope_update: true,
                            },
                        })}
                        redirectUri="okok{shop_name}"
                    />
                </Provider>,
            )

            fireEvent.click(
                screen.getByRole('button', { name: 'Update App Permissions' }),
            )
            expect(window.location.href).toBe('okokkumquat')
        })

        it('should have a reconnect button that redirects to the Oauth flow because the integration is deactivated', () => {
            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            deactivated_datetime: '2018-01-01 10:12',
                            meta: { shop_name: 'kumquat' },
                        })}
                        redirectUri="okok{shop_name}"
                    />
                </Provider>,
            )

            fireEvent.click(screen.getByRole('button', { name: 'Reconnect' }))
            expect(window.location.href).toBe('okokkumquat')
        })

        it.each([
            'Synchronize customer notes between Gorgias and Shopify',
            'Match customer by Shopify default address phone number',
        ])(
            'should have a disabled update button that gets enabled when one of the options is enabled',
            (optionName: string) => {
                renderWithRouter(
                    <Provider store={store}>
                        <Integration
                            {...minProps}
                            integration={fromJS({
                                meta: {
                                    sync_customer_notes: true,
                                    default_address_phone_matching_enabled: false,
                                },
                            })}
                        />
                    </Provider>,
                )

                expect(
                    screen.getByRole('button', { name: 'Update Connection' }),
                ).toBeAriaDisabled()
                fireEvent.click(
                    screen.getByRole('checkbox', {
                        name: new RegExp(`^${optionName}`),
                    }),
                )
                expect(
                    screen.getByRole('button', { name: 'Update Connection' }),
                ).toBeAriaEnabled()
            },
        )

        it('should correctly update the sync customers option based on integration data, after we fetch it', () => {
            // first, simulate still waiting for the integration data
            const component = renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        loading={fromJS({ integration: true })}
                    />
                </Provider>,
            )

            // then, simulate the integration data being fetched
            component.rerenderComponent(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        loading={fromJS({ integration: false })}
                        integration={fromJS({
                            meta: { sync_customer_notes: false },
                        })}
                    />
                </Provider>,
            )

            const toggle = screen.getByRole('switch', {
                name: /Synchronize customer notes between Gorgias and Shopify/i,
            })
            expect(toggle).toHaveAttribute('aria-checked', 'false')
        })

        it('when enabling DSA phone matching, should send all the integration meta after asking for confirmation', () => {
            jest.spyOn(actions, 'updateOrCreateIntegrationRequest')
            const updateOrCreateIntegrationRequest =
                actions.updateOrCreateIntegrationRequest as jest.Mock

            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                sync_customer_notes: true,
                                default_address_phone_matching_enabled: false,
                            },
                        })}
                    />
                </Provider>,
            )

            fireEvent.click(
                screen.getByRole('switch', {
                    name: /^Synchronize customer notes between Gorgias and Shopify/,
                }),
            )
            fireEvent.click(
                screen.getByRole('switch', {
                    name: /^Match customer by Shopify default address phone number/,
                }),
            )

            fireEvent.click(
                screen.getByRole('button', { name: 'Update Connection' }),
            )

            screen.getByText(/Save changes\?/i)
            fireEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            expect(
                updateOrCreateIntegrationRequest.mock.calls,
            ).toMatchSnapshot()
        })

        it('when not enabling DSA phone matching, should send all the integration meta without asking for confirmation', () => {
            jest.spyOn(actions, 'updateOrCreateIntegrationRequest')
            const updateOrCreateIntegrationRequest =
                actions.updateOrCreateIntegrationRequest as jest.Mock

            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                sync_customer_notes: true,
                                default_address_phone_matching_enabled: true,
                            },
                        })}
                    />
                </Provider>,
            )

            fireEvent.click(
                screen.getByRole('switch', {
                    name: /^Synchronize customer notes between Gorgias and Shopify/,
                }),
            )
            fireEvent.click(
                screen.getByRole('switch', {
                    name: /^Match customer by Shopify default address phone number/,
                }),
            )

            fireEvent.click(
                screen.getByRole('button', { name: 'Update Connection' }),
            )

            expect(screen.queryByText(/Save changes\?/i)).toBeNull()

            expect(
                updateOrCreateIntegrationRequest.mock.calls,
            ).toMatchSnapshot()
        })

        it('when enabling DSA phone matching, the modal should allow to discard changes', () => {
            jest.spyOn(actions, 'updateOrCreateIntegrationRequest')
            const updateOrCreateIntegrationRequest =
                actions.updateOrCreateIntegrationRequest as jest.Mock

            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                default_address_phone_matching_enabled: false,
                            },
                        })}
                    />
                </Provider>,
            )

            fireEvent.click(
                screen.getByRole('switch', {
                    name: /^Match customer by Shopify default address phone number/,
                }),
            )

            fireEvent.click(
                screen.getByRole('button', { name: 'Update Connection' }),
            )

            screen.getByText(/Save changes\?/i)
            fireEvent.click(
                screen.getByRole('button', { name: 'Discard Changes' }),
            )

            expect(
                screen.getByRole('switch', {
                    name: /^Match customer by Shopify default address phone number/,
                }),
            ).toHaveAttribute('aria-checked', 'false')
            expect(updateOrCreateIntegrationRequest.mock.calls).toEqual([])
        })

        it('when enabling DSA phone matching, the modal should allow to go back to editing', () => {
            jest.spyOn(actions, 'updateOrCreateIntegrationRequest')
            const updateOrCreateIntegrationRequest =
                actions.updateOrCreateIntegrationRequest as jest.Mock

            renderWithRouter(
                <Provider store={store}>
                    <Integration
                        {...minProps}
                        integration={fromJS({
                            meta: {
                                default_address_phone_matching_enabled: false,
                            },
                        })}
                    />
                </Provider>,
            )

            fireEvent.click(
                screen.getByRole('switch', {
                    name: /^Match customer by Shopify default address phone number/,
                }),
            )

            fireEvent.click(
                screen.getByRole('button', { name: 'Update Connection' }),
            )

            screen.getByText(/Save changes\?/i)
            fireEvent.click(
                screen.getByRole('button', { name: 'Back To Editing' }),
            )

            expect(
                screen.getByRole('switch', {
                    name: /^Match customer by Shopify default address phone number/,
                }),
            ).toHaveAttribute('aria-checked', 'true')

            expect(updateOrCreateIntegrationRequest.mock.calls).toEqual([])
        })
    })
})
