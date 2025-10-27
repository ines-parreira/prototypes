import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from 'pages/aiAgent/opportunities/enums'
import { Opportunity } from 'pages/aiAgent/opportunities/utils/mapAiArticlesToOpportunities'

import { OpportunitiesNavigation } from './OpportunitiesNavigation'

// Mock the hook
jest.mock(
    'pages/aiAgent/opportunities/hooks/useOpportunitiesNavigation',
    () => ({
        useOpportunitiesNavigation: jest.fn(() => ({
            position: 0,
            isFirst: true,
            isLast: false,
        })),
    }),
)

const { useOpportunitiesNavigation } = jest.requireMock(
    'pages/aiAgent/opportunities/hooks/useOpportunitiesNavigation',
)

describe('OpportunitiesNavigation', () => {
    const mockSelectCertainOpportunity = jest.fn()

    const mockOpportunities: Opportunity[] = [
        {
            id: '1',
            key: 'ai_1',
            title: 'First Opportunity',
            content: 'First content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        },
        {
            id: '2',
            key: 'ai_2',
            title: 'Second Opportunity',
            content: 'Second content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        },
        {
            id: '3',
            key: 'ai_3',
            title: 'Third Opportunity',
            content: 'Third content',
            type: OpportunityType.RESOLVE_CONFLICT,
        },
    ]

    const defaultProps = {
        selectedOpportunity: mockOpportunities[0],
        opportunities: mockOpportunities,
        selectCertainOpportunity: mockSelectCertainOpportunity,
        totalCount: mockOpportunities.length,
    }

    beforeEach(() => {
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: false,
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
        })

        render(<OpportunitiesNavigation {...defaultProps} />)

        expect(screen.getByText('2 of 3')).toBeInTheDocument()
    })

    it('disables backward button when on first opportunity', () => {
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: false,
        })

        render(<OpportunitiesNavigation {...defaultProps} />)

        const buttons = screen.getAllByRole('button')
        const backwardButton = buttons[0] // first button is backward
        const forwardButton = buttons[1] // second button is forward

        expect(backwardButton).toHaveAttribute('aria-disabled', 'true')
        expect(forwardButton).not.toHaveAttribute('aria-disabled', 'true')
    })

    it('disables forward button when on last opportunity', () => {
        useOpportunitiesNavigation.mockReturnValue({
            position: 2,
            isFirst: false,
            isLast: true,
        })

        render(<OpportunitiesNavigation {...defaultProps} />)

        const buttons = screen.getAllByRole('button')
        const backwardButton = buttons[0] // first button is backward
        const forwardButton = buttons[1] // second button is forward

        expect(backwardButton).not.toHaveAttribute('aria-disabled', 'true')
        expect(forwardButton).toHaveAttribute('aria-disabled', 'true')
    })

    it('disables both buttons when there is only one opportunity', () => {
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: true,
        })

        render(
            <OpportunitiesNavigation
                {...defaultProps}
                opportunities={[mockOpportunities[0]]}
                totalCount={1}
            />,
        )

        const buttons = screen.getAllByRole('button')
        const backwardButton = buttons[0] // first button is backward
        const forwardButton = buttons[1] // second button is forward

        expect(backwardButton).toHaveAttribute('aria-disabled', 'true')
        expect(forwardButton).toHaveAttribute('aria-disabled', 'true')
        expect(screen.getByText('1 of 1')).toBeInTheDocument()
    })

    it('calls selectCertainOpportunity with next position when forward button is clicked', async () => {
        const user = userEvent.setup()
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: false,
        })

        render(<OpportunitiesNavigation {...defaultProps} />)

        const buttons = screen.getAllByRole('button')
        const forwardButton = buttons[1] // second button is forward

        await user.click(forwardButton)

        expect(mockSelectCertainOpportunity).toHaveBeenCalledWith(1)
    })

    it('calls selectCertainOpportunity with previous position when backward button is clicked', async () => {
        const user = userEvent.setup()
        useOpportunitiesNavigation.mockReturnValue({
            position: 1,
            isFirst: false,
            isLast: false,
        })

        render(<OpportunitiesNavigation {...defaultProps} />)

        const buttons = screen.getAllByRole('button')
        const backwardButton = buttons[0] // first button is backward

        await user.click(backwardButton)

        expect(mockSelectCertainOpportunity).toHaveBeenCalledWith(0)
    })

    it('does not call selectCertainOpportunity when selectCertainOpportunity prop is undefined', async () => {
        const user = userEvent.setup()
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: false,
        })

        render(
            <OpportunitiesNavigation
                {...defaultProps}
                selectCertainOpportunity={undefined}
            />,
        )

        const buttons = screen.getAllByRole('button')
        const forwardButton = buttons[1] // second button is forward

        await user.click(forwardButton)

        expect(mockSelectCertainOpportunity).not.toHaveBeenCalled()
    })

    it('handles empty opportunities array', () => {
        useOpportunitiesNavigation.mockReturnValue({
            position: 0,
            isFirst: true,
            isLast: true,
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
        })
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
        expect(backwardButton).toHaveAccessibleName('arrow-chevron-up')
        expect(forwardButton).toHaveAccessibleName('arrow-chevron-down')
    })
})
