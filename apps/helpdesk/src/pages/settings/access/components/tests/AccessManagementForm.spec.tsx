import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { AccessManagementForm } from '../AccessManagementForm'

describe('AccessManagementForm', () => {
    const mockSetName = jest.fn()
    const mockSetClientId = jest.fn()
    const mockSetMetadataUrl = jest.fn()
    const mockHandleClientSecretChange = jest.fn()
    const mockOnValidationChange = jest.fn()

    // Create a minimal mock store for Redux Provider
    const mockStore = configureStore({
        reducer: {
            // Add minimal reducers if needed
        },
    })

    const defaultProps = {
        callbackUrl: 'https://test-domain.gorgias.com/idp/sso/oidc/callback',
        clientId: 'test-client-id',
        clientSecret: 'test-secret',
        handleClientSecretChange: mockHandleClientSecretChange,
        metadataUrl: 'https://test.okta.com',
        mode: 'create' as const,
        providerName: 'Test Provider',
        setClientId: mockSetClientId,
        setMetadataUrl: mockSetMetadataUrl,
        setName: mockSetName,
        onValidationChange: mockOnValidationChange,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Setup Instructions', () => {
        beforeEach(() => {
            render(
                <Provider store={mockStore}>
                    <AccessManagementForm {...defaultProps} />
                </Provider>,
            )
        })

        it('renders setup instructions section correctly', () => {
            // Title
            expect(screen.getByText('Setup instructions')).toBeInTheDocument()

            // All instruction steps
            const instructions = [
                /Create an OAuth application of type/,
                /Configure the URL shown below as allowed redirect/,
                /Take note of the app/,
            ]
            instructions.forEach((instruction) => {
                expect(screen.getByText(instruction)).toBeInTheDocument()
            })

            // Callback URL section
            expect(screen.getByText('Callback URL')).toBeInTheDocument()
            const callbackInput = screen.getByDisplayValue(
                'https://test-domain.gorgias.com/idp/sso/oidc/callback',
            )
            expect(callbackInput).toBeInTheDocument()
            expect(callbackInput).toBeDisabled()

            // Copy button
            expect(
                screen.getByRole('button', { name: /copy/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Form Fields', () => {
        describe('All fields in create mode', () => {
            beforeEach(() => {
                render(
                    <Provider store={mockStore}>
                        <AccessManagementForm {...defaultProps} mode="create" />
                    </Provider>,
                )
            })

            it('renders all form fields with correct attributes and values', () => {
                // Provider Name field
                const providerNameField =
                    screen.getByLabelText(/provider name/i)
                expect(providerNameField).toBeInTheDocument()
                expect(providerNameField).toHaveValue('Test Provider')
                expect(providerNameField).toHaveAttribute('id', 'providerName')

                // Client ID field
                const clientIdField = screen.getByLabelText(/client id/i)
                expect(clientIdField).toBeInTheDocument()
                expect(clientIdField).toHaveValue('test-client-id')
                expect(clientIdField).toHaveAttribute('id', 'clientId')

                // Client Secret field
                const clientSecretField =
                    screen.getByLabelText(/client secret/i)
                expect(clientSecretField).toBeInTheDocument()
                expect(clientSecretField).toHaveAttribute('type', 'password')
                expect(clientSecretField).toHaveValue('test-secret')
                expect(clientSecretField).toHaveAttribute('id', 'clientSecret')

                // Provider URL field
                const providerUrlField = screen.getByLabelText(/provider url/i)
                expect(providerUrlField).toBeInTheDocument()
                expect(providerUrlField).toHaveAttribute('type', 'url')
                expect(providerUrlField).toHaveValue('https://test.okta.com')
                expect(providerUrlField).toHaveAttribute('id', 'metadataUrl')

                // Required field indicators (4 asterisks in create mode)
                const asterisks = screen.getAllByText('*')
                expect(asterisks).toHaveLength(4)

                // Provider URL caption
                expect(
                    screen.getByText(
                        /Where the provider.*OpenID Connect configuration/,
                    ),
                ).toBeInTheDocument()
            })
        })

        describe('Empty fields with placeholders', () => {
            beforeEach(() => {
                render(
                    <Provider store={mockStore}>
                        <AccessManagementForm
                            {...defaultProps}
                            clientId=""
                            clientSecret=""
                            metadataUrl=""
                            mode="create"
                        />
                    </Provider>,
                )
            })

            it('shows correct placeholders for empty fields', () => {
                expect(
                    screen.getByPlaceholderText('Application client ID'),
                ).toBeInTheDocument()
                expect(
                    screen.getByPlaceholderText('Application client secret'),
                ).toBeInTheDocument()
                expect(
                    screen.getByPlaceholderText(
                        'e.g. your-domain.okta.com, your-domain.onelogin.com/oidc/2',
                    ),
                ).toBeInTheDocument()
            })
        })

        describe('Edit mode differences', () => {
            beforeEach(() => {
                render(
                    <Provider store={mockStore}>
                        <AccessManagementForm
                            {...defaultProps}
                            mode="edit"
                            clientSecret=""
                        />
                    </Provider>,
                )
            })

            it('shows correct behavior in edit mode', () => {
                // Only 3 required fields in edit mode (client secret is optional)
                const asterisks = screen.getAllByText('*')
                expect(asterisks).toHaveLength(3)

                // Client secret field shows different placeholder
                const clientSecretField =
                    screen.getByLabelText(/client secret/i)
                expect(clientSecretField).not.toBeRequired()
                expect(
                    screen.getByPlaceholderText('••••••••'),
                ).toBeInTheDocument()
            })
        })

        describe('Field interactions', () => {
            it('handles user input for all fields', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <AccessManagementForm
                            {...defaultProps}
                            providerName=""
                            clientId=""
                            clientSecret=""
                            metadataUrl=""
                        />
                    </Provider>,
                )

                const providerNameField =
                    screen.getByLabelText(/provider name/i)
                const clientIdField = screen.getByLabelText(/client id/i)
                const clientSecretField =
                    screen.getByLabelText(/client secret/i)
                const metadataUrlField = screen.getByLabelText(/provider url/i)

                await user.type(providerNameField, 'Test')
                await user.type(clientIdField, 'client123')
                await user.type(clientSecretField, 'secret456')
                await user.type(metadataUrlField, 'https://test.com')

                expect(mockSetName).toHaveBeenCalled()
                expect(mockSetClientId).toHaveBeenCalled()
                expect(mockHandleClientSecretChange).toHaveBeenCalled()
                expect(mockSetMetadataUrl).toHaveBeenCalled()
            })

            it('callback URL remains disabled', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <AccessManagementForm {...defaultProps} />
                    </Provider>,
                )

                const callbackInput = screen.getByDisplayValue(
                    'https://test-domain.gorgias.com/idp/sso/oidc/callback',
                )

                expect(callbackInput).toBeDisabled()
                await user.click(callbackInput)
                expect(callbackInput).toHaveValue(
                    'https://test-domain.gorgias.com/idp/sso/oidc/callback',
                )
            })
        })
    })

    describe('Validation', () => {
        describe('Required field validation', () => {
            it('shows validation errors for all required fields', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <AccessManagementForm
                            {...defaultProps}
                            providerName=""
                            clientId=""
                            clientSecret=""
                            metadataUrl=""
                            mode="create"
                        />
                    </Provider>,
                )

                const providerNameField =
                    screen.getByLabelText(/provider name/i)
                const clientIdField = screen.getByLabelText(/client id/i)
                const clientSecretField =
                    screen.getByLabelText(/client secret/i)
                const metadataUrlField = screen.getByLabelText(/provider url/i)

                // Touch all fields
                await user.click(providerNameField)
                await user.tab()
                await user.click(clientIdField)
                await user.tab()
                await user.click(clientSecretField)
                await user.tab()
                await user.click(metadataUrlField)
                await user.tab()

                // Check all validation errors appear
                expect(
                    await screen.findByText('Provider name is required'),
                ).toBeInTheDocument()
                expect(
                    await screen.findByText('Client ID is required'),
                ).toBeInTheDocument()
                expect(
                    await screen.findByText('Client secret is required'),
                ).toBeInTheDocument()
                expect(
                    await screen.findByText('Provider URL is required'),
                ).toBeInTheDocument()
            })
        })

        describe('Edit mode validation', () => {
            it('does not require client secret in edit mode', async () => {
                const user = userEvent.setup()
                render(
                    <Provider store={mockStore}>
                        <AccessManagementForm
                            {...defaultProps}
                            mode="edit"
                            clientSecret=""
                        />
                    </Provider>,
                )

                const field = screen.getByLabelText(/client secret/i)
                await user.click(field)
                await user.tab()

                const error = screen.queryByText('Client secret is required')
                expect(error).not.toBeInTheDocument()
            })
        })

        describe('Validation callback', () => {
            it('calls onValidationChange based on form validity', async () => {
                const { rerender } = render(
                    <Provider store={mockStore}>
                        <AccessManagementForm
                            {...defaultProps}
                            providerName=""
                            onValidationChange={mockOnValidationChange}
                        />
                    </Provider>,
                )

                // Initially invalid
                expect(mockOnValidationChange).toHaveBeenCalledWith(false)

                // Make it valid
                rerender(
                    <Provider store={mockStore}>
                        <AccessManagementForm
                            {...defaultProps}
                            providerName="Valid Name"
                            onValidationChange={mockOnValidationChange}
                        />
                    </Provider>,
                )

                expect(mockOnValidationChange).toHaveBeenCalledWith(true)
            })
        })
    })

    describe('Accessibility', () => {
        beforeEach(() => {
            render(
                <Provider store={mockStore}>
                    <AccessManagementForm {...defaultProps} mode="create" />
                </Provider>,
            )
        })

        it('has proper accessible form structure', () => {
            const form = document.querySelector('form')
            expect(form).toBeInTheDocument()
            expect(form?.tagName).toBe('FORM')

            // All fields have proper labels and IDs
            expect(screen.getByLabelText(/provider name/i)).toHaveAttribute(
                'id',
                'providerName',
            )
            expect(screen.getByLabelText(/client id/i)).toHaveAttribute(
                'id',
                'clientId',
            )
            expect(screen.getByLabelText(/client secret/i)).toHaveAttribute(
                'id',
                'clientSecret',
            )
            expect(screen.getByLabelText(/provider url/i)).toHaveAttribute(
                'id',
                'metadataUrl',
            )
        })
    })

    describe('Different callback URLs', () => {
        it('handles various callback URL formats', () => {
            const { rerender } = render(
                <Provider store={mockStore}>
                    <AccessManagementForm
                        {...defaultProps}
                        callbackUrl="https://my-company.gorgias.com/idp/sso/oidc/callback"
                    />
                </Provider>,
            )

            expect(
                screen.getByDisplayValue(
                    'https://my-company.gorgias.com/idp/sso/oidc/callback',
                ),
            ).toBeInTheDocument()

            const customCallback = 'https://custom.domain.com/auth/sso/callback'
            rerender(
                <Provider store={mockStore}>
                    <AccessManagementForm
                        {...defaultProps}
                        callbackUrl={customCallback}
                    />
                </Provider>,
            )

            expect(screen.getByDisplayValue(customCallback)).toBeInTheDocument()
        })
    })
})
