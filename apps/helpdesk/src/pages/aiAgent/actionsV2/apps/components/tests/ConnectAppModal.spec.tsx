import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AxiomProvider } from '@gorgias/axiom'

import { ThemeProvider } from 'core/theme'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

import { ConnectAppModal } from '../ConnectAppModal'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')

const mockedUseStoreIntegrations = useStoreIntegrations as jest.Mock

const buildStore = (overrides: Partial<StoreIntegration>): StoreIntegration =>
    ({
        id: 1,
        name: 'main-store',
        type: IntegrationType.Shopify,
        meta: { oauth: { status: 'success' } },
        ...overrides,
    }) as StoreIntegration

const renderComponent = (
    props?: Partial<React.ComponentProps<typeof ConnectAppModal>>,
) =>
    render(
        <AxiomProvider rootNode={document.body}>
            <ThemeProvider>
                <ConnectAppModal
                    isOpen
                    onOpenChange={jest.fn()}
                    app={{ name: 'ShipMonk' }}
                    onSubmit={jest.fn()}
                    {...props}
                />
            </ThemeProvider>
        </AxiomProvider>,
    )

describe('ConnectAppModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseStoreIntegrations.mockReturnValue([buildStore({ id: 1 })])
    })

    it('does not render when isOpen is false', () => {
        renderComponent({ isOpen: false })

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders the modal heading and description', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', {
                name: 'Almost there! Connect your store',
            }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /ShipMonk needs a connected store to sync orders and run actions in AI Agent/,
            ),
        ).toBeInTheDocument()
    })

    it('hides the store selector when only one store is available', () => {
        renderComponent()

        expect(screen.queryByText('Store')).not.toBeInTheDocument()
    })

    it('renders a multi-select store list with checkbox semantics when multiple stores are available', async () => {
        const user = userEvent.setup()
        mockedUseStoreIntegrations.mockReturnValue([
            buildStore({ id: 1, name: 'store-a' }),
            buildStore({ id: 2, name: 'store-b' }),
        ])

        renderComponent()

        const dialog = screen.getByRole('dialog')
        expect(within(dialog).getByText('Store')).toBeInTheDocument()
        await user.click(
            within(dialog).getByRole('button', { name: /select stores/i }),
        )

        const listbox = await screen.findByRole('listbox')
        const options = within(listbox).getAllByRole('option')
        expect(options).toHaveLength(2)
        expect(options[0]).toHaveAttribute('aria-selected', 'false')
    })

    it('does not render the search field when there are 10 or fewer stores', async () => {
        const user = userEvent.setup()
        mockedUseStoreIntegrations.mockReturnValue(
            Array.from({ length: 10 }, (_, index) =>
                buildStore({ id: index + 1, name: `store-${index + 1}` }),
            ),
        )

        renderComponent()
        await user.click(
            within(screen.getByRole('dialog')).getByRole('button', {
                name: /select stores/i,
            }),
        )

        expect(
            screen.queryByPlaceholderText(/search stores/i),
        ).not.toBeInTheDocument()
    })

    it('renders the search field when there are more than 10 stores', async () => {
        const user = userEvent.setup()
        mockedUseStoreIntegrations.mockReturnValue(
            Array.from({ length: 11 }, (_, index) =>
                buildStore({ id: index + 1, name: `store-${index + 1}` }),
            ),
        )

        renderComponent()
        await user.click(
            within(screen.getByRole('dialog')).getByRole('button', {
                name: /select stores/i,
            }),
        )

        expect(
            await screen.findByPlaceholderText(/search stores/i),
        ).toBeInTheDocument()
    })

    it('disables the primary CTA until at least one store is selected', async () => {
        const user = userEvent.setup()
        mockedUseStoreIntegrations.mockReturnValue([
            buildStore({ id: 1, name: 'store-a' }),
            buildStore({ id: 2, name: 'store-b' }),
        ])

        renderComponent()
        const cta = screen.getByRole('button', { name: /connect store/i })
        expect(cta).toBeDisabled()

        await user.click(
            within(screen.getByRole('dialog')).getByRole('button', {
                name: /select stores/i,
            }),
        )
        const listbox = await screen.findByRole('listbox')
        await user.click(
            within(listbox).getByRole('option', { name: 'store-a' }),
        )
        await user.keyboard('{Escape}')

        expect(
            screen.getByRole('button', { name: /connect store/i }),
        ).toBeEnabled()
    })

    it('auto-selects the single store and submits with that store on CTA click', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        renderComponent({ onSubmit })

        await user.click(screen.getByRole('button', { name: /connect store/i }))

        expect(onSubmit).toHaveBeenCalledTimes(1)
        const submittedStores = onSubmit.mock.calls[0][0]
        expect(submittedStores).toHaveLength(1)
        expect(submittedStores[0].id).toBe(1)
        expect(submittedStores[0].name).toBe('main-store')
    })

    it('submits the full set of selected stores when the user picks several', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        mockedUseStoreIntegrations.mockReturnValue([
            buildStore({ id: 1, name: 'store-a' }),
            buildStore({ id: 2, name: 'store-b' }),
            buildStore({ id: 3, name: 'store-c' }),
        ])

        renderComponent({ onSubmit })

        await user.click(
            within(screen.getByRole('dialog')).getByRole('button', {
                name: /select stores/i,
            }),
        )
        const listbox = await screen.findByRole('listbox')
        await user.click(
            within(listbox).getByRole('option', { name: 'store-a' }),
        )
        await user.click(
            within(listbox).getByRole('option', { name: 'store-c' }),
        )
        await user.keyboard('{Escape}')

        await user.click(screen.getByRole('button', { name: /connect store/i }))

        expect(onSubmit).toHaveBeenCalledTimes(1)
        const submittedStores = onSubmit.mock.calls[0][0]
        expect(
            submittedStores.map((store: StoreIntegration) => store.id),
        ).toEqual([1, 3])
    })

    it('does not render a cancel button (nudges the user to pick a store)', () => {
        renderComponent()

        expect(
            screen.queryByRole('button', { name: /cancel/i }),
        ).not.toBeInTheDocument()
    })

    it('shows the primary CTA in a loading state while submitting', () => {
        renderComponent({ isSubmitting: true })

        expect(
            screen.getByRole('button', { name: /connect store/i }),
        ).toBeDisabled()
    })

    it('keeps the primary CTA disabled when there are no stores available', () => {
        mockedUseStoreIntegrations.mockReturnValue([])

        renderComponent()

        expect(
            screen.getByRole('button', { name: /connect store/i }),
        ).toBeDisabled()
        expect(screen.queryByText('Store')).not.toBeInTheDocument()
    })

    it('does not call onSubmit when the form is submitted via the Enter key without a selection', async () => {
        const user = userEvent.setup()
        const onSubmit = jest.fn()
        mockedUseStoreIntegrations.mockReturnValue([])

        renderComponent({ onSubmit })

        const form = within(screen.getByRole('dialog')).getByRole('form', {
            name: /connect shipmonk/i,
        })
        form.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true }),
        )
        await user.keyboard('{Tab}')

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('calls onOpenChange(false) when Escape is pressed', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()
        renderComponent({ onOpenChange })

        await user.keyboard('{Escape}')

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })
})
