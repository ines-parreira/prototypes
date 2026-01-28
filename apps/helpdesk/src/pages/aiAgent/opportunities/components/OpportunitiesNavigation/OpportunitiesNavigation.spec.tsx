import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from 'pages/aiAgent/opportunities/enums'
import type { Opportunity } from 'pages/aiAgent/opportunities/types'
import { ResourceType } from 'pages/aiAgent/opportunities/types'

import { OpportunitiesNavigation } from './OpportunitiesNavigation'

// Mock the hook
jest.mock(
    'pages/aiAgent/opportunities/hooks/useOpportunitiesNavigation',
    () => ({
        useOpportunitiesNavigation: jest.fn(() => ({
            position: 0,
            isFirst: true,
            isLast: false,
            totalNavigable: 3,
            getNextIndex: jest.fn(() => 1),
            getPrevIndex: jest.fn(() => undefined),
        })),
    }),
)

const { useOpportunitiesNavigation } = jest.requireMock(
    'pages/aiAgent/opportunities/hooks/useOpportunitiesNavigation',
)

describe('OpportunitiesNavigation', () => {
    const mockSelectCertainOpportunity = jest.fn()
    const mockGetNextIndex = jest.fn(() => 1)
    const mockGetPrevIndex = jest.fn(() => undefined as number | undefined)

    const mockOpportunities: Opportunity[] = [
        {
            id: '1',
            key: 'ai_1',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            resources: [
                {
                    title: 'First Opportunity',
                    content: 'First content',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                },
            ],
        },
        {
            id: '2',
            key: 'ai_2',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            resources: [
                {
                    title: 'Second Opportunity',
                    content: 'Second content',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                },
            ],
        },
        {
            id: '3',
            key: 'ai_3',
            type: OpportunityType.RESOLVE_CONFLICT,
            resources: [
                {
                    title: 'Third Opportunity',
                    content: 'Third content',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                },
            ],
        },
    ]

    const defaultProps = {
        selectedOpportunity: mockOpportunities[0],
        opportunities: mockOpportunities,
        selectCertainOpportunity: mockSelectCertainOpportunity,
        totalCount: mockOpportunities.length,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockGetNextIndex.mockReturnValue(1)
        mockGetPrevIndex.mockReturnValue(undefined)
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: false,
            totalNavigable: 3,
            getNextIndex: mockGetNextIndex,
            getPrevIndex: mockGetPrevIndex,
        })
    })

    it('renders navigation buttons and position counter', () => {
        render(<OpportunitiesNavigation {...defaultProps} />)

        const buttons = screen.getAllByRole('button')
        expect(buttons).toHaveLength(2)
        expect(buttons[0]).toBeInTheDocument() // backward button
        expect(buttons[1]).toBeInTheDocument() // forward button
        expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })

    it('displays correct position counter text', () => {
        useOpportunitiesNavigation.mockReturnValue({
            position: 1,
            isFirst: false,
            isLast: false,
            totalNavigable: 3,
            getNextIndex: mockGetNextIndex,
            getPrevIndex: mockGetPrevIndex,
        })

        render(<OpportunitiesNavigation {...defaultProps} />)

        expect(screen.getByText('2 of 3')).toBeInTheDocument()
    })

    it('disables backward button when on first opportunity', () => {
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: false,
            totalNavigable: 3,
            getNextIndex: mockGetNextIndex,
            getPrevIndex: mockGetPrevIndex,
        })

        render(<OpportunitiesNavigation {...defaultProps} />)

        const buttons = screen.getAllByRole('button')
        const backwardButton = buttons[0]
        const forwardButton = buttons[1]

        expect(backwardButton).toHaveAttribute('aria-disabled', 'true')
        expect(forwardButton).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('disables forward button when on last opportunity', () => {
        useOpportunitiesNavigation.mockReturnValue({
            position: 2,
            isFirst: false,
            isLast: true,
            totalNavigable: 3,
            getNextIndex: mockGetNextIndex,
            getPrevIndex: mockGetPrevIndex,
        })

        render(<OpportunitiesNavigation {...defaultProps} />)

        const buttons = screen.getAllByRole('button')
        const backwardButton = buttons[0]
        const forwardButton = buttons[1]

        expect(backwardButton).not.toHaveAttribute('aria-disabled', 'true')
        expect(forwardButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('disables both buttons when there is only one opportunity', () => {
        const singleOpportunity = [mockOpportunities[0]]
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: true,
            totalNavigable: 1,
            getNextIndex: jest.fn(() => undefined),
            getPrevIndex: jest.fn(() => undefined),
        })

        render(
            <OpportunitiesNavigation
                {...defaultProps}
                opportunities={singleOpportunity}
                totalCount={1}
            />,
        )

        const buttons = screen.getAllByRole('button')
        const backwardButton = buttons[0]
        const forwardButton = buttons[1]

        expect(backwardButton).toHaveAttribute('aria-disabled', 'true')
        expect(forwardButton).toHaveAttribute('aria-disabled', 'true')
        expect(screen.getByText('1 of 1')).toBeInTheDocument()
    })

    it('calls selectCertainOpportunity with correct index when forward button is clicked', async () => {
        const user = userEvent.setup()
        mockGetNextIndex.mockReturnValue(1)
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: false,
            totalNavigable: 3,
            getNextIndex: mockGetNextIndex,
            getPrevIndex: mockGetPrevIndex,
        })

        render(<OpportunitiesNavigation {...defaultProps} />)

        const buttons = screen.getAllByRole('button')
        const forwardButton = buttons[1]

        await user.click(forwardButton)

        expect(mockSelectCertainOpportunity).toHaveBeenCalledWith(1)
    })

    it('calls selectCertainOpportunity with correct index when backward button is clicked', async () => {
        const user = userEvent.setup()
        mockGetPrevIndex.mockReturnValue(0)
        useOpportunitiesNavigation.mockReturnValue({
            position: 1,
            isFirst: false,
            isLast: false,
            totalNavigable: 3,
            getNextIndex: mockGetNextIndex,
            getPrevIndex: mockGetPrevIndex,
        })

        render(<OpportunitiesNavigation {...defaultProps} />)

        const buttons = screen.getAllByRole('button')
        const backwardButton = buttons[0]

        await user.click(backwardButton)

        expect(mockSelectCertainOpportunity).toHaveBeenCalledWith(0)
    })

    it('does not call selectCertainOpportunity when selectCertainOpportunity prop is undefined', async () => {
        const user = userEvent.setup()
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: false,
            totalNavigable: 3,
            getNextIndex: mockGetNextIndex,
            getPrevIndex: mockGetPrevIndex,
        })

        render(
            <OpportunitiesNavigation
                {...defaultProps}
                selectCertainOpportunity={undefined}
            />,
        )

        const buttons = screen.getAllByRole('button')
        const forwardButton = buttons[1]

        await user.click(forwardButton)

        expect(mockSelectCertainOpportunity).not.toHaveBeenCalled()
    })

    it('handles empty opportunities array', () => {
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: true,
            totalNavigable: 0,
            getNextIndex: jest.fn(() => undefined),
            getPrevIndex: jest.fn(() => undefined),
        })

        const { container } = render(
            <OpportunitiesNavigation
                {...defaultProps}
                opportunities={[]}
                selectedOpportunity={null}
            />,
        )
        expect(container.firstChild).toBeNull()
    })

    it('passes correct props to useOpportunitiesNavigation hook', () => {
        render(<OpportunitiesNavigation {...defaultProps} />)

        expect(useOpportunitiesNavigation).toHaveBeenCalledWith({
            selectedOpportunity: mockOpportunities[0],
            opportunities: mockOpportunities,
            allowedOpportunityIds: undefined,
        })
    })

    it('passes empty array to hook when opportunities is undefined', () => {
        render(
            <OpportunitiesNavigation
                selectedOpportunity={mockOpportunities[0]}
                opportunities={undefined}
                selectCertainOpportunity={mockSelectCertainOpportunity}
                totalCount={0}
            />,
        )

        expect(useOpportunitiesNavigation).toHaveBeenCalledWith({
            selectedOpportunity: mockOpportunities[0],
            opportunities: [],
            allowedOpportunityIds: undefined,
        })
    })

    it('passes allowedOpportunityIds to hook when provided', () => {
        const allowedIds = [1, 3]
        render(
            <OpportunitiesNavigation
                {...defaultProps}
                allowedOpportunityIds={allowedIds}
            />,
        )

        expect(useOpportunitiesNavigation).toHaveBeenCalledWith({
            selectedOpportunity: mockOpportunities[0],
            opportunities: mockOpportunities,
            allowedOpportunityIds: allowedIds,
        })
    })

    it('displays total count when allowedOpportunityIds is provided', () => {
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: false,
            totalNavigable: 2,
            getNextIndex: mockGetNextIndex,
            getPrevIndex: mockGetPrevIndex,
        })

        render(
            <OpportunitiesNavigation
                {...defaultProps}
                allowedOpportunityIds={[1, 3]}
            />,
        )

        expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })

    it('renders navigation icons correctly', () => {
        render(<OpportunitiesNavigation {...defaultProps} />)

        const buttons = screen.getAllByRole('button')
        const backwardButton = buttons[0] // first button is backward
        const forwardButton = buttons[1] // second button is forward

        // Check that buttons contain icon elements (could be i, svg, or other elements)
        const backwardIcon = backwardButton.querySelector('i, svg, [data-icon]')
        const forwardIcon = forwardButton.querySelector('i, svg, [data-icon]')

        expect(backwardIcon).toBeInTheDocument()
        expect(forwardIcon).toBeInTheDocument()

        // Check that buttons have proper accessible names from the icons
        expect(backwardButton).toHaveAccessibleName('arrow-chevron-left')
        expect(forwardButton).toHaveAccessibleName('arrow-chevron-right')
    })

    it('shows count text when hideCount is false or not provided', () => {
        render(<OpportunitiesNavigation {...defaultProps} />)

        expect(screen.getByText('1 of 3')).toBeInTheDocument()
    })

    it('hides count text when hideCount is true', () => {
        render(<OpportunitiesNavigation {...defaultProps} hideCount={true} />)

        expect(screen.queryByText('1 of 3')).not.toBeInTheDocument()
        expect(screen.getAllByRole('button')).toHaveLength(2)
    })
})
