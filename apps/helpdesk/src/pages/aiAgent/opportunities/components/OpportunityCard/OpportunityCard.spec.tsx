import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import { OpportunityCard } from './OpportunityCard'

describe('OpportunityCard', () => {
    const defaultProps = {
        title: 'Test Title',
        ticketCount: 12,
    }

    it('should render with title', () => {
        render(<OpportunityCard {...defaultProps} />)

        expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('should render info text', () => {
        render(<OpportunityCard {...defaultProps} />)

        expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()
    })

    it('should render info icon', () => {
        render(<OpportunityCard {...defaultProps} />)

        expect(screen.getByLabelText('nav-map')).toBeInTheDocument()
    })

    it('should apply selected styles when selected prop is true', () => {
        const { container } = render(
            <OpportunityCard {...defaultProps} selected={true} />,
        )

        const card = container.firstChild
        expect(card).toHaveClass('cardSelected')
    })

    it('should call onSelect when clicked', async () => {
        const onSelect = jest.fn()
        const user = userEvent.setup()
        const { container } = render(
            <OpportunityCard {...defaultProps} onSelect={onSelect} />,
        )

        const card = container.firstChild as HTMLElement
        await act(() => user.click(card))

        expect(onSelect).toHaveBeenCalledTimes(1)
    })

    it('should apply hover styles on mouse enter', async () => {
        const user = userEvent.setup()
        const { container } = render(<OpportunityCard {...defaultProps} />)

        const card = container.firstChild as HTMLElement

        await act(async () => {
            await user.hover(card)
        })

        await waitFor(() => {
            expect(card).toHaveClass('cardHovered')
        })
    })

    it('should remove hover styles on mouse leave', async () => {
        const user = userEvent.setup()
        const { container } = render(<OpportunityCard {...defaultProps} />)

        const card = container.firstChild as HTMLElement

        await act(async () => {
            await user.hover(card)
        })

        await waitFor(() => {
            expect(card).toHaveClass('cardHovered')
        })

        await act(async () => {
            await user.unhover(card)
        })

        await waitFor(() => {
            expect(card).not.toHaveClass('cardHovered')
        })
    })

    it('should apply both selected and hover styles when selected and hovered', async () => {
        const user = userEvent.setup()
        const { container } = render(
            <OpportunityCard {...defaultProps} selected={true} />,
        )

        const card = container.firstChild as HTMLElement

        await act(async () => {
            await user.hover(card)
        })

        await waitFor(() => {
            expect(card).toHaveClass('cardSelectedHovered')
        })
    })

    it('should render with FILL_KNOWLEDGE_GAP info type by default', () => {
        render(<OpportunityCard {...defaultProps} />)

        expect(screen.getByText('Fill knowledge gap')).toBeInTheDocument()
        expect(screen.getByLabelText('nav-map')).toBeInTheDocument()
    })

    it('should render with RESOLVE_CONFLICT info type when specified', () => {
        render(
            <OpportunityCard
                {...defaultProps}
                type={OpportunityType.RESOLVE_CONFLICT}
            />,
        )

        expect(screen.getByText('Resolve conflict')).toBeInTheDocument()
        expect(screen.getByLabelText('octagon-error')).toBeInTheDocument()
    })

    it('should render title with tooltip when text overflows', () => {
        const longTitle =
            'This is a very long title that should show a tooltip when hovered'
        render(<OpportunityCard {...defaultProps} title={longTitle} />)

        const titleElement = screen.getByText(longTitle)
        expect(titleElement).toBeInTheDocument()
    })

    it('should render ticket count when provided', () => {
        render(<OpportunityCard {...defaultProps} ticketCount={12} />)

        expect(screen.getByText('12')).toBeInTheDocument()
    })

    it('should not render ticket count when not provided', () => {
        render(
            <OpportunityCard
                title="Test Title"
                type={OpportunityType.FILL_KNOWLEDGE_GAP}
            />,
        )

        expect(screen.queryByText('12')).not.toBeInTheDocument()
    })

    it('should render ticket count with tooltip showing related tickets text', () => {
        render(<OpportunityCard {...defaultProps} ticketCount={5} />)

        expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('should render singular "ticket" when ticketCount is 1', () => {
        render(<OpportunityCard {...defaultProps} ticketCount={1} />)

        expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should render plural "tickets" when ticketCount is greater than 1', () => {
        render(<OpportunityCard {...defaultProps} ticketCount={2} />)

        expect(screen.getByText('2')).toBeInTheDocument()
    })

    describe('restricted state', () => {
        it('should apply restricted styles when isRestricted is true', () => {
            const { container } = render(
                <OpportunityCard {...defaultProps} isRestricted={true} />,
            )

            const card = container.firstChild
            expect(card).toHaveClass('cardRestricted')
        })

        it('should have aria-disabled attribute when restricted', () => {
            const { container } = render(
                <OpportunityCard {...defaultProps} isRestricted={true} />,
            )

            const card = container.firstChild
            expect(card).toHaveAttribute('aria-disabled', 'true')
        })

        it('should not apply hover styles when restricted', async () => {
            const user = userEvent.setup()
            const { container } = render(
                <OpportunityCard {...defaultProps} isRestricted={true} />,
            )

            const card = container.firstChild as HTMLElement

            await act(async () => {
                await user.hover(card)
            })

            await waitFor(() => {
                expect(card).not.toHaveClass('cardHovered')
                expect(card).toHaveClass('cardRestricted')
            })
        })

        it('should not apply selected styles when restricted and selected', () => {
            const { container } = render(
                <OpportunityCard
                    {...defaultProps}
                    selected={true}
                    isRestricted={true}
                />,
            )

            const card = container.firstChild
            expect(card).not.toHaveClass('cardSelected')
            expect(card).toHaveClass('cardRestricted')
        })

        it('should not call onSelect when clicked while restricted', async () => {
            const onSelect = jest.fn()
            const user = userEvent.setup()
            const { container } = render(
                <OpportunityCard
                    {...defaultProps}
                    onSelect={onSelect}
                    isRestricted={true}
                />,
            )

            const card = container.firstChild as HTMLElement
            await act(() => user.click(card))

            expect(onSelect).not.toHaveBeenCalled()
        })

        it('should not apply selected+hover styles when restricted, selected and hovered', async () => {
            const user = userEvent.setup()
            const { container } = render(
                <OpportunityCard
                    {...defaultProps}
                    selected={true}
                    isRestricted={true}
                />,
            )

            const card = container.firstChild as HTMLElement

            await act(async () => {
                await user.hover(card)
            })

            await waitFor(() => {
                expect(card).not.toHaveClass('cardSelectedHovered')
                expect(card).toHaveClass('cardRestricted')
            })
        })
    })
})
