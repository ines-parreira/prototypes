import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

import { SegmentMoreOptions } from './SegmentMoreOptions'

const mockSegment: Segment = {
    id: '1',
    name: 'Support small business',
    conditions: 'gt(shopper.lifetime_value, 1000)',
    count: 100,
    created_datetime: '2026-01-15T00:00:00',
    updated_datetime: '2026-09-12T00:00:00',
}

describe('<SegmentMoreOptions />', () => {
    const onEditClick = jest.fn()
    const onDuplicateClick = jest.fn()
    const onDeleteClick = jest.fn()

    const renderComponent = () =>
        render(
            <SegmentMoreOptions
                segment={mockSegment}
                onEditClick={onEditClick}
                onDuplicateClick={onDuplicateClick}
                onDeleteClick={onDeleteClick}
            />,
        )

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.click(screen.getByRole('button'))
    }

    it('should render Edit, Duplicate and Delete options', async () => {
        const user = userEvent.setup()
        renderComponent()

        await openMenu(user)

        expect(
            await screen.findByRole('option', { name: /edit/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: /duplicate/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: /delete/i }),
        ).toBeInTheDocument()
    })

    it('should call onEditClick with the segment when Edit is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await openMenu(user)
        await user.click(await screen.findByRole('option', { name: /edit/i }))

        expect(onEditClick).toHaveBeenCalledWith(mockSegment)
        expect(onDuplicateClick).not.toHaveBeenCalled()
        expect(onDeleteClick).not.toHaveBeenCalled()
    })

    it('should call onDuplicateClick with the segment when Duplicate is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await openMenu(user)
        await user.click(
            await screen.findByRole('option', { name: /duplicate/i }),
        )

        expect(onDuplicateClick).toHaveBeenCalledWith(mockSegment)
        expect(onEditClick).not.toHaveBeenCalled()
        expect(onDeleteClick).not.toHaveBeenCalled()
    })

    it('should call onDeleteClick with the segment when Delete is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await openMenu(user)
        await user.click(await screen.findByRole('option', { name: /delete/i }))

        expect(onDeleteClick).toHaveBeenCalledWith(mockSegment)
        expect(onEditClick).not.toHaveBeenCalled()
        expect(onDuplicateClick).not.toHaveBeenCalled()
    })
})
