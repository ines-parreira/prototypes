import type { ReactNode } from 'react'

import { describe, expect, it, vi } from 'vitest'

import { render } from '../../../../tests/render.utils'
import type { ActivityParticipant } from '../../../helpers/activityParticipants'
import { ViewingActivity } from '../ViewingActivity'

const animatedCollectionState = vi.hoisted(() => ({
    displayedItems: [] as ActivityParticipant[],
    hasItems: false,
    isVisible: false,
}))

const renderingBehaviourState = vi.hoisted(() => ({
    shouldReserveSpace: true,
}))

const trailingContentState = vi.hoisted(() => ({
    allItemsFit: true,
    hiddenCount: 0,
    visibleParticipantsCount: 0,
}))

const activityOverflowListMock = vi.hoisted(() => vi.fn())
const useAnimatedCollectionMock = vi.hoisted(() => vi.fn())
const useRenderingBehaviourMock = vi.hoisted(() => vi.fn())

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

vi.mock('../useRenderingBehaviour', () => ({
    useRenderingBehaviour: useRenderingBehaviourMock,
}))

describe('ViewingActivity', () => {
    it('renders nothing when there are no displayed agents', () => {
        animatedCollectionState.displayedItems = []
        animatedCollectionState.hasItems = false
        animatedCollectionState.isVisible = false
        trailingContentState.allItemsFit = true
        trailingContentState.hiddenCount = 0
        trailingContentState.visibleParticipantsCount = 0
        useAnimatedCollectionMock.mockReturnValue(animatedCollectionState)
        useRenderingBehaviourMock.mockReturnValue(renderingBehaviourState)

        const { container } = render(<ViewingActivity agents={[]} />)

        expect(container).toBeEmptyDOMElement()
    })

    it('renders the singular viewing sentence for one agent', () => {
        animatedCollectionState.displayedItems = [{ id: 1, name: 'Alice' }]
        animatedCollectionState.hasItems = true
        animatedCollectionState.isVisible = true
        trailingContentState.allItemsFit = true
        trailingContentState.hiddenCount = 0
        trailingContentState.visibleParticipantsCount = 1
        useAnimatedCollectionMock.mockReturnValue(animatedCollectionState)
        useRenderingBehaviourMock.mockReturnValue(renderingBehaviourState)

        const { getByLabelText, getByText } = render(
            <ViewingActivity agents={[{ id: 1, name: 'Alice' }]} />,
        )

        expect(getByLabelText('activity-overflow-list')).toHaveTextContent(
            'Alice',
        )
        expect(getByText(/is also viewing this ticket/)).toBeInTheDocument()
    })

    it('renders the overflow viewing suffix when not all items fit', () => {
        animatedCollectionState.displayedItems = [{ id: 1, name: 'Alice' }]
        animatedCollectionState.hasItems = true
        animatedCollectionState.isVisible = true
        trailingContentState.allItemsFit = false
        trailingContentState.hiddenCount = 2
        trailingContentState.visibleParticipantsCount = 1
        useAnimatedCollectionMock.mockReturnValue(animatedCollectionState)
        useRenderingBehaviourMock.mockReturnValue(renderingBehaviourState)

        const { getByText } = render(
            <ViewingActivity agents={[{ id: 1, name: 'Alice' }]} />,
        )

        expect(getByText('2 others')).toBeInTheDocument()
        expect(getByText(/are also viewing this ticket/)).toBeInTheDocument()
    })
})
