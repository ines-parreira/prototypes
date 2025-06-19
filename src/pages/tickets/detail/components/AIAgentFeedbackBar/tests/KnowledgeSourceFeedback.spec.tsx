import { fireEvent, render, screen } from '@testing-library/react'

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
    },
    resource: {
        id: 'resource-1',
        resourceTitle: 'Test Article',
        resourceType: 'ARTICLE',
    },
}

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
    () => ({
        useKnowledgeSourceSideBar: jest.fn(),
    }),
)

const useKnowledgeSourceSideBarMocked = assumeMock(useKnowledgeSourceSideBar)

const mockResource = (overrides = {}) =>
    ({
        ...defaultResource,
        ...overrides,
    }) as unknown as KnowledgeResource

describe('KnowledgeSourceFeedback', () => {
    beforeEach(() => {
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
            />,
        )

        expect(screen.queryByText('open_in_new')).not.toBeInTheDocument()
        rerender(
            <KnowledgeSourceFeedback
                resource={mockResource({
                    metadata: { url: 'https://example.com', isDeleted: true },
                })}
                onIconClick={jest.fn()}
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
            />,
        )

        const [thumbsUp, thumbsDown] = screen.getAllByRole('button')
        expect(thumbsUp).toHaveAttribute('aria-disabled', 'true')
        expect(thumbsDown).toHaveAttribute('aria-disabled', 'true')
    })
})
