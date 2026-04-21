import { render } from '@repo/testing/vitest'
import { screen, waitFor, within } from '@testing-library/react'

import { INITIAL_ACTION } from '../../utils/customActionConstants'
import type { ButtonConfig } from '../../utils/customActionTypes'
import { ButtonActionDialog } from '../ButtonActionDialog'

describe('ButtonActionDialog', () => {
    function getParameterSection(container: HTMLElement, label: string) {
        const sectionTitle = within(container).getByText(label)
        let section = sectionTitle.parentElement

        while (
            section &&
            !within(section).queryByRole('button', { name: /add parameter/i })
        ) {
            section = section.parentElement
        }

        if (!section) {
            throw new Error(`Unable to find parameter section for "${label}"`)
        }

        return section
    }

    const defaultProps = {
        isOpen: true,
        onOpenChange: vi.fn(),
        onSubmit: vi.fn().mockResolvedValue(undefined),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders with "Configure HTTP action" title when no editButton', () => {
        render(<ButtonActionDialog {...defaultProps} />)
        expect(
            screen.getByRole('dialog', { name: /configure http action/i }),
        ).toBeInTheDocument()
    })

    it('renders with "Edit HTTP action" title when editButton is provided', () => {
        render(
            <ButtonActionDialog
                {...defaultProps}
                editButton={{
                    label: 'Test',
                    action: {
                        method: 'GET',
                        url: 'https://example.com',
                        headers: [],
                        params: [],
                        body: {
                            contentType: 'application/json',
                            'application/json': {},
                            'application/x-www-form-urlencoded': [],
                        },
                    },
                }}
            />,
        )
        expect(
            screen.getByRole('dialog', { name: /edit http action/i }),
        ).toBeInTheDocument()
    })

    it('disables Save button when label is empty', () => {
        render(<ButtonActionDialog {...defaultProps} />)
        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })

    it('enables Save button when label and URL are filled', async () => {
        const { user } = render(<ButtonActionDialog {...defaultProps} />)

        await user.type(screen.getByLabelText(/button title/i), 'My Action')
        await user.type(screen.getByLabelText(/url/i), 'https://example.com')

        expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
    })

    it('calls onSubmit when Save is clicked with valid data', async () => {
        const { user } = render(<ButtonActionDialog {...defaultProps} />)

        await user.type(screen.getByLabelText(/button title/i), 'My Action')
        await user.type(screen.getByLabelText(/url/i), 'https://example.com')
        await user.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    label: 'My Action',
                }),
            )
        })
    })

    it('calls onOpenChange(false) when Cancel is clicked', async () => {
        const { user } = render(<ButtonActionDialog {...defaultProps} />)

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })

    it('renders Headers and Query parameters sections', () => {
        render(<ButtonActionDialog {...defaultProps} />)

        expect(screen.getByText('Headers')).toBeInTheDocument()
        expect(screen.getByText('Query parameters')).toBeInTheDocument()
    })

    it('renders URL field', () => {
        render(<ButtonActionDialog {...defaultProps} />)

        expect(screen.getByLabelText(/url/i)).toBeInTheDocument()
    })

    it('does not show body section for GET method by default', () => {
        render(<ButtonActionDialog {...defaultProps} />)

        expect(screen.queryByText('Content type')).not.toBeInTheDocument()
        expect(
            screen.queryByLabelText(/body \(json\)/i),
        ).not.toBeInTheDocument()
    })

    it('shows body section when method is POST', async () => {
        render(
            <ButtonActionDialog
                {...defaultProps}
                editButton={{
                    label: 'Test',
                    action: {
                        ...INITIAL_ACTION,
                        method: 'POST',
                        url: 'https://example.com',
                    },
                }}
            />,
        )

        await waitFor(() => {
            expect(screen.getByText('Content type')).toBeInTheDocument()
        })
    })

    it('disables Save button when URL is invalid', async () => {
        const { user } = render(<ButtonActionDialog {...defaultProps} />)

        await user.type(screen.getByLabelText(/button title/i), 'My Action')
        await user.type(screen.getByLabelText(/url/i), 'not-a-valid-url')

        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })

    it('keeps Save enabled when URL contains template variables', async () => {
        const { user } = render(
            <ButtonActionDialog
                {...defaultProps}
                editButton={{
                    label: 'My Action',
                    action: {
                        ...INITIAL_ACTION,
                        url: '{{shopify_domain}}/orders',
                    },
                }}
            />,
        )

        await user.click(screen.getByLabelText(/url/i))
        await user.tab()

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
        })
    }, 10000)

    it('populates all fields from editButton in edit mode', () => {
        const editButton: ButtonConfig = {
            label: 'Refund Order',
            action: {
                method: 'POST',
                url: 'https://api.example.com/refund',
                headers: [
                    { id: '1', key: 'Authorization', value: 'Bearer token' },
                ],
                params: [{ id: '2', key: 'order_id', value: '123' }],
                body: {
                    contentType: 'application/json',
                    'application/json': { reason: 'customer request' },
                    'application/x-www-form-urlencoded': [],
                },
            },
        }

        render(<ButtonActionDialog {...defaultProps} editButton={editButton} />)

        expect(screen.getByLabelText(/button title/i)).toHaveValue(
            'Refund Order',
        )
        expect(screen.getByLabelText(/url/i)).toHaveValue(
            'https://api.example.com/refund',
        )
    })

    it('submits with updated JSON body when editing body in POST mode', async () => {
        const { user } = render(
            <ButtonActionDialog
                {...defaultProps}
                editButton={{
                    label: 'Post Action',
                    action: {
                        ...INITIAL_ACTION,
                        method: 'POST',
                        url: 'https://api.example.com',
                    },
                }}
            />,
        )

        const textarea = await screen.findByLabelText(/body \(json\)/i)
        await user.type(textarea, '{{"msg":"hello"}')
        await user.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: expect.objectContaining({
                        body: expect.objectContaining({
                            'application/json': { msg: 'hello' },
                        }),
                    }),
                }),
            )
        })
    })

    it('submits with form body data when using form content type', async () => {
        const { user } = render(
            <ButtonActionDialog
                {...defaultProps}
                editButton={{
                    label: 'Form Action',
                    action: {
                        ...INITIAL_ACTION,
                        method: 'POST',
                        url: 'https://api.example.com',
                        body: {
                            contentType: 'application/x-www-form-urlencoded',
                            'application/json': {},
                            'application/x-www-form-urlencoded': [],
                        },
                    },
                }}
            />,
        )

        const dialog = screen.getByRole('dialog', {
            name: /edit http action/i,
        })
        const formBodySection = getParameterSection(dialog, 'Body (Form)')

        await user.click(
            within(formBodySection).getByRole('button', {
                name: /add parameter/i,
            }),
        )

        const formKeyInput = await within(formBodySection).findByRole(
            'textbox',
            { name: /key/i },
        )
        await user.type(formKeyInput, 'username')

        const saveButton = screen.getByRole('button', { name: /save/i })
        await waitFor(() => {
            expect(saveButton).toBeEnabled()
        })
        await user.click(saveButton)

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: expect.objectContaining({
                        body: expect.objectContaining({
                            contentType: 'application/x-www-form-urlencoded',
                            'application/x-www-form-urlencoded':
                                expect.arrayContaining([
                                    expect.objectContaining({
                                        key: 'username',
                                    }),
                                ]),
                        }),
                    }),
                }),
            )
        })
    }, 10000)

    it('submits with header parameters', async () => {
        const { user } = render(<ButtonActionDialog {...defaultProps} />)
        const dialog = screen.getByRole('dialog', {
            name: /configure http action/i,
        })

        await user.type(within(dialog).getByLabelText(/button title/i), 'A')
        await user.type(within(dialog).getByLabelText(/url/i), 'https://e.co')

        const headersSection = getParameterSection(dialog, 'Headers')
        await user.click(
            within(headersSection).getByRole('button', {
                name: /add parameter/i,
            }),
        )

        const keyInput = await within(headersSection).findByRole('textbox', {
            name: /key/i,
        })
        const valueInput = within(headersSection).getByRole('textbox', {
            name: /^value$/i,
        })

        await user.type(keyInput, 'Authorization')
        await user.type(valueInput, 'token')

        const saveButton = within(dialog).getByRole('button', { name: /save/i })
        await waitFor(() => {
            expect(saveButton).toBeEnabled()
        })
        await user.click(saveButton)

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: expect.objectContaining({
                        headers: expect.arrayContaining([
                            expect.objectContaining({
                                key: 'Authorization',
                                value: 'token',
                            }),
                        ]),
                    }),
                }),
            )
        })
    }, 10000)

    it('does not call onSubmit twice on rapid double-click', async () => {
        let resolveSubmit: () => void
        const slowSubmit = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveSubmit = resolve
                }),
        )

        const { user } = render(
            <ButtonActionDialog {...defaultProps} onSubmit={slowSubmit} />,
        )

        await user.type(screen.getByLabelText(/button title/i), 'My Action')
        await user.type(screen.getByLabelText(/url/i), 'https://example.com')

        const saveButton = screen.getByRole('button', { name: /save/i })
        await waitFor(() => {
            expect(saveButton).toBeEnabled()
        })
        await user.click(saveButton)
        await user.click(saveButton)

        await waitFor(() => {
            expect(slowSubmit).toHaveBeenCalledTimes(1)
        })
        resolveSubmit!()

        await waitFor(() => {
            expect(slowSubmit).toHaveBeenCalledTimes(1)
        })
    }, 10000)
})
