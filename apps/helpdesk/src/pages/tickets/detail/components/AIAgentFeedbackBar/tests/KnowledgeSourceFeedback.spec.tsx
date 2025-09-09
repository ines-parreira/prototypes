import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'

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
        resourceSetId: 'help-center-1',
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

describe('KnowledgeSourceFeedback', () => {
    const mockOpenPreview = jest.fn()

    const defaultProps = {
        resource: mockResource(),
        onIconClick: jest.fn(),
        shopName: 'test-shop',
        shopType: 'test-type',
    }

    beforeEach(() => {
        useGetGuidancesAvailableActionsMocked.mockReturnValue({
            isLoading: false,
            guidanceActions: [],
        })
        useKnowledgeSourceSideBarMocked.mockReturnValue({
            selectedResource: null,
            mode: null,
            isClosing: false,
            openPreview: mockOpenPreview,
            openEdit: jest.fn(),
            openCreate: jest.fn(),
            closeModal: jest.fn(),
        })
        mockOpenPreview.mockClear()
    })
    it('renders resource title and icon', () => {
        render(
            <KnowledgeSourceFeedback
                {...defaultProps}
                resource={mockResource({
                    resource: { resourceType: 'ORDER' },
                })}
            />,
        )

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
                    resource: { resourceType: 'ORDER' },
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

    it('should render thumb up button as selected when feedback is positive', () => {
        render(
            <KnowledgeSourceFeedback
                {...defaultProps}
                resource={mockResource({
                    feedback: { feedbackValue: 'UP' },
                })}
            />,
        )

        const thumbUpIcon = screen.getByText('thumb_up')
        const thumbDownIcon = screen.getByText('thumb_down')

        expect(thumbUpIcon).not.toHaveClass('material-icons-outlined')

        expect(thumbDownIcon).toHaveClass('material-icons-outlined')
    })

    it('should render thumb down button as selected when feedback is negative', () => {
        render(
            <KnowledgeSourceFeedback
                {...defaultProps}
                resource={mockResource({
                    feedback: { feedbackValue: 'DOWN' },
                })}
            />,
        )

        const thumbUpIcon = screen.getByText('thumb_up')
        const thumbDownIcon = screen.getByText('thumb_down')

        expect(thumbDownIcon).not.toHaveClass('material-icons-outlined')

        expect(thumbUpIcon).toHaveClass('material-icons-outlined')
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

        it('should not call openPreview when resource is deleted', () => {
            const deletedResource = mockResource({
                metadata: {
                    ...defaultResource.metadata,
                    isDeleted: true,
                },
            })
            renderComponentAndClickSource(deletedResource)

            expect(mockOpenPreview).not.toHaveBeenCalled()
        })

        it('should call openPreview resource type is ARTICLE', () => {
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

        it('should not call any functions when isMetadataLoading is true', () => {
            renderComponentAndClickSource(mockResource(), {
                isMetadataLoading: true,
            })

            expect(mockOpenPreview).not.toHaveBeenCalled()
        })
    })

    describe('handleLinkClick conditional logic', () => {
        it('should call onKnowledgeResourceClick when all conditions are met', () => {
            const mockOnKnowledgeResourceClick = jest.fn()
            const orderResource = mockResource({
                resource: {
                    resourceType: 'ORDER',
                    resourceId: 'order-123',
                    resourceSetId: 'set-456',
                },
                metadata: {
                    url: 'https://example.com/order/123',
                    isDeleted: false,
                },
            })

            render(
                <KnowledgeSourceFeedback
                    {...defaultProps}
                    resource={orderResource}
                    onKnowledgeResourceClick={mockOnKnowledgeResourceClick}
                />,
            )

            const link = screen.getByRole('link')
            fireEvent.click(link)

            expect(mockOnKnowledgeResourceClick).toHaveBeenCalledTimes(1)
            expect(mockOnKnowledgeResourceClick).toHaveBeenCalledWith(
                'order-123',
                'ORDER',
                'set-456',
            )
        })

        it('should not call onKnowledgeResourceClick when resource is not a link type', () => {
            const mockOnKnowledgeResourceClick = jest.fn()
            const articleResource = mockResource({
                resource: {
                    resourceType: 'ARTICLE',
                    resourceId: 'article-123',
                    resourceSetId: 'set-456',
                },
            })

            render(
                <KnowledgeSourceFeedback
                    {...defaultProps}
                    resource={articleResource}
                    onKnowledgeResourceClick={mockOnKnowledgeResourceClick}
                />,
            )

            const knowledgeSource = screen.getByText('Test Knowledge Title')
            fireEvent.click(knowledgeSource)

            expect(mockOnKnowledgeResourceClick).not.toHaveBeenCalled()
        })
    })
})
