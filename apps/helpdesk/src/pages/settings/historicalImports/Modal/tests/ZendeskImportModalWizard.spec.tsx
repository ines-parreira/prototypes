import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useCreateIntegration } from '@gorgias/helpdesk-queries'

import { useNotify } from 'hooks/useNotify'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { ZendeskImportModalWizard } from '../ZendeskImportModalWizard'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useCreateIntegration: jest.fn(),
}))

jest.mock('hooks/useNotify', () => ({
    useNotify: jest.fn(),
}))

jest.mock('utils', () => ({
    subdomain: jest.fn((value: string) => {
        if (!value) return value
        const split = value.split('.')[0]
        return split.split('://').pop() || split
    }),
    isEmail: jest.fn((email: string) => {
        return /^[\w\.\-\+]+@[\w\.\-]+\.\w+$/i.test(email)
    }),
}))

describe('ZendeskImportModalWizard', () => {
    const mockOnClose = jest.fn()
    const mockCreateIntegration = jest.fn()
    const mockNotifySuccess = jest.fn()
    const mockNotifyError = jest.fn()

    const renderComponent = () => {
        const queryClient = mockQueryClient()
        return render(
            <QueryClientProvider client={queryClient}>
                <ZendeskImportModalWizard onClose={mockOnClose} />
            </QueryClientProvider>,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(useCreateIntegration as jest.Mock).mockReturnValue({
            mutate: mockCreateIntegration,
            isLoading: false,
        })
        ;(useNotify as jest.Mock).mockReturnValue({
            success: mockNotifySuccess,
            error: mockNotifyError,
        })
    })

    it('should render the modal with correct title', () => {
        renderComponent()

        expect(screen.getByText('Import Zendesk data')).toBeInTheDocument()
    })

    it('should render description text', () => {
        renderComponent()

        expect(
            screen.getByText(
                /import up to 2 years of customers, macros, and tags from zendesk/i,
            ),
        ).toBeInTheDocument()
    })

    it('should render all form fields', () => {
        renderComponent()

        expect(
            screen.getByRole('textbox', { name: /zendesk subdomain/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', { name: /login email/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('textbox', { name: /api key/i }),
        ).toBeInTheDocument()
    })

    it('should render Cancel and Import buttons', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /import/i }),
        ).toBeInTheDocument()
    })

    it('should call onClose when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const cancelButton = screen.getByRole('button', { name: /cancel/i })

        await act(() => user.click(cancelButton))

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should disable Import button when form is empty', () => {
        renderComponent()

        const importButton = screen.getByRole('button', { name: /import/i })

        expect(importButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should enable Import button when all fields are filled with valid data', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(
                screen.getByRole('textbox', { name: /zendesk subdomain/i }),
                'acme',
            )
            await user.type(
                screen.getByRole('textbox', { name: /login email/i }),
                'test@example.com',
            )
            await user.type(
                screen.getByRole('textbox', { name: /api key/i }),
                'test-api-key',
            )
        })

        const importButton = screen.getByRole('button', { name: /import/i })

        await waitFor(() => {
            expect(importButton).not.toBeDisabled()
        })
    })

    it('should not show error banner initially', () => {
        renderComponent()

        expect(
            screen.queryByText('There was an error during import creation.'),
        ).not.toBeInTheDocument()
    })

    it('should show error banner when form submission fails', async () => {
        let capturedOnError: (() => void) | undefined
        ;(useCreateIntegration as jest.Mock).mockImplementation(
            ({ mutation }) => {
                capturedOnError = mutation.onError
                return {
                    mutate: mockCreateIntegration,
                    isLoading: false,
                }
            },
        )

        renderComponent()

        act(() => {
            capturedOnError!()
        })

        await waitFor(() => {
            expect(
                screen.getByText('There was an error during import creation.'),
            ).toBeInTheDocument()
        })
    })

    it('should hide error banner after successful submission', async () => {
        let capturedOnError: (() => void) | undefined
        let capturedOnSuccess: (() => void) | undefined
        ;(useCreateIntegration as jest.Mock).mockImplementation(
            ({ mutation }) => {
                capturedOnError = mutation.onError
                capturedOnSuccess = mutation.onSuccess
                return {
                    mutate: mockCreateIntegration,
                    isLoading: false,
                }
            },
        )

        renderComponent()

        act(() => {
            capturedOnError!()
        })

        await waitFor(() => {
            expect(
                screen.getByText('There was an error during import creation.'),
            ).toBeInTheDocument()
        })

        act(() => {
            capturedOnSuccess!()
        })

        expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when form submission succeeds', async () => {
        let capturedOnSuccess: (() => void) | undefined
        ;(useCreateIntegration as jest.Mock).mockImplementation(
            ({ mutation }) => {
                capturedOnSuccess = mutation.onSuccess
                return {
                    mutate: mockCreateIntegration,
                    isLoading: false,
                }
            },
        )

        renderComponent()

        act(() => {
            capturedOnSuccess!()
        })

        expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should show loading state on Import button when submitting', () => {
        ;(useCreateIntegration as jest.Mock).mockReturnValue({
            mutate: mockCreateIntegration,
            isLoading: true,
        })

        renderComponent()

        const importButton = screen.getByRole('button', { name: /import/i })

        expect(importButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should display email validation error', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(
                screen.getByRole('textbox', { name: /login email/i }),
                'invalid-email',
            )
        })

        await waitFor(() => {
            expect(
                screen.getByText('Please enter a valid email address'),
            ).toBeInTheDocument()
        })
    })

    it('should clear email validation error when valid email is entered', async () => {
        const user = userEvent.setup()
        renderComponent()

        const emailInput = screen.getByRole('textbox', {
            name: /login email/i,
        })

        await act(async () => {
            await user.type(emailInput, 'invalid-email')
        })

        await waitFor(() => {
            expect(
                screen.getByText('Please enter a valid email address'),
            ).toBeInTheDocument()
        })

        await act(async () => {
            await user.clear(emailInput)
            await user.type(emailInput, 'valid@example.com')
        })

        await waitFor(() => {
            expect(
                screen.queryByText('Please enter a valid email address'),
            ).not.toBeInTheDocument()
        })
    })

    it('should keep Import button disabled when email is invalid', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(
                screen.getByRole('textbox', { name: /zendesk subdomain/i }),
                'acme',
            )
            await user.type(
                screen.getByRole('textbox', { name: /login email/i }),
                'invalid-email',
            )
            await user.type(
                screen.getByRole('textbox', { name: /api key/i }),
                'test-key',
            )
        })

        const importButton = screen.getByRole('button', { name: /import/i })

        await waitFor(() => {
            expect(importButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    it('should call createIntegration when Import button is clicked with valid form data', async () => {
        const user = userEvent.setup()
        renderComponent()

        await act(async () => {
            await user.type(
                screen.getByRole('textbox', { name: /zendesk subdomain/i }),
                'acme',
            )
            await user.type(
                screen.getByRole('textbox', { name: /login email/i }),
                'test@example.com',
            )
            await user.type(
                screen.getByRole('textbox', { name: /api key/i }),
                'test-api-key',
            )
        })

        const importButton = screen.getByRole('button', { name: /import/i })

        await waitFor(() => {
            expect(importButton).not.toBeDisabled()
        })

        await act(() => user.click(importButton))

        expect(mockCreateIntegration).toHaveBeenCalledTimes(1)
        expect(mockCreateIntegration).toHaveBeenCalledWith({
            data: expect.objectContaining({
                name: 'acme',
                type: 'zendesk',
                connections: [
                    {
                        type: 'zendesk_auth_data',
                        data: {
                            domain: 'acme',
                            email: 'test@example.com',
                            api_key: 'test-api-key',
                        },
                    },
                ],
            }),
        })
    })

    it('should keep Import button disabled when isLoading is true even with valid form data', async () => {
        const user = userEvent.setup()
        ;(useCreateIntegration as jest.Mock).mockReturnValue({
            mutate: mockCreateIntegration,
            isLoading: false,
        })

        const queryClient = mockQueryClient()
        const { rerender } = render(
            <QueryClientProvider client={queryClient}>
                <ZendeskImportModalWizard onClose={mockOnClose} />
            </QueryClientProvider>,
        )

        await act(async () => {
            await user.type(
                screen.getByRole('textbox', { name: /zendesk subdomain/i }),
                'acme',
            )
            await user.type(
                screen.getByRole('textbox', { name: /login email/i }),
                'test@example.com',
            )
            await user.type(
                screen.getByRole('textbox', { name: /api key/i }),
                'test-api-key',
            )
        })

        const importButton = screen.getByRole('button', { name: /import/i })

        await waitFor(() => {
            expect(importButton).not.toBeDisabled()
        })
        ;(useCreateIntegration as jest.Mock).mockReturnValue({
            mutate: mockCreateIntegration,
            isLoading: true,
        })

        rerender(
            <QueryClientProvider client={queryClient}>
                <ZendeskImportModalWizard onClose={mockOnClose} />
            </QueryClientProvider>,
        )

        expect(importButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('should remove error banner after successful submission following an error', async () => {
        let capturedOnError: (() => void) | undefined
        let capturedOnSuccess: (() => void) | undefined
        ;(useCreateIntegration as jest.Mock).mockImplementation(
            ({ mutation }) => {
                capturedOnError = mutation.onError
                capturedOnSuccess = mutation.onSuccess
                return {
                    mutate: mockCreateIntegration,
                    isLoading: false,
                }
            },
        )

        renderComponent()

        act(() => {
            capturedOnError!()
        })

        await waitFor(() => {
            expect(
                screen.getByText('There was an error during import creation.'),
            ).toBeInTheDocument()
        })

        act(() => {
            capturedOnSuccess!()
        })

        await waitFor(() => {
            expect(
                screen.queryByText(
                    'There was an error during import creation.',
                ),
            ).not.toBeInTheDocument()
        })
    })
})
