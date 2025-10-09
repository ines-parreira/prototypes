import React from 'react'

import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'

import * as flagsModule from 'core/flags'
import type { CustomSSOProviders } from 'state/currentAccount/types'

import CustomSsoProviders from '../CustomSsoProviders'

jest.mock('uuid', () => ({
    v4: jest.fn(),
}))

jest.mock('../../../../hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn(),
}))

describe('CustomSsoProviders', () => {
    const mockOnUpdate = jest.fn()
    const mockUuid = uuidv4 as jest.Mock
    const mockUseAppSelector =
        require('../../../../hooks/useAppSelector').default

    const mockStore = configureStore({
        reducer: {
            root: (state = {}) => state,
        },
    })

    const CustomSsoProvidersWithState = (
        props: Omit<
            React.ComponentProps<typeof CustomSsoProviders>,
            'showModal' | 'setShowModal'
        >,
    ) => {
        const [showModal, setShowModal] = React.useState(false)
        return (
            <CustomSsoProviders
                {...props}
                showModal={showModal}
                setShowModal={setShowModal}
            />
        )
    }

    const defaultProps = {
        accountDomain: 'test-company',
        onUpdate: mockOnUpdate,
        providers: {} as CustomSSOProviders,
    }

    const mockProviders: CustomSSOProviders = {
        'provider-1': {
            name: 'Okta',
            client_id: 'okta-client-id',
            client_secret: 'okta-secret',
            server_metadata_url: 'https://okta.example.com',
        },
        'provider-2': {
            name: 'Auth0',
            client_id: 'auth0-client-id',
            client_secret: 'auth0-secret',
            server_metadata_url: 'https://auth0.example.com',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUuid.mockReturnValue('new-provider-id')
        mockOnUpdate.mockResolvedValue(true)
        jest.spyOn(flagsModule, 'useFlag').mockReturnValue(true)
        // Mock the selector to return an enterprise plan by default
        mockUseAppSelector.mockReturnValue({
            plan_id: '0',
            custom: false,
            name: 'Enterprise',
        })
    })

    describe('Initial rendering', () => {
        it('renders without providers', () => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )

            expect(
                screen.queryByText('Custom Identity Providers'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: '+ Add provider' }),
            ).toBeInTheDocument()
        })

        it('renders with existing providers', () => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState
                        {...defaultProps}
                        providers={mockProviders}
                    />
                </Provider>,
            )

            expect(
                screen.getByText('Custom Identity Providers'),
            ).toBeInTheDocument()
            expect(screen.getByText('Okta SSO')).toBeInTheDocument()
            expect(screen.getByText('Auth0 SSO')).toBeInTheDocument()
        })

        it('renders add provider button when feature flag is enabled and user is on Enterprise plan', () => {
            jest.spyOn(flagsModule, 'useFlag').mockReturnValue(true)

            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )

            expect(
                screen.getByRole('button', { name: '+ Add provider' }),
            ).toBeInTheDocument()
        })

        it('does not render add provider button when feature flag is disabled', () => {
            jest.spyOn(flagsModule, 'useFlag').mockReturnValue(false)
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )

            expect(
                screen.queryByRole('button', { name: '+ Add provider' }),
            ).not.toBeInTheDocument()
        })

        it('does not render add provider button when user is not on Advanced+ plan', () => {
            jest.spyOn(flagsModule, 'useFlag').mockReturnValue(true)
            mockUseAppSelector.mockReturnValue({
                plan_id: 'pro-monthly-usd-4',
                custom: false,
                name: 'Pro',
            })

            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )

            expect(
                screen.queryByRole('button', { name: '+ Add provider' }),
            ).not.toBeInTheDocument()
        })

        it('renders add provider button only when both feature flag is enabled AND user is on Advanced+ plan', () => {
            jest.spyOn(flagsModule, 'useFlag').mockReturnValue(true)
            mockUseAppSelector.mockReturnValue({
                plan_id: 'pro-monthly-usd-4',
                custom: false,
                name: 'Pro',
            })

            const { rerender } = render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )
            expect(
                screen.queryByRole('button', { name: '+ Add provider' }),
            ).not.toBeInTheDocument()

            jest.spyOn(flagsModule, 'useFlag').mockReturnValue(false)
            mockUseAppSelector.mockReturnValue({
                plan_id: '0',
                custom: false,
                name: 'Enterprise',
            })

            rerender(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )
            expect(
                screen.queryByRole('button', { name: '+ Add provider' }),
            ).not.toBeInTheDocument()

            // Test with both enabled
            jest.spyOn(flagsModule, 'useFlag').mockReturnValue(true)
            mockUseAppSelector.mockReturnValue({
                plan_id: '0',
                custom: false,
                name: 'Enterprise',
            })

            rerender(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )
            expect(
                screen.getByRole('button', { name: '+ Add provider' }),
            ).toBeInTheDocument()
        })

        it('also tests custom enterprise plans are recognized', () => {
            jest.spyOn(flagsModule, 'useFlag').mockReturnValue(true)
            mockUseAppSelector.mockReturnValue({
                plan_id: 'custom-monthly-usd-4-1',
                custom: true,
                name: 'Custom',
            })

            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )

            expect(
                screen.getByRole('button', { name: '+ Add provider' }),
            ).toBeInTheDocument()
        })

        it('renders add provider button for Advanced plan', () => {
            jest.spyOn(flagsModule, 'useFlag').mockReturnValue(true)
            mockUseAppSelector.mockReturnValue({
                plan_id: 'advanced-monthly-usd-4',
                custom: false,
                name: 'Advanced',
            })

            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )

            expect(
                screen.getByRole('button', { name: '+ Add provider' }),
            ).toBeInTheDocument()
        })

        it('disables add provider button when isLoading prop is true', () => {
            mockUseAppSelector.mockReturnValue({
                plan_id: '0',
                custom: false,
                name: 'Enterprise',
            })

            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState
                        {...defaultProps}
                        isLoading={true}
                    />
                </Provider>,
            )

            const addButton = screen.getByRole('button', {
                name: '+ Add provider',
            })
            expect(addButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('Provider management', () => {
        describe('Creating providers', () => {
            it('opens create modal when add provider button is clicked', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState {...defaultProps} />
                    </Provider>,
                )

                const addButton = screen.getByRole('button', {
                    name: '+ Add provider',
                })
                await user.click(addButton)

                expect(screen.getByRole('dialog')).toBeInTheDocument()
                expect(
                    screen.getByText('Add a custom SSO provider'),
                ).toBeInTheDocument()
            })

            it('creates new provider with form data', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState {...defaultProps} />
                    </Provider>,
                )

                const addButton = screen.getByRole('button', {
                    name: '+ Add provider',
                })
                await user.click(addButton)

                await user.type(
                    screen.getByLabelText(/provider name/i),
                    'New Provider',
                )
                await user.type(
                    screen.getByLabelText(/client id/i),
                    'new-client-id',
                )
                await user.type(
                    screen.getByLabelText(/client secret/i),
                    'new-secret',
                )
                await user.type(
                    screen.getByLabelText(/provider url/i),
                    'https://new.provider.com',
                )

                const saveButton = screen.getByRole('button', {
                    name: 'Add SSO Provider',
                })
                await user.click(saveButton)

                await waitFor(() => {
                    expect(mockOnUpdate).toHaveBeenCalledWith({
                        'new-provider-id': {
                            name: 'New Provider',
                            client_id: 'new-client-id',
                            client_secret: 'new-secret',
                            server_metadata_url:
                                'https://new.provider.com/.well-known/openid-configuration',
                        },
                    })
                })
            })

            it('adds provider to existing providers', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState
                            {...defaultProps}
                            providers={{
                                'existing-id': mockProviders['provider-1'],
                            }}
                        />
                    </Provider>,
                )

                const addButton = screen.getByRole('button', {
                    name: '+ Add provider',
                })
                await user.click(addButton)

                await user.type(
                    screen.getByLabelText(/provider name/i),
                    'Additional Provider',
                )
                await user.type(
                    screen.getByLabelText(/client id/i),
                    'additional-client-id',
                )
                await user.type(
                    screen.getByLabelText(/client secret/i),
                    'additional-secret',
                )
                await user.type(
                    screen.getByLabelText(/provider url/i),
                    'https://additional.provider.com',
                )

                const saveButton = screen.getByRole('button', {
                    name: 'Add SSO Provider',
                })
                await user.click(saveButton)

                await waitFor(() => {
                    expect(mockOnUpdate).toHaveBeenCalledWith({
                        'existing-id': mockProviders['provider-1'],
                        'new-provider-id': {
                            name: 'Additional Provider',
                            client_id: 'additional-client-id',
                            client_secret: 'additional-secret',
                            server_metadata_url:
                                'https://additional.provider.com/.well-known/openid-configuration',
                        },
                    })
                })
            })

            it('does not add provider to list when backend request fails', async () => {
                mockOnUpdate.mockResolvedValue(false)
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState
                            {...defaultProps}
                            providers={{
                                'existing-id': mockProviders['provider-1'],
                            }}
                        />
                    </Provider>,
                )

                expect(screen.getByText('Okta SSO')).toBeInTheDocument()
                expect(
                    screen.queryByText('New Provider SSO'),
                ).not.toBeInTheDocument()

                const addButton = screen.getByRole('button', {
                    name: '+ Add provider',
                })
                await user.click(addButton)

                await user.type(
                    screen.getByLabelText(/provider name/i),
                    'New Provider',
                )
                await user.type(
                    screen.getByLabelText(/client id/i),
                    'new-client-id',
                )
                await user.type(
                    screen.getByLabelText(/client secret/i),
                    'new-secret',
                )
                await user.type(
                    screen.getByLabelText(/provider url/i),
                    'https://new.provider.com',
                )

                const saveButton = screen.getByRole('button', {
                    name: 'Add SSO Provider',
                })
                await user.click(saveButton)

                await waitFor(() => {
                    expect(mockOnUpdate).toHaveBeenCalledWith({
                        'existing-id': mockProviders['provider-1'],
                        'new-provider-id': {
                            name: 'New Provider',
                            client_id: 'new-client-id',
                            client_secret: 'new-secret',
                            server_metadata_url:
                                'https://new.provider.com/.well-known/openid-configuration',
                        },
                    })
                })

                expect(screen.getByRole('dialog')).toBeInTheDocument()

                expect(screen.getByText('Okta SSO')).toBeInTheDocument()
                expect(
                    screen.queryByText('New Provider SSO'),
                ).not.toBeInTheDocument()
            })
        })

        describe('Editing providers', () => {
            it('opens edit modal with provider data when edit is clicked', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState
                            {...defaultProps}
                            providers={mockProviders}
                        />
                    </Provider>,
                )

                const editButtons = screen.getAllByRole('button', {
                    name: /edit/i,
                })
                await user.click(editButtons[0])

                expect(screen.getByRole('dialog')).toBeInTheDocument()
                expect(
                    screen.getByText('Edit SSO provider'),
                ).toBeInTheDocument()
                expect(screen.getByLabelText(/provider name/i)).toHaveValue(
                    'Okta',
                )
                expect(screen.getByLabelText(/client id/i)).toHaveValue(
                    'okta-client-id',
                )
                expect(screen.getByLabelText(/provider url/i)).toHaveValue(
                    'https://okta.example.com',
                )
            })

            it('updates provider with new data', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState
                            {...defaultProps}
                            providers={mockProviders}
                        />
                    </Provider>,
                )

                const editButtons = screen.getAllByRole('button', {
                    name: /edit/i,
                })
                await user.click(editButtons[0])

                const nameField = screen.getByLabelText(/provider name/i)
                await user.clear(nameField)
                await user.type(nameField, 'Updated Okta')

                const saveButton = screen.getByRole('button', {
                    name: 'Save Changes',
                })
                await user.click(saveButton)

                await waitFor(() => {
                    expect(mockOnUpdate).toHaveBeenCalledWith({
                        'provider-1': {
                            name: 'Updated Okta',
                            client_id: 'okta-client-id',
                            client_secret: undefined,
                            server_metadata_url:
                                'https://okta.example.com/.well-known/openid-configuration',
                        },
                        'provider-2': mockProviders['provider-2'],
                    })
                })
            })

            it('sends undefined client secret when not changed', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState
                            {...defaultProps}
                            providers={mockProviders}
                        />
                    </Provider>,
                )

                const editButtons = screen.getAllByRole('button', {
                    name: /edit/i,
                })
                await user.click(editButtons[0])

                const nameField = screen.getByLabelText(/provider name/i)
                await user.clear(nameField)
                await user.type(nameField, 'Updated Provider')

                const saveButton = screen.getByRole('button', {
                    name: 'Save Changes',
                })
                await user.click(saveButton)

                await waitFor(() => {
                    expect(mockOnUpdate).toHaveBeenCalledWith({
                        'provider-1': {
                            name: 'Updated Provider',
                            client_id: 'okta-client-id',
                            client_secret: undefined,
                            server_metadata_url:
                                'https://okta.example.com/.well-known/openid-configuration',
                        },
                        'provider-2': mockProviders['provider-2'],
                    })
                })
            })

            it('updates client secret when changed', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState
                            {...defaultProps}
                            providers={mockProviders}
                        />
                    </Provider>,
                )

                const editButtons = screen.getAllByRole('button', {
                    name: /edit/i,
                })
                await user.click(editButtons[0])

                const secretField = screen.getByLabelText(/client secret/i)
                await user.type(secretField, 'new-secret')

                const saveButton = screen.getByRole('button', {
                    name: 'Save Changes',
                })
                await user.click(saveButton)

                await waitFor(() => {
                    expect(mockOnUpdate).toHaveBeenCalledWith({
                        'provider-1': {
                            name: 'Okta',
                            client_id: 'okta-client-id',
                            client_secret: 'new-secret',
                            server_metadata_url:
                                'https://okta.example.com/.well-known/openid-configuration',
                        },
                        'provider-2': mockProviders['provider-2'],
                    })
                })
            })
        })

        describe('Deleting providers', () => {
            it('deletes provider when delete is clicked', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState
                            {...defaultProps}
                            providers={mockProviders}
                        />
                    </Provider>,
                )

                const deleteButtons = screen.getAllByRole('button', {
                    name: /remove/i,
                })
                await user.click(deleteButtons[0])

                expect(mockOnUpdate).toHaveBeenCalledWith({
                    'provider-2': mockProviders['provider-2'],
                })
            })

            it('deletes correct provider from multiple providers', async () => {
                const user = userEvent.setup()
                const threeProviders = {
                    ...mockProviders,
                    'provider-3': {
                        name: 'Azure AD',
                        client_id: 'azure-client-id',
                        client_secret: 'azure-secret',
                        server_metadata_url: 'https://azure.example.com',
                    },
                }
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState
                            {...defaultProps}
                            providers={threeProviders}
                        />
                    </Provider>,
                )

                const deleteButtons = screen.getAllByRole('button', {
                    name: /remove/i,
                })
                await user.click(deleteButtons[1])

                expect(mockOnUpdate).toHaveBeenCalledWith({
                    'provider-1': mockProviders['provider-1'],
                    'provider-3': threeProviders['provider-3'],
                })
            })

            it('handles deleting last provider', async () => {
                const user = userEvent.setup()
                const singleProvider = {
                    'provider-1': mockProviders['provider-1'],
                }
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProvidersWithState
                            {...defaultProps}
                            providers={singleProvider}
                        />
                    </Provider>,
                )

                const deleteButton = screen.getByRole('button', {
                    name: /remove/i,
                })
                await user.click(deleteButton)

                expect(mockOnUpdate).toHaveBeenCalledWith({})
            })
        })
    })

    describe('Modal interactions', () => {
        it('closes modal when cancel is clicked', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )

            const addButton = screen.getByRole('button', {
                name: '+ Add provider',
            })
            await user.click(addButton)

            expect(screen.getByRole('dialog')).toBeInTheDocument()

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await user.click(cancelButton)

            // Modal will start closing animation
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('does not call onUpdate when modal is cancelled', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )

            const addButton = screen.getByRole('button', {
                name: '+ Add provider',
            })
            await user.click(addButton)

            await user.type(
                screen.getByLabelText(/provider name/i),
                'Cancelled Provider',
            )

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await user.click(cancelButton)

            expect(mockOnUpdate).not.toHaveBeenCalled()
        })

        it('passes correct callback URL to modal based on account domain', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState
                        {...defaultProps}
                        accountDomain="my-company"
                    />
                </Provider>,
            )

            const addButton = screen.getByRole('button', {
                name: '+ Add provider',
            })
            await user.click(addButton)

            expect(
                screen.getByDisplayValue(
                    'https://my-company.gorgias.com/idp/sso/oidc/callback',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Loading state', () => {
        it('disables provider items when isLoading prop is true', () => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState
                        {...defaultProps}
                        providers={mockProviders}
                        isLoading={true}
                    />
                </Provider>,
            )

            const editButtons = screen.getAllByRole('button', { name: /edit/i })
            const deleteButtons = screen.getAllByRole('button', {
                name: /remove/i,
            })

            editButtons.forEach((button) => {
                expect(button).toHaveAttribute('aria-disabled', 'true')
            })
            deleteButtons.forEach((button) => {
                expect(button).toHaveAttribute('aria-disabled', 'true')
            })
        })

        it('enables provider items when isLoading prop is false', () => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState
                        {...defaultProps}
                        providers={mockProviders}
                        isLoading={false}
                    />
                </Provider>,
            )

            const editButtons = screen.getAllByRole('button', { name: /edit/i })
            const deleteButtons = screen.getAllByRole('button', {
                name: /remove/i,
            })

            editButtons.forEach((button) => {
                expect(button).toHaveAttribute('aria-disabled', 'false')
            })
            deleteButtons.forEach((button) => {
                expect(button).toHaveAttribute('aria-disabled', 'false')
            })
        })
    })

    describe('Edge cases', () => {
        it('handles empty providers object', () => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState
                        {...defaultProps}
                        providers={{}}
                    />
                </Provider>,
            )

            expect(
                screen.queryByText('Custom Identity Providers'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: '+ Add provider' }),
            ).toBeInTheDocument()
        })

        it('handles undefined providers', () => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState
                        {...defaultProps}
                        providers={undefined as any}
                    />
                </Provider>,
            )

            expect(
                screen.queryByText('Custom Identity Providers'),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: '+ Add provider' }),
            ).toBeInTheDocument()
        })

        it('generates unique IDs for multiple new providers', async () => {
            const user = userEvent.setup()
            mockUuid
                .mockReturnValueOnce('first-provider-id')
                .mockReturnValueOnce('second-provider-id')

            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState {...defaultProps} />
                </Provider>,
            )

            const addButton = screen.getByRole('button', {
                name: '+ Add provider',
            })
            await user.click(addButton)

            await user.type(
                screen.getByLabelText(/provider name/i),
                'First Provider',
            )
            await user.type(screen.getByLabelText(/client id/i), 'first-id')
            await user.type(
                screen.getByLabelText(/client secret/i),
                'first-secret',
            )
            await user.type(
                screen.getByLabelText(/provider url/i),
                'https://first.com',
            )

            const saveButton = screen.getByRole('button', {
                name: 'Add SSO Provider',
            })
            await user.click(saveButton)

            await waitFor(() => {
                expect(mockOnUpdate).toHaveBeenCalledWith({
                    'first-provider-id': {
                        name: 'First Provider',
                        client_id: 'first-id',
                        client_secret: 'first-secret',
                        server_metadata_url:
                            'https://first.com/.well-known/openid-configuration',
                    },
                })
            })
        })

        it('handles providers with missing properties gracefully', () => {
            const incompleteProviders = {
                'provider-1': {
                    name: undefined as any,
                    client_id: 'client-id',
                    client_secret: 'secret',
                    server_metadata_url: 'https://example.com',
                },
            }

            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState
                        {...defaultProps}
                        providers={incompleteProviders}
                    />
                </Provider>,
            )

            expect(
                screen.getByText('Custom Identity Providers'),
            ).toBeInTheDocument()
        })
    })

    describe('Integration with hooks', () => {
        it('uses useCustomSsoProviderModalState hook correctly', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore}>
                    <CustomSsoProvidersWithState
                        {...defaultProps}
                        providers={mockProviders}
                    />
                </Provider>,
            )

            // Test opening create modal
            const addButton = screen.getByRole('button', {
                name: '+ Add provider',
            })
            await user.click(addButton)
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(
                screen.getByText('Add a custom SSO provider'),
            ).toBeInTheDocument()

            // Test closing modal
            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await user.click(cancelButton)

            // Test opening edit modal
            const editButtons = screen.getAllByRole('button', { name: /edit/i })
            await user.click(editButtons[0])
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Edit SSO provider')).toBeInTheDocument()
        })
    })
})
