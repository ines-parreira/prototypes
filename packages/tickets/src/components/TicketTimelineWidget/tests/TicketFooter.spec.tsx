import { render, screen } from '@testing-library/react'

import { Color } from '@gorgias/axiom'

import { TicketFooter } from '../TicketFooter'

describe('TicketFooter', () => {
    const defaultProps = {
        status: 'open' as const,
        isSnoozed: false,
        messagesCount: 1,
    }

    describe('Status tag colors', () => {
        it('should render grey tag for closed tickets', () => {
            render(
                <TicketFooter
                    {...defaultProps}
                    status="closed"
                    isSnoozed={false}
                />,
            )

            const tag = screen.getByText('Closed')
            expect(tag).toBeInTheDocument()
            expect(tag.closest('[class*="tag"]')).toHaveAttribute(
                'data-color',
                Color.Grey,
            )
        })

        it('should render blue tag for snoozed tickets', () => {
            render(
                <TicketFooter
                    {...defaultProps}
                    status="open"
                    isSnoozed={true}
                />,
            )

            const tag = screen.getByText('Snoozed')
            expect(tag).toBeInTheDocument()
            expect(tag.closest('[class*="tag"]')).toHaveAttribute(
                'data-color',
                Color.Blue,
            )
        })

        it('should render purple tag for open tickets', () => {
            render(
                <TicketFooter
                    {...defaultProps}
                    status="open"
                    isSnoozed={false}
                />,
            )

            const tag = screen.getByText('Open')
            expect(tag).toBeInTheDocument()
            expect(tag.closest('[class*="tag"]')).toHaveAttribute(
                'data-color',
                Color.Purple,
            )
        })

        it('should prioritize snoozed status over closed status', () => {
            render(
                <TicketFooter
                    {...defaultProps}
                    status="closed"
                    isSnoozed={true}
                />,
            )

            const tag = screen.getByText('Snoozed')
            expect(tag).toBeInTheDocument()
            expect(tag.closest('[class*="tag"]')).toHaveAttribute(
                'data-color',
                Color.Blue,
            )
        })
    })

    describe('Assignee display', () => {
        it('should display assignee name when provided', () => {
            render(
                <TicketFooter
                    {...defaultProps}
                    assignee={
                        {
                            id: 1,
                            name: 'John Doe',
                            email: 'john@example.com',
                        } as any
                    }
                />,
            )

            expect(screen.getByText('John Doe')).toBeInTheDocument()
        })

        it('should display "Unassigned" when no assignee is provided', () => {
            render(<TicketFooter {...defaultProps} assignee={undefined} />)

            expect(screen.getByText('Unassigned')).toBeInTheDocument()
        })
    })

    describe('Messages count', () => {
        it('should display singular "message" for 1 message', () => {
            render(<TicketFooter {...defaultProps} messagesCount={1} />)

            expect(screen.getByText('1 message')).toBeInTheDocument()
        })

        it('should display plural "messages" for multiple messages', () => {
            render(<TicketFooter {...defaultProps} messagesCount={5} />)

            expect(screen.getByText('5 messages')).toBeInTheDocument()
        })

        it('should display singular "message" for 0 messages', () => {
            render(<TicketFooter {...defaultProps} messagesCount={0} />)

            expect(screen.getByText('0 message')).toBeInTheDocument()
        })
    })
})
