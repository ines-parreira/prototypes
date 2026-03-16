import { screen, waitFor } from '@testing-library/react'

import { render } from '../../../../../../../tests/render.utils'
import { INITIAL_ACTION } from '../../utils/customActionConstants'
import type { ButtonConfig } from '../../utils/customActionTypes'
import { ButtonActionDialog } from '../ButtonActionDialog'

describe('ButtonActionDialog', () => {
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
        render(
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

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
        })
    })

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

        await screen.findByText('Body (Form)')
        const addButtons = screen.getAllByRole('button', {
            name: /add parameter/i,
        })
        await user.click(addButtons[addButtons.length - 1])

        const keyInputs = screen.getAllByRole('textbox', { name: /key/i })
        const formKeyInput = keyInputs[keyInputs.length - 1]
        await user.type(formKeyInput, 'username')

        await user.click(screen.getByRole('button', { name: /save/i }))

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
    })

    it('submits with header parameters', async () => {
        const { user } = render(<ButtonActionDialog {...defaultProps} />)

        await user.type(screen.getByLabelText(/button title/i), 'With Headers')
        await user.type(screen.getByLabelText(/url/i), 'https://example.com')

        const addButtons = screen.getAllByRole('button', {
            name: /add parameter/i,
        })
        await user.click(addButtons[0])

        const keyInputs = screen.getAllByRole('textbox', { name: /key/i })
        await user.type(keyInputs[0], 'Authorization')

        const valueInputs = screen.getAllByRole('textbox', { name: /^value$/i })
        await user.type(valueInputs[0], 'Bearer token123')

        await user.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: expect.objectContaining({
                        headers: expect.arrayContaining([
                            expect.objectContaining({
                                key: 'Authorization',
                                value: 'Bearer token123',
                            }),
                        ]),
                    }),
                }),
            )
        })
    })

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
        await user.click(saveButton)
        await user.click(saveButton)

        resolveSubmit!()

        await waitFor(() => {
            expect(slowSubmit).toHaveBeenCalledTimes(1)
        })
    })
})
