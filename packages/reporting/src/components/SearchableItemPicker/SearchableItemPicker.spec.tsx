import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SearchableItemPicker } from './SearchableItemPicker'

const sections = [
    {
        id: 'section-1',
        items: [
            { id: '1', label: 'Sales Report' },
            { id: '2', label: 'Support Overview' },
        ],
    },
    {
        id: 'section-2',
        items: [{ id: '3', label: 'Weekly Summary' }],
    },
]

describe('SearchableItemPicker', () => {
    it('renders a trigger that opens the picker', async () => {
        const user = userEvent.setup()

        render(<SearchableItemPicker sections={sections} onSelect={vi.fn()} />)

        await user.click(
            screen.getByRole('button', { name: 'arrow-chevron-down' }),
        )

        expect(
            await screen.findByRole('option', { name: 'Sales Report' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Support Overview' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Weekly Summary' }),
        ).toBeInTheDocument()
    })

    it('calls onSelect with the item id when an option is clicked', async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()

        render(<SearchableItemPicker sections={sections} onSelect={onSelect} />)

        await user.click(
            screen.getByRole('button', { name: 'arrow-chevron-down' }),
        )
        await user.click(
            await screen.findByRole('option', { name: 'Sales Report' }),
        )

        expect(onSelect).toHaveBeenCalledWith('1')
    })

    it('filters options when typing in the search field', async () => {
        const user = userEvent.setup()

        render(<SearchableItemPicker sections={sections} onSelect={vi.fn()} />)

        await user.click(
            screen.getByRole('button', { name: 'arrow-chevron-down' }),
        )
        await user.type(await screen.findByRole('searchbox'), 'support')

        expect(
            screen.getByRole('option', { name: 'Support Overview' }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('option', { name: 'Sales Report' }),
        ).not.toBeInTheDocument()
    })

    it('renders footer inside the dropdown', async () => {
        const user = userEvent.setup()

        render(
            <SearchableItemPicker
                sections={sections}
                onSelect={vi.fn()}
                footer={<button type="button">Create New</button>}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: 'arrow-chevron-down' }),
        )

        expect(
            await screen.findByRole('button', { name: 'Create New' }),
        ).toBeInTheDocument()
    })

    it('opens immediately when isOpen is true', async () => {
        render(
            <SearchableItemPicker
                sections={sections}
                onSelect={vi.fn()}
                isOpen={true}
            />,
        )

        expect(
            await screen.findByRole('option', { name: 'Sales Report' }),
        ).toBeInTheDocument()
    })

    it('renders header content inside the dropdown', async () => {
        const user = userEvent.setup()

        render(
            <SearchableItemPicker
                sections={sections}
                onSelect={vi.fn()}
                header={<button type="button">Go back</button>}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: 'arrow-chevron-down' }),
        )

        expect(
            await screen.findByRole('button', { name: 'Go back' }),
        ).toBeInTheDocument()
    })

    it('does not show search field when isSearchable is false', async () => {
        const user = userEvent.setup()

        render(
            <SearchableItemPicker
                sections={sections}
                onSelect={vi.fn()}
                isSearchable={false}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: 'arrow-chevron-down' }),
        )

        await screen.findByRole('option', { name: 'Sales Report' })
        expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    })

    it('renders leadingSlot for items', async () => {
        const user = userEvent.setup()

        const sectionsWithLeadingSlot = [
            {
                id: 'section-1',
                items: [
                    {
                        id: '1',
                        label: 'My Dashboard',
                        leadingSlot: <span>📊</span>,
                    },
                ],
            },
        ]

        render(
            <SearchableItemPicker
                sections={sectionsWithLeadingSlot}
                onSelect={vi.fn()}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: 'arrow-chevron-down' }),
        )

        expect(await screen.findByText('📊')).toBeInTheDocument()
    })

    it('renders trailingSlot for items', async () => {
        const user = userEvent.setup()

        const sectionsWithTrailingSlot = [
            {
                id: 'section-1',
                items: [
                    {
                        id: '1',
                        label: 'My Dashboard',
                        trailingSlot: <span>→</span>,
                    },
                ],
            },
        ]

        render(
            <SearchableItemPicker
                sections={sectionsWithTrailingSlot}
                onSelect={vi.fn()}
            />,
        )

        await user.click(
            screen.getByRole('button', { name: 'arrow-chevron-down' }),
        )

        expect(await screen.findByText('→')).toBeInTheDocument()
    })

    it('calls onOpenChange when the picker closes', async () => {
        const user = userEvent.setup()
        const onOpenChange = vi.fn()

        render(
            <SearchableItemPicker
                sections={sections}
                onSelect={vi.fn()}
                isOpen={true}
                onOpenChange={onOpenChange}
            />,
        )

        await screen.findByRole('option', { name: 'Sales Report' })
        await user.keyboard('{Escape}')

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })
})
