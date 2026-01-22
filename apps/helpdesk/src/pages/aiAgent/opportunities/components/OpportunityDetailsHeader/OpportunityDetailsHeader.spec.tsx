import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import type { Opportunity } from '../../types'
import { OpportunityDetailsHeader } from './OpportunityDetailsHeader'

jest.mock('../../hooks/useOpportunitiesSidebar', () => ({
    useOpportunitiesSidebar: jest.fn(() => ({
        isSidebarVisible: true,
        setIsSidebarVisible: jest.fn(),
    })),
}))

jest.mock('../../hooks/useGuidanceCount', () => ({
    useGuidanceCount: jest.fn(() => ({
        guidanceCount: 50,
        isLoading: false,
    })),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            guidance: '/guidance',
        },
    })),
}))

jest.mock('../OpportunitiesNavigation/OpportunitiesNavigation', () => ({
    OpportunitiesNavigation: () => (
        <div data-testid="opportunities-navigation" />
    ),
}))

jest.mock('pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip', () => ({
    TruncatedTextWithTooltip: ({
        children,
        className,
    }: {
        children: React.ReactNode
        className?: string
    }) => <div className={className}>{children}</div>,
}))

const mockOpportunity: Opportunity = {
    id: '123',
    key: 'ai_123',
    type: OpportunityType.FILL_KNOWLEDGE_GAP,
    title: 'Test Opportunity Title',
    content: 'Test content',
    ticketCount: 5,
}

const mockOpportunityConfig = {
    shopName: 'test-shop',
    shopIntegrationId: 456,
    helpCenterId: 789,
    guidanceHelpCenterId: 101,
    useKnowledgeService: true,
    onArchive: jest.fn(),
    onPublish: jest.fn(),
    markArticleAsReviewed: jest.fn(),
}

const mockOpportunityCTAs = {
    handleApprove: jest.fn(),
    handleResolve: jest.fn(),
    handleDismiss: jest.fn(),
    isProcessing: false,
}

describe('OpportunityDetailsHeader', () => {
    const defaultProps = {
        selectedOpportunity: mockOpportunity,
        opportunityCTAs: mockOpportunityCTAs,
        opportunityConfig: mockOpportunityConfig,
        totalCount: 10,
        onOpenDismissModal: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (props = {}) => {
        return render(<OpportunityDetailsHeader {...defaultProps} {...props} />)
    }

    describe('Title Display', () => {
        it('should render opportunity title with type label', () => {
            renderComponent()

            expect(
                screen.getByText(/Fill knowledge gap: Test Opportunity Title/),
            ).toBeInTheDocument()
        })

        it('should show "Resolve conflict" label for conflict opportunities', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({ selectedOpportunity: conflictOpportunity })

            expect(
                screen.getByText(/Resolve conflict: Test Opportunity Title/),
            ).toBeInTheDocument()
        })
    })

    describe('Dismiss Button', () => {
        it('should render dismiss button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /dismiss/i }),
            ).toBeInTheDocument()
        })

        it('should call onOpenDismissModal when dismiss button is clicked', async () => {
            const user = userEvent.setup()
            const onOpenDismissModal = jest.fn()

            renderComponent({ onOpenDismissModal })

            const dismissButton = screen.getByRole('button', {
                name: /dismiss/i,
            })
            await user.click(dismissButton)

            expect(onOpenDismissModal).toHaveBeenCalledTimes(1)
        })
    })

    describe('Knowledge Gap - Approve Button', () => {
        it('should render "Publish and enable" button for knowledge gaps', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /publish and enable/i }),
            ).toBeInTheDocument()
        })

        it('should call handleApprove when clicked', async () => {
            const user = userEvent.setup()
            const handleApprove = jest.fn()

            renderComponent({
                opportunityCTAs: {
                    ...mockOpportunityCTAs,
                    handleApprove,
                },
            })

            const approveButton = screen.getByRole('button', {
                name: /publish and enable/i,
            })
            await user.click(approveButton)

            expect(handleApprove).toHaveBeenCalledTimes(1)
        })

        it('should show loading state when processing', () => {
            renderComponent({
                opportunityCTAs: {
                    ...mockOpportunityCTAs,
                    isProcessing: true,
                },
            })

            const approveButton = screen.getByRole('button', {
                name: /publish and enable/i,
            })

            expect(approveButton).toBeDisabled()
        })

        it('should be disabled when guidance count reaches max', () => {
            const { useGuidanceCount } = require('../../hooks/useGuidanceCount')
            useGuidanceCount.mockReturnValue({
                guidanceCount: 100,
                isLoading: false,
            })

            renderComponent()

            const approveButton = screen.getByRole('button', {
                name: /publish and enable/i,
            })

            expect(approveButton).toBeDisabled()
        })
    })

    describe('Resolve Conflict - Resolve Button', () => {
        it('should render "Resolve" button for conflict opportunities', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
                opportunities: [],
            })

            expect(
                screen.getByRole('button', { name: /resolve/i }),
            ).toBeInTheDocument()
        })

        it('should call handleResolve when clicked', async () => {
            const user = userEvent.setup()
            const handleResolve = jest.fn()
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
                opportunities: [],
                opportunityCTAs: {
                    ...mockOpportunityCTAs,
                    handleResolve,
                },
            })

            const resolveButton = screen.getByRole('button', {
                name: /resolve/i,
            })
            await user.click(resolveButton)

            expect(handleResolve).toHaveBeenCalledTimes(1)
        })
    })
})
