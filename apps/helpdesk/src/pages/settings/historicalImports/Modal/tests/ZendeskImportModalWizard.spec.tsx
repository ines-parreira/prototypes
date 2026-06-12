import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockCreateIntegrationHandler,
    mockCreateIntegrationResponse,
} from '@gorgias/helpdesk-mocks'

import { ZendeskImportModalWizard } from '../ZendeskImportModalWizard'

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

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('ZendeskImportModalWizard', () => {
    const mockOnClose = jest.fn()

    const renderComponent = () => {
        return render(<ZendeskImportModalWizard onClose={mockOnClose} />)
    }

    const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
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
    }

    beforeEach(() => {
        jest.clearAllMocks()
        server.use(mockCreateIntegrationHandler().handler)
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
        const user = userEvent.setup()
        server.use(
            mockCreateIntegrationHandler(async () =>
                HttpResponse.json({ error: { msg: 'Failed' } } as any, {
                    status: 500,
                }),
            ).handler,
        )

        renderComponent()
        await fillValidForm(user)

        await user.click(screen.getByRole('button', { name: /import/i }))

        await waitFor(() => {
            expect(
                screen.getByText('There was an error during import creation.'),
            ).toBeInTheDocument()
        })
    })

    it('should hide error banner after successful submission', async () => {
        const user = userEvent.setup()
        let requestCount = 0
        server.use(
            mockCreateIntegrationHandler(async () => {
                requestCount += 1
                if (requestCount === 1) {
                    return HttpResponse.json(
                        { error: { msg: 'Failed' } } as any,
                        { status: 500 },
                    )
                }
                return HttpResponse.json(mockCreateIntegrationResponse())
            }).handler,
        )

        renderComponent()
        await fillValidForm(user)

        await user.click(screen.getByRole('button', { name: /import/i }))

        await waitFor(() => {
            expect(
                screen.getByText('There was an error during import creation.'),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /import/i }))

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('should call onClose when form submission succeeds', async () => {
        const user = userEvent.setup()
        server.use(
            mockCreateIntegrationHandler(async () =>
                HttpResponse.json(mockCreateIntegrationResponse()),
            ).handler,
        )

        renderComponent()
        await fillValidForm(user)

        await user.click(screen.getByRole('button', { name: /import/i }))

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledTimes(1)
        })
    })

    it('should show loading state on Import button when submitting', async () => {
        const user = userEvent.setup()
        server.use(
            mockCreateIntegrationHandler(
                async () => new Promise(() => undefined),
            ).handler,
        )

        renderComponent()
        await fillValidForm(user)

        const importButton = screen.getByRole('button', { name: /import/i })
        await user.click(importButton)

        await waitFor(() => {
            expect(importButton).toHaveAttribute('aria-disabled', 'true')
        })
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
        const createIntegrationMock = mockCreateIntegrationHandler()
        server.use(createIntegrationMock.handler)
        const waitForCreateIntegrationRequest =
            createIntegrationMock.waitForRequest(server)

        renderComponent()

        await fillValidForm(user)

        const importButton = screen.getByRole('button', { name: /import/i })

        await waitFor(() => {
            expect(importButton).not.toBeDisabled()
        })

        await user.click(importButton)

        await waitForCreateIntegrationRequest(async (request) => {
            const body = await request.json()
            expect(body).toEqual(
                expect.objectContaining({
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
            )
        })
    })

    it('should keep Import button disabled when isLoading is true even with valid form data', async () => {
        const user = userEvent.setup()
        server.use(
            mockCreateIntegrationHandler(
                async () => new Promise(() => undefined),
            ).handler,
        )

        renderComponent()

        await fillValidForm(user)

        const importButton = screen.getByRole('button', { name: /import/i })

        await waitFor(() => {
            expect(importButton).not.toBeDisabled()
        })

        await user.click(importButton)

        await waitFor(() => {
            expect(importButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    it('should remove error banner after successful submission following an error', async () => {
        const user = userEvent.setup()
        let requestCount = 0
        server.use(
            mockCreateIntegrationHandler(async () => {
                requestCount += 1
                if (requestCount === 1) {
                    return HttpResponse.json(
                        { error: { msg: 'Failed' } } as any,
                        { status: 500 },
                    )
                }
                return HttpResponse.json(mockCreateIntegrationResponse())
            }).handler,
        )

        renderComponent()
        await fillValidForm(user)

        await user.click(screen.getByRole('button', { name: /import/i }))

        await waitFor(() => {
            expect(
                screen.getByText('There was an error during import creation.'),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('button', { name: /import/i }))

        await waitFor(() => {
            expect(
                screen.queryByText(
                    'There was an error during import creation.',
                ),
            ).not.toBeInTheDocument()
        })
    })
})
