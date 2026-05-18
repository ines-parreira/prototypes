import { render } from '@repo/testing/vitest'
import { screen, waitFor, within } from '@testing-library/react'

import type { ButtonConfig, LinkConfig } from '../CustomActions'
import { CustomActionsSection } from '../CustomActionsSection'

const sampleLink: LinkConfig = {
    label: 'Test Link',
    url: 'https://example.com',
}

const sampleButton: ButtonConfig = {
    label: 'Test Button',
    action: {
        method: 'GET',
        url: 'https://api.example.com',
        headers: [],
        params: [],
        body: {
            contentType: 'application/json',
            'application/json': {},
            'application/x-www-form-urlencoded': [],
        },
    },
}

type Overrides = Partial<{
    links: LinkConfig[]
    buttons: ButtonConfig[]
    onChange: (next: { links: LinkConfig[]; buttons: ButtonConfig[] }) => void
    isLoading: boolean
    isDisabled: boolean
    integrationName: string
    title: string
}>

function renderSection(overrides: Overrides = {}) {
    const onChange = overrides.onChange ?? vi.fn()
    const utils = render(
        <CustomActionsSection
            integrationName={overrides.integrationName ?? 'Shopify'}
            title={overrides.title}
            links={overrides.links ?? [sampleLink]}
            buttons={overrides.buttons ?? [sampleButton]}
            onChange={onChange}
            isLoading={overrides.isLoading ?? false}
            isDisabled={overrides.isDisabled ?? false}
        />,
    )
    return { ...utils, onChange }
}

describe('CustomActionsSection', () => {
    describe('Rendering', () => {
        it('renders integration name and Add button', () => {
            renderSection()

            expect(screen.getByText('Shopify')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /add/i }),
            ).toBeInTheDocument()
        })

        it('renders buttons and links from props', () => {
            renderSection()

            expect(screen.getByText('Test Button')).toBeInTheDocument()
            expect(screen.getByText('Test Link')).toBeInTheDocument()
        })

        it('does not render separator when no actions exist', () => {
            renderSection({ links: [], buttons: [] })

            expect(screen.queryByRole('separator')).not.toBeInTheDocument()
        })

        it('disables Add button while loading', () => {
            renderSection({ isLoading: true })

            expect(screen.getByRole('button', { name: /add/i })).toBeDisabled()
        })

        it('disables Add button when isDisabled is true', () => {
            renderSection({ isDisabled: true })

            expect(screen.getByRole('button', { name: /add/i })).toBeDisabled()
        })

        it('renders custom title when provided', () => {
            renderSection({ title: 'Order custom actions' })

            expect(screen.getByText('Order custom actions')).toBeInTheDocument()
        })
    })

    describe('Add menu interactions', () => {
        it('opens "Add button" dialog', async () => {
            const { user } = renderSection()

            await user.click(screen.getByRole('button', { name: /add/i }))
            await user.click(
                screen.getByRole('menuitem', { name: /add button/i }),
            )

            expect(
                await screen.findByRole('dialog', {
                    name: /configure http action/i,
                }),
            ).toBeInTheDocument()
        })

        it('opens "Add link" dialog', async () => {
            const { user } = renderSection()

            await user.click(screen.getByRole('button', { name: /add/i }))
            await user.click(
                screen.getByRole('menuitem', { name: /add link/i }),
            )

            expect(
                await screen.findByRole('dialog', { name: /add link/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Edit interactions', () => {
        it('opens edit button dialog', async () => {
            const { user } = renderSection()

            await user.click(
                screen.getByRole('button', { name: /edit test button/i }),
            )

            expect(
                await screen.findByRole('dialog', {
                    name: /edit http action/i,
                }),
            ).toBeInTheDocument()
        })

        it('opens edit link dialog', async () => {
            const { user } = renderSection()

            await user.click(
                screen.getByRole('button', { name: /edit test link/i }),
            )

            expect(
                await screen.findByRole('dialog', { name: /edit link/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Submit interactions call onChange with next snapshot', () => {
        it('calls onChange with appended link when adding a new link', async () => {
            const onChange = vi.fn()
            const { user } = renderSection({ onChange })

            await user.click(screen.getByRole('button', { name: /add/i }))
            await user.click(
                screen.getByRole('menuitem', { name: /add link/i }),
            )

            const dialog = await screen.findByRole('dialog', {
                name: /add link/i,
            })
            await user.type(within(dialog).getByLabelText(/title/i), 'New Link')
            await user.type(
                within(dialog).getByLabelText(/url/i),
                'https://new-link.com',
            )

            const saveButton = within(dialog).getByRole('button', {
                name: /save/i,
            })
            await waitFor(() => {
                expect(saveButton).toBeEnabled()
            })
            await user.click(saveButton)

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledTimes(1)
            })
            expect(onChange).toHaveBeenCalledWith({
                links: [
                    sampleLink,
                    { label: 'New Link', url: 'https://new-link.com' },
                ],
                buttons: [sampleButton],
            })
        }, 10000)

        it('calls onChange with replaced link when editing', async () => {
            const onChange = vi.fn()
            const { user } = renderSection({ onChange })

            await user.click(
                screen.getByRole('button', { name: /edit test link/i }),
            )

            const dialog = await screen.findByRole('dialog', {
                name: /edit link/i,
            })
            const titleInput = within(dialog).getByLabelText(/title/i)
            const urlInput = within(dialog).getByLabelText(/url/i)

            await user.clear(titleInput)
            await user.type(titleInput, 'Updated Link')
            await user.clear(urlInput)
            await user.type(urlInput, 'https://updated-link.com')

            const saveButton = within(dialog).getByRole('button', {
                name: /save/i,
            })
            await waitFor(() => {
                expect(saveButton).toBeEnabled()
            })
            await user.click(saveButton)

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledTimes(1)
            })
            expect(onChange).toHaveBeenCalledWith({
                links: [
                    { label: 'Updated Link', url: 'https://updated-link.com' },
                ],
                buttons: [sampleButton],
            })
        })

        it('calls onChange with appended button when adding a new button', async () => {
            const onChange = vi.fn()
            const { user } = renderSection({ onChange })

            await user.click(screen.getByRole('button', { name: /add/i }))
            await user.click(
                screen.getByRole('menuitem', { name: /add button/i }),
            )

            const dialog = await screen.findByRole('dialog', {
                name: /configure http action/i,
            })
            await user.type(
                within(dialog).getByLabelText(/button title/i),
                'New Button',
            )
            await user.type(
                within(dialog).getByLabelText(/url/i),
                'https://api.new-button.com',
            )

            const saveButton = within(dialog).getByRole('button', {
                name: /save/i,
            })
            await waitFor(() => {
                expect(saveButton).toBeEnabled()
            })
            await user.click(saveButton)

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledTimes(1)
            })
            const call = onChange.mock.calls[0][0]
            expect(call.links).toEqual([sampleLink])
            expect(call.buttons).toHaveLength(2)
            expect(call.buttons[1].label).toBe('New Button')
            expect(call.buttons[1].action.url).toBe(
                'https://api.new-button.com',
            )
        }, 10000)

        it('calls onChange with replaced button when editing', async () => {
            const onChange = vi.fn()
            const { user } = renderSection({ onChange })

            await user.click(
                screen.getByRole('button', { name: /edit test button/i }),
            )

            const dialog = await screen.findByRole('dialog', {
                name: /edit http action/i,
            })
            const titleInput = within(dialog).getByLabelText(/button title/i)
            const urlInput = within(dialog).getByLabelText(/url/i)

            await user.clear(titleInput)
            await user.type(titleInput, 'Updated Button')
            await user.clear(urlInput)
            await user.type(urlInput, 'https://api.updated-button.com')

            const saveButton = within(dialog).getByRole('button', {
                name: /save/i,
            })
            await waitFor(() => {
                expect(saveButton).toBeEnabled()
            })
            await user.click(saveButton)

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledTimes(1)
            })
            const call = onChange.mock.calls[0][0]
            expect(call.links).toEqual([sampleLink])
            expect(call.buttons).toHaveLength(1)
            expect(call.buttons[0].label).toBe('Updated Button')
            expect(call.buttons[0].action.url).toBe(
                'https://api.updated-button.com',
            )
        }, 10000)
    })

    describe('Delete interactions call onChange with item removed', () => {
        it('removes a button by index', async () => {
            const onChange = vi.fn()
            const { user } = renderSection({ onChange })

            await user.click(
                screen.getByRole('button', { name: /delete test button/i }),
            )

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledTimes(1)
            })
            expect(onChange).toHaveBeenCalledWith({
                links: [sampleLink],
                buttons: [],
            })
        })

        it('removes a link by index', async () => {
            const onChange = vi.fn()
            const { user } = renderSection({ onChange })

            await user.click(
                screen.getByRole('button', { name: /delete test link/i }),
            )

            await waitFor(() => {
                expect(onChange).toHaveBeenCalledTimes(1)
            })
            expect(onChange).toHaveBeenCalledWith({
                links: [],
                buttons: [sampleButton],
            })
        })
    })
})
