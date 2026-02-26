import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import type { Opportunity } from '../../types'
import { ResourceType } from '../../types'
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
    ticketCount: 5,
    insight: 'Test Opportunity Title',
    resources: [
        {
            title: 'Test Opportunity Title',
            content: 'Test content',
            type: ResourceType.GUIDANCE,
            isVisible: true,
        },
    ],
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

    afterEach(() => {
        jest.restoreAllMocks()
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
        it('should render "Mark as done" button for knowledge gaps', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /Mark as done/i }),
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
                name: /Mark as done/i,
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
                name: /Mark as done/i,
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
                name: /Mark as done/i,
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

        it('should be disabled when no changes have been made (isFormDirty=false)', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
                opportunities: [],
                isFormDirty: false,
            })

            const resolveButton = screen.getByRole('button', {
                name: /resolve/i,
            })

            expect(resolveButton).toBeDisabled()
        })

        it('should be enabled when changes have been made (isFormDirty=true)', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
                opportunities: [],
                isFormDirty: true,
            })

            const resolveButton = screen.getByRole('button', {
                name: /resolve/i,
            })

            expect(resolveButton).not.toBeDisabled()
        })

        it('should call handleResolve when clicked and changes have been made', async () => {
            const user = userEvent.setup()
            const handleResolve = jest.fn()
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
                opportunities: [],
                isFormDirty: true,
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

        it('should not call handleResolve when button is disabled', async () => {
            const user = userEvent.setup()
            const handleResolve = jest.fn()
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
                opportunities: [],
                isFormDirty: false,
                opportunityCTAs: {
                    ...mockOpportunityCTAs,
                    handleResolve,
                },
            })

            const resolveButton = screen.getByRole('button', {
                name: /resolve/i,
            })

            // Verify button is disabled
            expect(resolveButton).toBeDisabled()

            // Try to click (should not trigger handler)
            await user.click(resolveButton)

            expect(handleResolve).not.toHaveBeenCalled()
        })

        it('should be disabled when form is invalid (isFormValid=false) even if form is dirty', () => {
            const conflictOpportunity: Opportunity = {
                ...mockOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            }

            renderComponent({
                selectedOpportunity: conflictOpportunity,
                opportunities: [],
                isFormDirty: true,
                isFormValid: false,
            })

            const resolveButton = screen.getByRole('button', {
                name: /resolve/i,
            })

            expect(resolveButton).toBeDisabled()
        })
    })

    describe('Sidebar Button', () => {
        it('should show sidebar button when sidebar is hidden', () => {
            const {
                useOpportunitiesSidebar,
            } = require('../../hooks/useOpportunitiesSidebar')
            useOpportunitiesSidebar.mockReturnValue({
                isSidebarVisible: false,
                setIsSidebarVisible: jest.fn(),
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: /show sidebar/i }),
            ).toBeInTheDocument()
        })

        it('should hide sidebar button when sidebar is visible', () => {
            const {
                useOpportunitiesSidebar,
            } = require('../../hooks/useOpportunitiesSidebar')
            useOpportunitiesSidebar.mockReturnValue({
                isSidebarVisible: true,
                setIsSidebarVisible: jest.fn(),
            })

            renderComponent()

            expect(
                screen.queryByRole('button', { name: /show sidebar/i }),
            ).not.toBeInTheDocument()
        })

        it('should call setIsSidebarVisible when sidebar button is clicked', async () => {
            const user = userEvent.setup()
            const setIsSidebarVisible = jest.fn()
            const {
                useOpportunitiesSidebar,
            } = require('../../hooks/useOpportunitiesSidebar')
            useOpportunitiesSidebar.mockReturnValue({
                isSidebarVisible: false,
                setIsSidebarVisible,
            })

            renderComponent()

            const sidebarButton = screen.getByRole('button', {
                name: /show sidebar/i,
            })
            await user.click(sidebarButton)

            expect(setIsSidebarVisible).toHaveBeenCalledWith(true)
        })
    })
})
