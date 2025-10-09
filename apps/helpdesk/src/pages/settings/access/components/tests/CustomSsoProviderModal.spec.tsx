import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import type { CustomSSOProviderData } from '../../types'
import CustomSsoProviderModal from '../CustomSsoProviderModal'

describe('CustomSsoProviderModal', () => {
    const mockOnClose = jest.fn()
    const mockOnSave = jest.fn()

    // Create a minimal mock store for Redux Provider
    const mockStore = configureStore({
        reducer: {
            // Add minimal reducers if needed
        },
    })

    const defaultProps = {
        accountDomain: 'test-company',
        isOpen: true,
        mode: 'create' as const,
        onClose: mockOnClose,
        onSave: mockOnSave,
        isLoading: false,
    }

    const mockInitialData: CustomSSOProviderData = {
        name: 'Existing Provider',
        clientId: 'existing-client-id',
        clientSecret: 'existing-secret',
        metadataUrl: 'https://existing.provider.com',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Modal rendering', () => {
        it('renders when isOpen is true', () => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal {...defaultProps} />
                </Provider>,
            )
            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })

        it('does not render when isOpen is false', () => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal {...defaultProps} isOpen={false} />
                </Provider>,
            )
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    describe('Create mode', () => {
        beforeEach(() => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal {...defaultProps} mode="create" />
                </Provider>,
            )
        })

        it('displays correct content for create mode', () => {
            // Title and subtitle
            expect(
                screen.getByText('Add a custom SSO provider'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Configure your identity provider via OpenID Connect (OIDC)',
                ),
            ).toBeInTheDocument()

            // Button text
            expect(
                screen.getByRole('button', { name: 'Add SSO Provider' }),
            ).toBeInTheDocument()

            // Empty form fields
            const providerNameField = screen.getByLabelText(/provider name/i)
            const clientIdField = screen.getByLabelText(/client id/i)
            const clientSecretField = screen.getByLabelText(/client secret/i)
            const metadataUrlField = screen.getByLabelText(/provider url/i)

            expect(providerNameField).toHaveValue('')
            expect(clientIdField).toHaveValue('')
            expect(clientSecretField).toHaveValue('')
            expect(metadataUrlField).toHaveValue('')
        })
    })

    describe('Edit mode', () => {
        const editProps = {
            ...defaultProps,
            mode: 'edit' as const,
            editingProviderId: 'provider-123',
            initialData: mockInitialData,
        }

        beforeEach(() => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal {...editProps} />
                </Provider>,
            )
        })

        it('displays correct content for edit mode', () => {
            // Title
            expect(screen.getByText('Edit SSO provider')).toBeInTheDocument()

            // Button text
            expect(
                screen.getByRole('button', { name: 'Save Changes' }),
            ).toBeInTheDocument()

            // Pre-filled form fields (except client secret)
            const providerNameField = screen.getByLabelText(/provider name/i)
            const clientIdField = screen.getByLabelText(/client id/i)
            const clientSecretField = screen.getByLabelText(/client secret/i)
            const metadataUrlField = screen.getByLabelText(/provider url/i)

            expect(providerNameField).toHaveValue('Existing Provider')
            expect(clientIdField).toHaveValue('existing-client-id')
            expect(clientSecretField).toHaveValue('')
            expect(metadataUrlField).toHaveValue(
                'https://existing.provider.com',
            )
        })
    })

    describe('Callback URL generation', () => {
        it('generates correct callback URLs for different domains', () => {
            const { rerender } = render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal
                        {...defaultProps}
                        accountDomain="my-company"
                    />
                </Provider>,
            )

            expect(
                screen.getByDisplayValue(
                    'https://my-company.gorgias.com/idp/sso/oidc/callback',
                ),
            ).toBeInTheDocument()

            rerender(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal
                        {...defaultProps}
                        accountDomain="test-123"
                    />
                </Provider>,
            )

            expect(
                screen.getByDisplayValue(
                    'https://test-123.gorgias.com/idp/sso/oidc/callback',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Modal actions', () => {
        describe('Cancel button', () => {
            it('handles cancel action and form reset', async () => {
                const user = userEvent.setup()
                const { rerender } = render(
                    <Provider store={mockStore}>
                        <CustomSsoProviderModal {...defaultProps} />
                    </Provider>,
                )

                // Verify cancel button exists
                const cancelButton = screen.getByRole('button', {
                    name: 'Cancel',
                })
                expect(cancelButton).toBeInTheDocument()

                // Type in a field
                const providerNameField =
                    screen.getByLabelText(/provider name/i)
                await user.type(providerNameField, 'Test Provider')

                // Click cancel
                await user.click(cancelButton)
                expect(mockOnClose).toHaveBeenCalledTimes(1)

                // Re-open modal to check reset
                rerender(
                    <Provider store={mockStore}>
                        <CustomSsoProviderModal
                            {...defaultProps}
                            isOpen={false}
                        />
                    </Provider>,
                )
                rerender(
                    <Provider store={mockStore}>
                        <CustomSsoProviderModal
                            {...defaultProps}
                            isOpen={true}
                        />
                    </Provider>,
                )

                const newProviderNameField =
                    screen.getByLabelText(/provider name/i)
                expect(newProviderNameField).toHaveValue('')
            })
        })

        describe('Save button - Create mode', () => {
            it('handles save button states and submission in create mode', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProviderModal
                            {...defaultProps}
                            mode="create"
                        />
                    </Provider>,
                )

                const saveButton = screen.getByRole('button', {
                    name: 'Add SSO Provider',
                })

                // Initially disabled
                expect(saveButton).toHaveAttribute('aria-disabled', 'true')

                // Fill in all required fields
                await user.type(
                    screen.getByLabelText(/provider name/i),
                    'Test Provider',
                )
                await user.type(
                    screen.getByLabelText(/client id/i),
                    'test-client-id',
                )
                await user.type(
                    screen.getByLabelText(/client secret/i),
                    'test-secret',
                )
                await user.type(
                    screen.getByLabelText(/provider url/i),
                    'https://test.provider.com',
                )

                // Now enabled
                expect(saveButton).toBeEnabled()

                // Submit form
                await user.click(saveButton)

                expect(mockOnSave).toHaveBeenCalledWith(
                    {
                        name: 'Test Provider',
                        clientId: 'test-client-id',
                        clientSecret: 'test-secret',
                        metadataUrl:
                            'https://test.provider.com/.well-known/openid-configuration',
                    },
                    undefined,
                )
            })
        })

        describe('Save button - Edit mode', () => {
            it('handles save button and submission in edit mode', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <CustomSsoProviderModal
                            {...defaultProps}
                            mode="edit"
                            editingProviderId="provider-123"
                            initialData={mockInitialData}
                        />
                    </Provider>,
                )

                const saveButton = screen.getByRole('button', {
                    name: 'Save Changes',
                })

                // Update a field
                const nameField = screen.getByLabelText(/provider name/i)
                await user.clear(nameField)
                await user.type(nameField, 'Updated Provider')

                await user.click(saveButton)

                expect(mockOnSave).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'Updated Provider',
                        clientId: 'existing-client-id',
                        metadataUrl:
                            'https://existing.provider.com/.well-known/openid-configuration',
                    }),
                    'provider-123',
                )
            })
        })
    })

    describe('Form validation', () => {
        it('shows all validation errors for required fields', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal {...defaultProps} mode="create" />
                </Provider>,
            )

            // Touch all fields
            const providerNameField = screen.getByLabelText(/provider name/i)
            const clientIdField = screen.getByLabelText(/client id/i)
            const clientSecretField = screen.getByLabelText(/client secret/i)
            const metadataUrlField = screen.getByLabelText(/provider url/i)

            await user.click(providerNameField)
            await user.tab()
            await user.click(clientIdField)
            await user.tab()
            await user.click(clientSecretField)
            await user.tab()
            await user.click(metadataUrlField)
            await user.tab()

            // Check all validation errors
            expect(
                screen.getByText('Provider name is required'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Client ID is required'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Client secret is required'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Provider URL is required'),
            ).toBeInTheDocument()
        })

        it('validates URL format', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal {...defaultProps} mode="create" />
                </Provider>,
            )

            const metadataUrlField = screen.getByLabelText(/provider url/i)
            await user.type(metadataUrlField, 'not a valid url with spaces')
            await user.tab()

            expect(
                screen.getByText('Please enter a valid URL or domain'),
            ).toBeInTheDocument()
        })
    })

    describe('Edit mode specific behavior', () => {
        it('does not require client secret in edit mode', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal
                        {...defaultProps}
                        mode="edit"
                        editingProviderId="provider-123"
                        initialData={mockInitialData}
                    />
                </Provider>,
            )

            // Empty client secret doesn't show error
            const clientSecretField = screen.getByLabelText(/client secret/i)
            await user.click(clientSecretField)
            await user.tab()

            expect(
                screen.queryByText('Client secret is required'),
            ).not.toBeInTheDocument()

            // Save button is still enabled
            const saveButton = screen.getByRole('button', {
                name: 'Save Changes',
            })
            expect(saveButton).toBeEnabled()
        })

        it('sends undefined client secret when not changed in edit mode', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal
                        {...defaultProps}
                        mode="edit"
                        editingProviderId="provider-123"
                        initialData={mockInitialData}
                    />
                </Provider>,
            )

            // Save without changing client secret
            const saveButton = screen.getByRole('button', {
                name: 'Save Changes',
            })
            await user.click(saveButton)

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    clientSecret: undefined,
                }),
                'provider-123',
            )
        })

        it('sends new client secret when changed in edit mode', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal
                        {...defaultProps}
                        mode="edit"
                        editingProviderId="provider-123"
                        initialData={mockInitialData}
                    />
                </Provider>,
            )

            // Update client secret
            const clientSecretField = screen.getByLabelText(/client secret/i)
            await user.type(clientSecretField, 'new-secret')

            const saveButton = screen.getByRole('button', {
                name: 'Save Changes',
            })
            await user.click(saveButton)

            expect(mockOnSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    clientSecret: 'new-secret',
                }),
                'provider-123',
            )
        })
    })

    describe('Form integration', () => {
        beforeEach(() => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal
                        {...defaultProps}
                        accountDomain="test-domain"
                    />
                </Provider>,
            )
        })

        it('renders AccessManagementForm with all elements', () => {
            // Form elements
            expect(screen.getByText('Setup instructions')).toBeInTheDocument()
            expect(screen.getByLabelText(/provider name/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/client id/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/client secret/i)).toBeInTheDocument()
            expect(screen.getByLabelText(/provider url/i)).toBeInTheDocument()

            // Callback URL
            expect(
                screen.getByDisplayValue(
                    'https://test-domain.gorgias.com/idp/sso/oidc/callback',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('Accessibility', () => {
        beforeEach(() => {
            render(
                <Provider store={mockStore}>
                    <CustomSsoProviderModal {...defaultProps} mode="create" />
                </Provider>,
            )
        })

        it('has proper accessible structure', () => {
            // Modal dialog
            expect(screen.getByRole('dialog')).toBeInTheDocument()

            // Modal title
            expect(
                screen.getByText('Add a custom SSO provider'),
            ).toBeInTheDocument()

            // Accessible buttons
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Add SSO Provider' }),
            ).toBeInTheDocument()
        })
    })
})
