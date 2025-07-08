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
    const mockOpenPreview = jest.fn()

    const defaultProps = {
        resource: mockResource(),
        onIconClick: jest.fn(),
        shopName: 'test-shop',
        shopType: 'test-type',
        onKnowledgeResourceClick: jest.fn(),
    }

    beforeEach(() => {
        useGetGuidancesAvailableActionsMocked.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
        })
        useFlagMock.mockReturnValue(false)
        useKnowledgeSourceSideBarMocked.mockReturnValue({
            selectedResource: null,
            mode: null,
            openPreview: mockOpenPreview,
            openEdit: jest.fn(),
            openCreate: jest.fn(),
            closeModal: jest.fn(),
        })
        mockOpenPreview.mockClear()
    })
    it('renders resource title and icon', () => {
        render(<KnowledgeSourceFeedback {...defaultProps} />)

        expect(screen.getByText('Test Knowledge Title')).toBeInTheDocument()
        expect(screen.getByText('open_in_new')).toBeInTheDocument()
    })

    it('does not render open-in-new icon if url is missing', () => {
        const { rerender } = render(
            <KnowledgeSourceFeedback
                {...defaultProps}
                resource={mockResource({
                    metadata: { url: null, isDeleted: false },
                })}
            />,
        )

        expect(screen.queryByText('open_in_new')).not.toBeInTheDocument()
        rerender(
            <KnowledgeSourceFeedback
                {...defaultProps}
                resource={mockResource({
                    metadata: { url: 'https://example.com', isDeleted: true },
                })}
            />,
        )

        expect(screen.queryByText('open_in_new')).toBeInTheDocument()
    })

    it('should call onIconClick with UP when thumbs up is clicked', () => {
        const onIconClick = jest.fn()
        render(
            <KnowledgeSourceFeedback
                {...defaultProps}
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
                {...defaultProps}
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
                {...defaultProps}
                resource={mockResource({
                    metadata: {
                        ...defaultResource.metadata,
                        isDeleted: true,
                    },
                })}
            />,
        )

        const [thumbsUp, thumbsDown] = screen.getAllByRole('button')
        expect(thumbsUp).toHaveAttribute('aria-disabled', 'true')
        expect(thumbsDown).toHaveAttribute('aria-disabled', 'true')
    })

    describe('when knowledge source is clicked', () => {
        const renderComponentAndClickSource = (
            resource: KnowledgeResource,
            additionalProps = {},
        ) => {
            render(
                <KnowledgeSourceFeedback
                    {...defaultProps}
                    resource={resource}
                    {...additionalProps}
                />,
            )

            const knowledgeSource = screen.getByText('Test Knowledge Title')
            fireEvent.click(knowledgeSource)
        }

        it('should call onKnowledgeResourceClick with correct parameters', () => {
            const onKnowledgeResourceClick = jest.fn()
            renderComponentAndClickSource(mockResource(), {
                onKnowledgeResourceClick,
            })

            expect(onKnowledgeResourceClick).toHaveBeenCalledWith(
                'resource-1',
                'ARTICLE',
            )
        })

        it('should not call openPreview when feature flag is disabled', () => {
            useFlagMock.mockReturnValue(false)
            renderComponentAndClickSource(mockResource())

            expect(mockOpenPreview).not.toHaveBeenCalled()
        })

        it('should not call openPreview when resource is deleted', () => {
            useFlagMock.mockReturnValue(true)
            const deletedResource = mockResource({
                metadata: {
                    ...defaultResource.metadata,
                    isDeleted: true,
                },
            })
            renderComponentAndClickSource(deletedResource)

            expect(mockOpenPreview).not.toHaveBeenCalled()
        })

        it('should call openPreview when feature flag is enabled and resource type is ARTICLE', () => {
            useFlagMock.mockReturnValue(true)
            const resource = mockResource({
                resource: { resourceType: 'ARTICLE' },
            })
            renderComponentAndClickSource(resource)

            expect(mockOpenPreview).toHaveBeenCalledWith({
                id: resource.resource.resourceId,
                url: resource.metadata?.url || '',
                title:
                    resource.metadata?.title ||
                    resource.resource?.resourceTitle,
                content: resource.metadata?.content,
                knowledgeResourceType: 'ARTICLE',
                helpCenterId: resource.resource.resourceSetId,
                shopName: 'test-shop',
                shopType: 'test-type',
            })
        })
    })
})
