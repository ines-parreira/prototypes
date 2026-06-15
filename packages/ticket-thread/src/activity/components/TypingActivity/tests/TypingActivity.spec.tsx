import type { ReactNode } from 'react'

import { describe, expect, it, vi } from 'vitest'

import { render } from '../../../../tests/render.utils'
import type { ActivityParticipant } from '../../../helpers/activityParticipants'
import { TypingActivity } from '../TypingActivity'

const animatedCollectionState = vi.hoisted(() => ({
    displayedItems: [] as ActivityParticipant[],
    hasItems: false,
    isVisible: false,
}))

const trailingContentState = vi.hoisted(() => ({
    allItemsFit: true,
    hiddenCount: 0,
    visibleParticipantsCount: 0,
}))

const activityOverflowListMock = vi.hoisted(() => vi.fn())
const useAnimatedCollectionMock = vi.hoisted(() => vi.fn())

vi.mock('../../ActivityOverflowList', () => ({
    ActivityOverflowList: (props: {
        participants: ActivityParticipant[]
        renderTrailingContent: (params?: {
            allItemsFit?: boolean
            hiddenCount?: number
            visibleParticipantsCount?: number
        }) => ReactNode
    }) => {
        activityOverflowListMock(props)

        return (
            <div aria-label="activity-overflow-list">
                <span>
                    {props.participants.map((item) => item.name).join(', ')}
                </span>
                {props.renderTrailingContent(trailingContentState)}
            </div>
        )
    },
}))

vi.mock('../../../hooks/useAnimatedCollection', () => ({
    useAnimatedCollection: useAnimatedCollectionMock,
}))

describe('TypingActivity', () => {
    it('renders nothing when there are no displayed participants', () => {
        animatedCollectionState.displayedItems = []
        animatedCollectionState.hasItems = false
        animatedCollectionState.isVisible = false
        useAnimatedCollectionMock.mockReturnValue(animatedCollectionState)

        const { container } = render(<TypingActivity />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders the singular typing sentence for one customer', () => {
        animatedCollectionState.displayedItems = [{ id: 1, name: 'Jane Doe' }]
        animatedCollectionState.hasItems = true
        animatedCollectionState.isVisible = true
        trailingContentState.allItemsFit = true
        trailingContentState.hiddenCount = 0
        trailingContentState.visibleParticipantsCount = 1
        useAnimatedCollectionMock.mockReturnValue(animatedCollectionState)

        const { getByLabelText, getByText } = render(
            <TypingActivity customers={[{ id: 1, name: 'Jane Doe' }]} />,
        )

        expect(getByLabelText('activity-overflow-list')).toHaveTextContent(
            'Jane Doe',
        )
        expect(getByText('is typing')).toBeInTheDocument()
    })

    it('passes customers before agents into the animated collection', () => {
        useAnimatedCollectionMock.mockImplementation((items) => ({
            displayedItems: items,
            hasItems: items.length > 0,
            isVisible: true,
        }))

        render(
            <TypingActivity
                customers={[{ id: 1, name: 'Jane Doe' }]}
                agents={[
                    { id: 2, name: 'Alice' },
                    { id: 3, name: 'Bob' },
                ]}
            />,
        )

        expect(useAnimatedCollectionMock).toHaveBeenCalledWith([
            { id: 1, name: 'Jane Doe' },
            { id: 2, name: 'Alice' },
            { id: 3, name: 'Bob' },
        ])
    })

    it('renders the overflow typing suffix when not all items fit', () => {
        animatedCollectionState.displayedItems = [{ id: 1, name: 'Alice' }]
        animatedCollectionState.hasItems = true
        animatedCollectionState.isVisible = true
        trailingContentState.allItemsFit = false
        trailingContentState.hiddenCount = 2
        trailingContentState.visibleParticipantsCount = 1
        useAnimatedCollectionMock.mockReturnValue(animatedCollectionState)

        const { getByText } = render(
            <TypingActivity agents={[{ id: 1, name: 'Alice' }]} />,
        )

        expect(getByText('2 others')).toBeInTheDocument()
        expect(getByText('are typing')).toBeInTheDocument()
    })
})
