import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import { OpportunityCard } from './OpportunityCard'

describe('OpportunityCard', () => {
    const defaultProps = {
        title: 'Test Opportunity',
        onSelect: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render title', () => {
        render(<OpportunityCard {...defaultProps} />)

        expect(screen.getByText('Test Opportunity')).toBeInTheDocument()
    })

    it('should render Fill knowledge gap type by default', () => {
        render(<OpportunityCard {...defaultProps} />)

        expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()
    })

    it('should render Resolve conflict type', () => {
        render(
            <OpportunityCard
                {...defaultProps}
                type={OpportunityType.RESOLVE_CONFLICT}
            />,
        )

        expect(screen.getByText('Resolve conflict')).toBeInTheDocument()
    })

    it('should render ticket count', () => {
        render(<OpportunityCard {...defaultProps} ticketCount={5} />)

        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should call onSelect when clicked', async () => {
        const user = userEvent.setup()
        const onSelect = jest.fn()
        render(<OpportunityCard {...defaultProps} onSelect={onSelect} />)

        await act(() => user.click(screen.getByText('Test Opportunity')))

        expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('should not call onSelect when restricted', async () => {
        const user = userEvent.setup()
        const onSelect = jest.fn()
        render(
            <OpportunityCard
                {...defaultProps}
                onSelect={onSelect}
                isRestricted
            />,
        )

        await act(() => user.click(screen.getByText('Test Opportunity')))

        expect(onSelect).not.toHaveBeenCalled()
    })

    it('should wrap info section in tooltip when restricted', async () => {
        const user = userEvent.setup()
        const { container } = render(
            <OpportunityCard {...defaultProps} isRestricted />,
        )

        expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()

        const card = container.querySelector('[aria-disabled="true"]')!
        await user.hover(card)

        expect(
            await screen.findByText(/Upgrade to access all/),
        ).toBeInTheDocument()
    })

    it('should have aria-disabled attribute when restricted', () => {
        const { container } = render(
            <OpportunityCard {...defaultProps} isRestricted />,
        )

        expect(
            container.querySelector('[aria-disabled="true"]'),
        ).toBeInTheDocument()
    })

    it('should not have aria-disabled when not restricted', () => {
        const { container } = render(<OpportunityCard {...defaultProps} />)

        expect(
            container.querySelector('[aria-disabled="true"]'),
        ).not.toBeInTheDocument()
    })
})
