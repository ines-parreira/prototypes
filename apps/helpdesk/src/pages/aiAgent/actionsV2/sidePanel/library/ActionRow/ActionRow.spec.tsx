import { render, userEvent } from '@repo/testing'

import { ActionRow } from './ActionRow'

describe('ActionRow', () => {
    it('renders the action name and provider', () => {
        const { getByText } = render(
            <ActionRow
                iconUrl="/img/shopify.svg"
                name="Add order note"
                provider="Shopify"
                onInsert={() => {}}
            />,
        )
        expect(getByText('Add order note')).toBeInTheDocument()
        expect(getByText('Shopify')).toBeInTheDocument()
    })

    it('inserts on row click and edits on pencil click independently', async () => {
        const user = userEvent.setup()
        const onInsert = jest.fn()
        const onEdit = jest.fn()
        const { getByLabelText, getByRole } = render(
            <ActionRow
                iconUrl="/img/shopify.svg"
                name="Cancel order"
                provider="Shopify"
                onInsert={onInsert}
                onEdit={onEdit}
            />,
        )
        await user.click(getByLabelText('Edit Cancel order'))
        expect(onEdit).toHaveBeenCalledTimes(1)
        expect(onInsert).not.toHaveBeenCalled()

        await user.click(
            getByRole('button', { name: 'Insert Cancel order action' }),
        )
        expect(onInsert).toHaveBeenCalledTimes(1)
    })

    it('highlights the matching part of the action name when a search query is provided', () => {
        const { container } = render(
            <ActionRow
                iconUrl="/img/shopify.svg"
                name="Edit shipping address"
                provider="Shopify"
                searchQuery="ship"
                onInsert={() => {}}
            />,
        )
        const heading = container.querySelector('h5')
        expect(heading?.textContent).toBe('Edit shipping address')
        const marks = container.querySelectorAll('mark')
        expect(marks).toHaveLength(1)
        expect(marks[0]).toHaveTextContent('ship')
    })

    it('marks the row as draggable by default', () => {
        const { getByRole } = render(
            <ActionRow
                iconUrl="/img/shopify.svg"
                name="Add order note"
                provider="Shopify"
                onInsert={() => {}}
            />,
        )
        expect(
            getByRole('button', { name: 'Insert Add order note action' }),
        ).toHaveAttribute('draggable', 'true')
    })

    it('omits the drag handle when isDraggable is false', () => {
        const { container, queryByRole } = render(
            <ActionRow
                iconUrl="/img/shopify.svg"
                name="Add order note"
                provider="Shopify"
                isDraggable={false}
                onInsert={() => {}}
            />,
        )
        expect(queryByRole('presentation')).not.toBeInTheDocument()
        expect(container.firstChild).not.toHaveAttribute('draggable')
    })

    it('renders a non-interactive row when no onInsert handler is provided', () => {
        const { queryByRole, getByText } = render(
            <ActionRow
                iconUrl="/img/shopify.svg"
                name="Add order note"
                provider="Shopify"
            />,
        )
        expect(getByText('Add order note')).toBeInTheDocument()
        expect(queryByRole('button')).not.toBeInTheDocument()
    })

    it('inserts via Enter and Space keys when focused', async () => {
        const user = userEvent.setup()
        const onInsert = jest.fn()
        const { getByRole } = render(
            <ActionRow
                iconUrl="/img/shopify.svg"
                name="Cancel order"
                provider="Shopify"
                onInsert={onInsert}
            />,
        )
        const row = getByRole('button', { name: 'Insert Cancel order action' })
        row.focus()
        await user.keyboard('{Enter}')
        await user.keyboard(' ')
        expect(onInsert).toHaveBeenCalledTimes(2)
    })
})
