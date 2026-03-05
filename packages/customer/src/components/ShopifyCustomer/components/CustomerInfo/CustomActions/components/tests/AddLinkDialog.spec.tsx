import { screen, waitFor } from '@testing-library/react'

import { render } from '../../../../../../../tests/render.utils'
import { AddLinkDialog } from '../AddLinkDialog'

describe('AddLinkDialog', () => {
    const defaultProps = {
        isOpen: true,
        onOpenChange: vi.fn(),
        onSubmit: vi.fn().mockResolvedValue(undefined),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders with "Add link" title when no initialLink', () => {
        render(<AddLinkDialog {...defaultProps} />)
        expect(
            screen.getByRole('dialog', { name: /add link/i }),
        ).toBeInTheDocument()
    })

    it('renders with "Edit link" title when initialLink is provided', () => {
        render(
            <AddLinkDialog
                {...defaultProps}
                initialLink={{ label: 'Test', url: 'https://example.com' }}
            />,
        )
        expect(
            screen.getByRole('dialog', { name: /edit link/i }),
        ).toBeInTheDocument()
    })

    it('disables Save button when fields are empty', () => {
        render(<AddLinkDialog {...defaultProps} />)
        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
    })

    it('enables Save button when both fields are filled', async () => {
        const { user } = render(<AddLinkDialog {...defaultProps} />)

        await user.type(screen.getByLabelText(/title/i), 'My Link')
        await user.type(screen.getByLabelText(/url/i), 'https://example.com')

        expect(screen.getByRole('button', { name: /save/i })).toBeEnabled()
    })

    it('calls onSubmit with ensured HTTPS url on save', async () => {
        const { user } = render(<AddLinkDialog {...defaultProps} />)

        await user.type(screen.getByLabelText(/title/i), 'My Link')
        await user.type(screen.getByLabelText(/url/i), 'https://example.com')
        await user.click(screen.getByRole('button', { name: /save/i }))

        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalledWith({
                label: 'My Link',
                url: 'https://example.com',
            })
        })
    })

    it('calls onOpenChange(false) when Cancel is clicked', async () => {
        const { user } = render(<AddLinkDialog {...defaultProps} />)

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })

    it('populates fields from initialLink', () => {
        render(
            <AddLinkDialog
                {...defaultProps}
                initialLink={{
                    label: 'Existing Link',
                    url: 'https://existing.com',
                }}
            />,
        )

        expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Link')
        expect(screen.getByLabelText(/url/i)).toHaveValue(
            'https://existing.com',
        )
    })

    it('prepends https:// to URL on blur', async () => {
        const { user } = render(<AddLinkDialog {...defaultProps} />)

        const urlInput = screen.getByLabelText(/url/i)
        await user.type(urlInput, 'example.com')
        await user.tab()

        expect(urlInput).toHaveValue('https://example.com')
    })

    it('disables Save button when URL is invalid', async () => {
        const { user } = render(<AddLinkDialog {...defaultProps} />)

        await user.type(screen.getByLabelText(/title/i), 'My Link')
        await user.type(screen.getByLabelText(/url/i), 'not a url at all')

        expect(screen.getByRole('button', { name: /save/i })).toBeDisabled()
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
            <AddLinkDialog {...defaultProps} onSubmit={slowSubmit} />,
        )

        await user.type(screen.getByLabelText(/title/i), 'My Link')
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
