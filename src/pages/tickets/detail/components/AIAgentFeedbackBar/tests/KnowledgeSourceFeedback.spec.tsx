import { fireEvent, render, screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { assumeMock } from 'utils/testing'

import KnowledgeSourceFeedback from '../KnowledgeSourceFeedback'
import { KnowledgeResource } from '../types'

const defaultResource = {
    feedback: { feedbackValue: null },
    metadata: {
        isDeleted: false,
        title: 'Test Knowledge Title',
        url: 'https://example.com',
        helpCenterId: '1',
    },
    resource: {
        id: 'resource-1',
        resourceTitle: 'Test Article',
        resourceType: 'ARTICLE',
    },
}

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
)
const useKnowledgeSourceSideBarMocked = assumeMock(useKnowledgeSourceSideBar)

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
)
const useGetGuidancesAvailableActionsMocked = assumeMock(
    useGetGuidancesAvailableActions,
)
const mockResource = (overrides = {}) =>
    ({
        ...defaultResource,
        ...overrides,
    }) as unknown as KnowledgeResource

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = useFlag as jest.Mock

describe('KnowledgeSourceFeedback', () => {
    beforeEach(() => {
        useGetGuidancesAvailableActionsMocked.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
        })
        useFlagMock.mockReturnValue(false)
        useKnowledgeSourceSideBarMocked.mockReturnValue({
            selectedResource: null,
            mode: null,
            openPreview: jest.fn(),
            openEdit: jest.fn(),
            openCreate: jest.fn(),
            closeModal: jest.fn(),
        })
    })
    it('renders resource title and icon', () => {
        render(
            <KnowledgeSourceFeedback
                resource={mockResource()}
                onIconClick={jest.fn()}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        expect(screen.getByText('Test Knowledge Title')).toBeInTheDocument()
        expect(screen.getByText('open_in_new')).toBeInTheDocument()
    })

    it('does not render open-in-new icon if url is missing', () => {
        const { rerender } = render(
            <KnowledgeSourceFeedback
                resource={mockResource({
                    metadata: { url: null, isDeleted: false },
                })}
                onIconClick={jest.fn()}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        expect(screen.queryByText('open_in_new')).not.toBeInTheDocument()
        rerender(
            <KnowledgeSourceFeedback
                resource={mockResource({
                    metadata: { url: 'https://example.com', isDeleted: true },
                })}
                onIconClick={jest.fn()}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        expect(screen.queryByText('open_in_new')).toBeInTheDocument()
    })

    it('should call onIconClick with UP when thumbs up is clicked', () => {
        const onIconClick = jest.fn()
        render(
            <KnowledgeSourceFeedback
                resource={mockResource()}
                onIconClick={onIconClick}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        const thumbUp = screen.getByText('thumb_up')
        fireEvent.click(thumbUp)

        expect(onIconClick).toHaveBeenCalledWith('UP', defaultResource)
    })

    it('should call onIconClick with DOWN when thumbs down is clicked', () => {
        const onIconClick = jest.fn()
        render(
            <KnowledgeSourceFeedback
                resource={mockResource()}
                onIconClick={onIconClick}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        const thumbDown = screen.getByText('thumb_down')
        fireEvent.click(thumbDown)
        expect(onIconClick).toHaveBeenCalledWith('DOWN', defaultResource)
    })

    it('should disable feedback buttons when resource is deleted', () => {
        render(
            <KnowledgeSourceFeedback
                resource={mockResource({ metadata: { isDeleted: true } })}
                onIconClick={jest.fn()}
                shopName="test-shop"
                shopType="test-type"
            />,
        )

        const [thumbsUp, thumbsDown] = screen.getAllByRole('button')
        expect(thumbsUp).toHaveAttribute('aria-disabled', 'true')
        expect(thumbsDown).toHaveAttribute('aria-disabled', 'true')
    })
})
