import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'
import type { OutboundAuth } from 'models/integration/types/app'

import { ConnectAppAuthModal } from '../ConnectAppAuthModal'

const apiKeyOutboundAuth: OutboundAuth = {
    type: 'api-key',
    url: 'https://api.example.com',
    setup_description: '',
    location: 'header',
    key: 'X-Api-Key',
    vendor: null,
}

const basicOutboundAuth: OutboundAuth = {
    type: 'basic',
    url: 'https://api.example.com',
    setup_description: '',
    location: 'header',
    key: 'Authorization',
    vendor: null,
}

const renderComponent = (
    props?: Partial<React.ComponentProps<typeof ConnectAppAuthModal>>,
) =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <ConnectAppAuthModal
                    isOpen
                    onOpenChange={jest.fn()}
                    app={{ name: 'ShipMonk' }}
                    outboundAuth={apiKeyOutboundAuth}
                    onSubmit={jest.fn()}
                    {...props}
                />
            </ThemeProvider>
        </AxiomProvider>,
    )

describe('ConnectAppAuthModal', () => {
    it('does not render when isOpen is false', () => {
        renderComponent({ isOpen: false })

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders the heading with the app name', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Connect ShipMonk' }),
        ).toBeInTheDocument()
    })

    it('disables the primary CTA until the API key is filled', async () => {
        const user = userEvent.setup()
        renderComponent()

        const dialog = screen.getByRole('dialog')
        const cta = within(dialog).getByRole('button', { name: 'Connect' })
        expect(cta).toBeDisabled()

        await user.type(within(dialog).getByLabelText(/api key/i), 'secret')

        expect(
            within(dialog).getByRole('button', { name: 'Connect' }),
        ).toBeEnabled()
    })

    it('submits the single-value credential for api-key auth', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        renderComponent({ onSubmit })

        const dialog = screen.getByRole('dialog')
        await user.type(
            within(dialog).getByLabelText(/api key/i),
            'secret-token',
        )
        await user.click(
            within(dialog).getByRole('button', { name: 'Connect' }),
        )

        expect(onSubmit).toHaveBeenCalledWith({ value: 'secret-token' })
    })

    it('renders username + password for basic auth and submits both', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        renderComponent({ outboundAuth: basicOutboundAuth, onSubmit })

        const dialog = screen.getByRole('dialog')
        const cta = within(dialog).getByRole('button', { name: 'Connect' })
        expect(cta).toBeDisabled()

        await user.type(within(dialog).getByLabelText(/username/i), 'alice')
        expect(cta).toBeDisabled()
        await user.type(within(dialog).getByLabelText(/password/i), 'hunter2')

        await user.click(
            within(dialog).getByRole('button', { name: 'Connect' }),
        )

        expect(onSubmit).toHaveBeenCalledWith({
            username: 'alice',
            password: 'hunter2',
        })
    })

    it('disables submit and shows a fallback when outboundAuth is null', async () => {
        renderComponent({ outboundAuth: null })

        const dialog = screen.getByRole('dialog')
        expect(
            within(dialog).getByText(/connection details are not available/i),
        ).toBeInTheDocument()
        expect(
            within(dialog).getByRole('button', { name: 'Connect' }),
        ).toBeDisabled()
    })

    it('renders the hardcoded description with the app name and ignores setup_description', () => {
        renderComponent({
            outboundAuth: {
                ...apiKeyOutboundAuth,
                setup_description: 'Find your API key in Settings → API.',
            },
        })

        expect(
            screen.getByText(
                /Gorgias can access your data in ShipMonk and execute actions on your behalf/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Find your API key in Settings → API.'),
        ).not.toBeInTheDocument()
    })

    it('disables the cancel button while submitting', () => {
        renderComponent({ isSubmitting: true })

        expect(
            within(screen.getByRole('dialog')).getByRole('button', {
                name: /cancel/i,
            }),
        ).toBeDisabled()
    })

    it('calls onOpenChange(false) when Cancel is clicked', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        renderComponent({ onOpenChange })

        await user.click(
            within(screen.getByRole('dialog')).getByRole('button', {
                name: /cancel/i,
            }),
        )

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('calls onOpenChange(false) when Escape is pressed', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        renderComponent({ onOpenChange })

        await user.keyboard('{Escape}')

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('labels the field as "Bearer token" when bearer-token auth has no key', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        renderComponent({
            outboundAuth: {
                ...apiKeyOutboundAuth,
                type: 'bearer-token',
                key: '',
            },
            onSubmit,
        })

        const dialog = screen.getByRole('dialog')
        const field = within(dialog).getByLabelText(/bearer token/i)
        await user.type(field, 'token-123')

        await user.click(
            within(dialog).getByRole('button', { name: 'Connect' }),
        )

        expect(onSubmit).toHaveBeenCalledWith({ value: 'token-123' })
    })

    it('uses the bearer-token fallback label when the key is "Authorization"', () => {
        renderComponent({
            outboundAuth: {
                ...apiKeyOutboundAuth,
                type: 'bearer-token',
                key: 'Authorization',
            },
        })

        const dialog = screen.getByRole('dialog')
        expect(
            within(dialog).getByLabelText(/bearer token/i),
        ).toBeInTheDocument()
    })

    it('uses the API key fallback label when api-key auth uses the "Authorization" header', () => {
        renderComponent({
            outboundAuth: {
                ...apiKeyOutboundAuth,
                key: 'Authorization',
            },
        })

        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByLabelText(/api key/i)).toBeInTheDocument()
    })

    it('labels the field with the scheme for custom-scheme auth using the Authorization header', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        renderComponent({
            outboundAuth: {
                ...apiKeyOutboundAuth,
                type: 'custom-scheme',
                key: 'Authorization',
                custom_scheme: 'Klaviyo-API-Key',
            },
            onSubmit,
        })

        const dialog = screen.getByRole('dialog')
        const field = within(dialog).getByLabelText('Klaviyo-API-Key')
        await user.type(field, 'klaviyo-secret')

        await user.click(
            within(dialog).getByRole('button', { name: 'Connect' }),
        )

        expect(onSubmit).toHaveBeenCalledWith({ value: 'klaviyo-secret' })
    })

    it('falls back to "Secret" for custom-scheme when neither key nor scheme is meaningful', () => {
        renderComponent({
            outboundAuth: {
                ...apiKeyOutboundAuth,
                type: 'custom-scheme',
                key: 'Authorization',
            },
        })

        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByLabelText('Secret')).toBeInTheDocument()
    })

    it('renders the raw key as the label when it is neither x-api-key nor Authorization', () => {
        renderComponent({
            outboundAuth: {
                ...apiKeyOutboundAuth,
                key: 'Custom-Header-Name',
            },
        })

        const dialog = screen.getByRole('dialog')
        expect(
            within(dialog).getByLabelText('Custom-Header-Name'),
        ).toBeInTheDocument()
    })

    it('submits when the form is submitted via the Enter key', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        renderComponent({ onSubmit })

        const dialog = screen.getByRole('dialog')
        const field = within(dialog).getByLabelText(/api key/i)
        await user.type(field, 'enter-token{Enter}')

        expect(onSubmit).toHaveBeenCalledWith({ value: 'enter-token' })
    })

    it('resets the inputs when the modal is closed and reopened', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        const { rerender } = renderComponent({ onSubmit })

        const initialDialog = screen.getByRole('dialog')
        await user.type(
            within(initialDialog).getByLabelText(/api key/i),
            'first-secret',
        )

        rerender(
            <AxiomProvider rootNode={document.body}>
                <ThemeProvider>
                    <ConnectAppAuthModal
                        isOpen={false}
                        onOpenChange={jest.fn()}
                        app={{ name: 'ShipMonk' }}
                        outboundAuth={apiKeyOutboundAuth}
                        onSubmit={onSubmit}
                    />
                </ThemeProvider>
            </AxiomProvider>,
        )

        rerender(
            <AxiomProvider rootNode={document.body}>
                <ThemeProvider>
                    <ConnectAppAuthModal
                        isOpen
                        onOpenChange={jest.fn()}
                        app={{ name: 'ShipMonk' }}
                        outboundAuth={apiKeyOutboundAuth}
                        onSubmit={onSubmit}
                    />
                </ThemeProvider>
            </AxiomProvider>,
        )

        const reopenedDialog = screen.getByRole('dialog')
        expect(within(reopenedDialog).getByLabelText(/api key/i)).toHaveValue(
            '',
        )
    })

    it('renders the app icon when iconUrl is provided', () => {
        renderComponent({
            app: { name: 'ShipMonk', iconUrl: 'https://example.com/icon.png' },
        })

        const dialog = screen.getByRole('dialog')
        const icons = within(dialog)
            .getAllByRole('img', { hidden: true })
            .filter(
                (img) =>
                    img.getAttribute('src') === 'https://example.com/icon.png',
            )
        expect(icons.length).toBeGreaterThan(0)
    })
})
