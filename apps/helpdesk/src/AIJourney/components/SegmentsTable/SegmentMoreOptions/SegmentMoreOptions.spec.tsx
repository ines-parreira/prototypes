import type { ReactNode, Ref } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Segment } from 'AIJourney/pages/Segments/Segments'

import { SegmentMoreOptions } from './SegmentMoreOptions'

type MockSelectProps = {
    trigger: (args: { ref: Ref<HTMLElement> }) => ReactNode
    items: { id: string; name: string; icon: string }[]
    onSelect: (item: { id: string; name: string; icon: string }) => void
}

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Select: ({ trigger, items, onSelect }: MockSelectProps) => (
        <div>
            {trigger({ ref: { current: null } })}
            {items.map((item) => (
                <button key={item.id} onClick={() => onSelect(item)}>
                    {item.name}
                </button>
            ))}
        </div>
    ),
    SelectTrigger: ({ children }: { children?: ReactNode }) => <>{children}</>,
    ListItem: ({ label }: { label: string }) => <div>{label}</div>,
}))

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

    it('should render Edit, Duplicate and Delete options', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /edit/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /duplicate/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /delete/i }),
        ).toBeInTheDocument()
    })

    it('should call onEditClick with the segment when Edit is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /edit/i }))

        expect(onEditClick).toHaveBeenCalledWith(mockSegment)
        expect(onDuplicateClick).not.toHaveBeenCalled()
        expect(onDeleteClick).not.toHaveBeenCalled()
    })

    it('should call onDuplicateClick with the segment when Duplicate is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /duplicate/i }))

        expect(onDuplicateClick).toHaveBeenCalledWith(mockSegment)
        expect(onEditClick).not.toHaveBeenCalled()
        expect(onDeleteClick).not.toHaveBeenCalled()
    })

    it('should call onDeleteClick with the segment when Delete is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /delete/i }))

        expect(onDeleteClick).toHaveBeenCalledWith(mockSegment)
        expect(onEditClick).not.toHaveBeenCalled()
        expect(onDuplicateClick).not.toHaveBeenCalled()
    })
})
