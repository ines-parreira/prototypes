import { render, screen } from '@testing-library/react'

import { TicketPriority } from '@gorgias/helpdesk-types'

import { PriorityLabel } from '../PriorityLabel'

jest.mock('@gorgias/axiom', () => ({
    Badge: ({ children, className, type, ref }: any) => (
        <div
            data-testid="badge"
            className={className}
            data-type={type}
            ref={ref}
        >
            {children}
        </div>
    ),
    LegacyTooltip: ({ children, target }: any) => (
        <div data-testid="tooltip" data-target={target?.current}>
            {children}
        </div>
    ),
}))

jest.mock('../PriorityLabel.less', () => ({
    icon: 'icon-class',
    badge: 'badge-class',
    low: 'low-class',
    normal: 'normal-class',
    high: 'high-class',
    critical: 'critical-class',
}))

describe('PriorityLabel Component', () => {
    const renderPriorityLabel = (props: {
        priority: TicketPriority
        className?: string
        displayLabel?: boolean
        hasTooltip?: boolean
    }) => {
        return render(<PriorityLabel {...props} />)
    }

    describe('rendering with different priorities', () => {
        it.each([
            {
                priority: 'low' as TicketPriority,
                expectedType: 'light-grey',
                expectedText: 'low',
            },
            {
                priority: 'normal' as TicketPriority,
                expectedType: 'light-dark',
                expectedText: 'normal',
            },
            {
                priority: 'high' as TicketPriority,
                expectedType: 'light-warning',
                expectedText: 'high',
            },
            {
                priority: 'critical' as TicketPriority,
                expectedType: 'light-error',
                expectedText: 'critical',
            },
        ])(
            'renders $priority priority correctly',
            ({ priority, expectedType, expectedText }) => {
                renderPriorityLabel({ priority })

                const badge = screen.getByTestId('badge')
                expect(badge).toBeInTheDocument()
                expect(badge).toHaveAttribute('data-type', expectedType)
                expect(screen.getByText(expectedText)).toBeInTheDocument()
            },
        )
    })

    describe('display label functionality', () => {
        it('shows priority label when displayLabel is true (default)', () => {
            renderPriorityLabel({ priority: 'high' })

            expect(screen.getByText('high')).toBeInTheDocument()
        })

        it('shows priority label when displayLabel is explicitly true', () => {
            renderPriorityLabel({ priority: 'critical', displayLabel: true })

            expect(screen.getByText('critical')).toBeInTheDocument()
        })

        it('hides priority label when displayLabel is false', () => {
            renderPriorityLabel({ priority: 'normal', displayLabel: false })

            expect(screen.queryByText('normal')).not.toBeInTheDocument()
        })
    })

    describe('className prop', () => {
        it('applies custom className to badge', () => {
            const customClass = 'custom-priority-class'
            renderPriorityLabel({ priority: 'low', className: customClass })

            const badge = screen.getByTestId('badge')
            expect(badge).toHaveClass(customClass)
        })

        it('applies badge class when displayLabel is false', () => {
            renderPriorityLabel({ priority: 'high', displayLabel: false })

            const badge = screen.getByTestId('badge')
            expect(badge).toHaveClass('badge-class')
        })

        it('does not apply badge class when displayLabel is true', () => {
            renderPriorityLabel({ priority: 'high', displayLabel: true })

            const badge = screen.getByTestId('badge')
            expect(badge).not.toHaveClass('badge-class')
        })

        it('combines custom className with badge class when displayLabel is false', () => {
            const customClass = 'custom-priority-class'
            renderPriorityLabel({
                priority: 'high',
                displayLabel: false,
                className: customClass,
            })

            const badge = screen.getByTestId('badge')
            expect(badge).toHaveClass('badge-class', customClass)
        })
    })

    describe('tooltip functionality', () => {
        it('does not render tooltip when hasTooltip is false (default)', () => {
            renderPriorityLabel({ priority: 'high' })

            expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
        })

        it('does not render tooltip when hasTooltip is explicitly false', () => {
            renderPriorityLabel({ priority: 'high', hasTooltip: false })

            expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument()
        })

        it('renders tooltip when hasTooltip is true', () => {
            renderPriorityLabel({ priority: 'critical', hasTooltip: true })

            const tooltip = screen.getByTestId('tooltip')
            expect(tooltip).toBeInTheDocument()
            expect(tooltip).toHaveTextContent('Priority: Critical')
        })

        it('renders tooltip with correct capitalized priority text', () => {
            renderPriorityLabel({ priority: 'high', hasTooltip: true })

            const tooltip = screen.getByTestId('tooltip')
            expect(tooltip).toHaveTextContent('Priority: High')
        })
    })

    describe('icon rendering', () => {
        it('renders icon with correct classes for each priority', () => {
            const { rerender } = renderPriorityLabel({ priority: 'low' })

            let icon = screen.getByTestId('badge').querySelector('i')
            expect(icon).toHaveClass('icon-class', 'low-class')

            rerender(<PriorityLabel priority="normal" />)
            icon = screen.getByTestId('badge').querySelector('i')
            expect(icon).toHaveClass('icon-class', 'normal-class')

            rerender(<PriorityLabel priority="high" />)
            icon = screen.getByTestId('badge').querySelector('i')
            expect(icon).toHaveClass('icon-class', 'high-class')

            rerender(<PriorityLabel priority="critical" />)
            icon = screen.getByTestId('badge').querySelector('i')
            expect(icon).toHaveClass('icon-class', 'critical-class')
        })
    })

    describe('fallback behavior', () => {
        it('uses modern type when priority is not in PRIORITY_TO_BADGE mapping', () => {
            // Mock a priority that doesn't exist in the mapping
            const invalidPriority = 'invalid' as TicketPriority
            renderPriorityLabel({ priority: invalidPriority })

            const badge = screen.getByTestId('badge')
            expect(badge).toHaveAttribute('data-type', 'modern')
        })
    })

    describe('accessibility', () => {
        it('renders with proper structure for screen readers', () => {
            renderPriorityLabel({ priority: 'high' })

            const badge = screen.getByTestId('badge')
            const icon = badge.querySelector('i')
            const text = screen.getByText('high')

            expect(badge).toBeInTheDocument()
            expect(icon).toBeInTheDocument()
            expect(text).toBeInTheDocument()
        })

        it('renders with tooltip for better accessibility when hasTooltip is true', () => {
            renderPriorityLabel({ priority: 'high', hasTooltip: true })

            const badge = screen.getByTestId('badge')
            const tooltip = screen.getByTestId('tooltip')

            expect(badge).toBeInTheDocument()
            expect(tooltip).toBeInTheDocument()
            expect(tooltip).toHaveTextContent('Priority: High')
        })
    })
})
