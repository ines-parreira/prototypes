import { render } from '@repo/testing'

import { screen } from '@testing-library/react'

import { StepCard } from './StepCard'

describe('<StepCard />', () => {
    const renderStepCard = (
        overrides: Partial<Parameters<typeof StepCard>[0]> = {},
    ) => {
        const props = {
            appName: 'Shopify',
            stepName: 'Inventory stock',
            onDelete: jest.fn(),
            ...overrides,
        }

        return {
            ...render(<StepCard {...props} />),
            onDelete: props.onDelete,
        }
    }

    it('renders the app name and step name', () => {
        renderStepCard()

        expect(screen.getByText('Shopify')).toBeInTheDocument()
        expect(screen.getByText('Inventory stock')).toBeInTheDocument()
    })

    it('exposes the row as a labelled group for screen readers', () => {
        renderStepCard()

        expect(
            screen.getByRole('group', { name: 'Shopify — Inventory stock' }),
        ).toBeInTheDocument()
    })

    it('renders an accessible drag handle button', () => {
        renderStepCard()

        expect(
            screen.getByRole('button', { name: 'Reorder step' }),
        ).toBeInTheDocument()
    })

    it('allows overriding the drag handle label', () => {
        renderStepCard({ dragHandleLabel: 'Drag Shopify step' })

        expect(
            screen.getByRole('button', { name: 'Drag Shopify step' }),
        ).toBeInTheDocument()
    })

    it('calls onDelete when the delete button is clicked', async () => {
        const { user, onDelete } = renderStepCard()

        await user.click(
            screen.getByRole('button', { name: 'Delete Inventory stock step' }),
        )

        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    it('allows overriding the delete button label', () => {
        renderStepCard({ deleteLabel: 'Remove first step' })

        expect(
            screen.getByRole('button', { name: 'Remove first step' }),
        ).toBeInTheDocument()
    })

    it('renders the row as an interactive button when onClick is provided and invokes onClick on click', async () => {
        const onClick = jest.fn()
        const { user } = renderStepCard({ onClick })

        const row = screen.getByRole('button', {
            name: 'Shopify — Inventory stock',
        })
        await user.click(row)

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('invokes onClick when the row is activated with Enter or Space', async () => {
        const onClick = jest.fn()
        const { user } = renderStepCard({ onClick })

        const row = screen.getByRole('button', {
            name: 'Shopify — Inventory stock',
        })
        row.focus()
        await user.keyboard('{Enter}')
        await user.keyboard(' ')

        expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('does not trigger the row onClick when the delete button is clicked', async () => {
        const onClick = jest.fn()
        const onDelete = jest.fn()
        const { user } = renderStepCard({ onClick, onDelete })

        await user.click(
            screen.getByRole('button', { name: 'Delete Inventory stock step' }),
        )

        expect(onDelete).toHaveBeenCalledTimes(1)
        expect(onClick).not.toHaveBeenCalled()
    })

    it('does not trigger the row onClick when Enter is pressed on a nested button', async () => {
        const onClick = jest.fn()
        const onDelete = jest.fn()
        const { user } = renderStepCard({ onClick, onDelete })

        const deleteButton = screen.getByRole('button', {
            name: 'Delete Inventory stock step',
        })
        deleteButton.focus()
        await user.keyboard('{Enter}')

        // Enter on the delete button must fire the delete handler, NOT the
        // row activation handler (keydown bubbles, so the row's onKeyDown
        // needs to filter by event.target === event.currentTarget).
        expect(onDelete).toHaveBeenCalledTimes(1)
        expect(onClick).not.toHaveBeenCalled()
    })

    it('triggers onClick when the user clicks the app name or step name text', async () => {
        const onClick = jest.fn()
        const { user } = renderStepCard({ onClick })

        await user.click(screen.getByText('Shopify'))
        await user.click(screen.getByText('Inventory stock'))

        expect(onClick).toHaveBeenCalledTimes(2)
    })

    it('renders the provider icon when an icon url is provided', () => {
        const { container } = renderStepCard({
            appIconUrl: 'https://example.com/shopify.png',
        })

        const img = container.querySelector(
            'img[src="https://example.com/shopify.png"]',
        )
        expect(img).toBeInTheDocument()
    })

    it('forwards data-handler-id from rowDataHandlerId', () => {
        renderStepCard({ rowDataHandlerId: 'handler-42' })

        expect(
            screen.getByRole('group', { name: 'Shopify — Inventory stock' }),
        ).toHaveAttribute('data-handler-id', 'handler-42')
    })
})
