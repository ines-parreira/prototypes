import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { IntegrationType } from '@gorgias/helpdesk-types'

import type { EmailOption } from '../EmailMultiselect'
import { EmailSelectSearch } from '../EmailSelectSearch'

const mockEmailOptions: EmailOption[] = [
    { provider: IntegrationType.Gmail, email: 'support@gmail.com' },
    { provider: IntegrationType.Outlook, email: 'sales@outlook.com' },
    { provider: IntegrationType.Gmail, email: 'info@gmail.com' },
    { provider: IntegrationType.Email, email: 'hello@company.com' },
    { provider: IntegrationType.Outlook, email: 'contact@outlook.com' },
]

const renderEmailSelectSearch = (
    email = '',
    emailOptions = mockEmailOptions,
) => {
    const setEmail = jest.fn()

    const utils = render(
        <MemoryRouter>
            <EmailSelectSearch
                emailOptions={emailOptions}
                email={email}
                setEmail={setEmail}
            />
        </MemoryRouter>,
    )

    return { ...utils, setEmail }
}

const clickWithAct = async (
    user: ReturnType<typeof userEvent.setup>,
    element: HTMLElement,
) => {
    await act(async () => {
        await user.click(element)
    })
}

describe('EmailSelectSearch', () => {
    let consoleErrorSpy: jest.SpyInstance

    beforeEach(() => {
        jest.clearAllMocks()
        consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation((message) => {
                if (
                    typeof message === 'string' &&
                    message.includes('Warning: An update to')
                ) {
                    return
                }
                console.warn(message)
            })
    })

    afterEach(() => {
        consoleErrorSpy.mockRestore()
    })

    describe('Initial Rendering', () => {
        it('renders with placeholder text when no email is selected', () => {
            renderEmailSelectSearch()

            expect(
                screen.getByText('support@yourcompany.com'),
            ).toBeInTheDocument()
        })

        it('displays selected email when provided', () => {
            renderEmailSelectSearch('test@example.com')

            expect(screen.getByText('test@example.com')).toBeInTheDocument()
        })

        it('renders dropdown as closed initially', () => {
            renderEmailSelectSearch()

            expect(
                screen.queryByText('support@gmail.com'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('sales@outlook.com'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Dropdown Interaction', () => {
        it('opens dropdown when clicked', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch()

            const input = screen.getByRole('combobox')

            await act(async () => {
                await user.click(input)
            })

            await waitFor(() => {
                expect(
                    screen.getByText('support@gmail.com'),
                ).toBeInTheDocument()
            })
        })

        it('displays all email options when opened', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch()

            const input = screen.getByRole('combobox')

            await act(async () => {
                await user.click(input)
            })

            await waitFor(() => {
                expect(
                    screen.getByText('support@gmail.com'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('sales@outlook.com'),
                ).toBeInTheDocument()
                expect(screen.getByText('info@gmail.com')).toBeInTheDocument()
                expect(
                    screen.getByText('hello@company.com'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('contact@outlook.com'),
                ).toBeInTheDocument()
            })
        })

        it('includes search functionality when dropdown is open', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch()

            const input = screen.getByRole('combobox')
            await clickWithAct(user, input)

            await waitFor(() => {
                expect(
                    screen.getByPlaceholderText('Search'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Provider Icons', () => {
        it('displays Gmail icon for Gmail providers', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch()

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                const gmailImages = screen.getAllByAltText('gmail')
                expect(gmailImages).toHaveLength(2)
            })
        })

        it('displays Outlook icon for Outlook providers', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch()

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                const outlookImages = screen.getAllByAltText('outlook')
                expect(outlookImages).toHaveLength(2)
            })
        })

        it('displays forwarding icon for email forwarding providers', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch()

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                expect(screen.getByText('forward_to_inbox')).toBeInTheDocument()
            })
        })

        it('displays default email icon for unknown providers', async () => {
            const user = userEvent.setup()
            const customEmailOptions: EmailOption[] = [
                { provider: 'unknown' as any, email: 'test@unknown.com' },
            ]
            renderEmailSelectSearch('', customEmailOptions)

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                expect(screen.getByText('email')).toBeInTheDocument()
            })
        })
    })

    describe('Email Selection', () => {
        it('calls setEmail when an option is clicked', async () => {
            const user = userEvent.setup()
            const { setEmail } = renderEmailSelectSearch()

            const input = screen.getByRole('combobox')

            await act(async () => {
                await user.click(input)
            })

            await waitFor(() => {
                expect(
                    screen.getByText('support@gmail.com'),
                ).toBeInTheDocument()
            })

            const emailOption = screen.getByText('support@gmail.com')

            await act(async () => {
                await user.click(emailOption)
            })

            expect(setEmail).toHaveBeenCalledWith('support@gmail.com')
        })

        it('calls setEmail with correct email for different providers', async () => {
            const user = userEvent.setup()
            const { setEmail } = renderEmailSelectSearch()

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                expect(
                    screen.getByText('sales@outlook.com'),
                ).toBeInTheDocument()
            })

            const outlookOption = screen.getByText('sales@outlook.com')
            await user.click(outlookOption)

            expect(setEmail).toHaveBeenCalledWith('sales@outlook.com')
        })

        it('closes dropdown after selection', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch()

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                expect(
                    screen.getByText('support@gmail.com'),
                ).toBeInTheDocument()
            })

            const emailOption = screen.getByText('support@gmail.com')
            await user.click(emailOption)

            await waitFor(() => {
                expect(
                    screen.queryByText('sales@outlook.com'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Add New Email Link', () => {
        it('displays "Add new email" link in dropdown', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch()

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                expect(screen.getByText('Add new email')).toBeInTheDocument()
            })
        })

        it('renders link with correct to attribute', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch()

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                const addNewEmailLink = screen
                    .getByText('Add new email')
                    .closest('a')
                expect(addNewEmailLink).toHaveAttribute(
                    'href',
                    '/app/settings/channels/email',
                )
            })
        })

        it('displays add icon with the link', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch()

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                expect(screen.getByText('add')).toBeInTheDocument()
            })
        })
    })

    describe('Edge Cases', () => {
        it('handles empty email options array', async () => {
            const user = userEvent.setup()
            renderEmailSelectSearch('', [])

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                expect(
                    screen.getByPlaceholderText('Search'),
                ).toBeInTheDocument()
                expect(screen.getByText('Add new email')).toBeInTheDocument()
            })
        })

        it('handles selecting the same email that is already selected', async () => {
            const user = userEvent.setup()
            const { setEmail } = renderEmailSelectSearch('support@gmail.com')

            const input = screen.getByRole('combobox')

            await act(async () => {
                await user.click(input)
            })

            await waitFor(() => {
                expect(screen.getAllByText('support@gmail.com')).toHaveLength(2)
            })

            const dropdownOption = screen.getByRole('option', {
                name: /support@gmail.com/i,
            })

            await act(async () => {
                await user.click(dropdownOption)
            })

            expect(setEmail).toHaveBeenCalledWith('support@gmail.com')
        })

        it('renders correctly with single email option', async () => {
            const user = userEvent.setup()
            const singleEmailOption: EmailOption[] = [
                { provider: 'gmail', email: 'single@gmail.com' },
            ]
            renderEmailSelectSearch('', singleEmailOption)

            const input = screen.getByRole('combobox')
            await user.click(input)

            await waitFor(() => {
                expect(screen.getByText('single@gmail.com')).toBeInTheDocument()
                expect(screen.getByAltText('gmail')).toBeInTheDocument()
            })
        })
    })
})
