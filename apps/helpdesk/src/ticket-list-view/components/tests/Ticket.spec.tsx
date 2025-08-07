import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { mockTicketTranslationCompact } from '@gorgias/helpdesk-mocks'

import { TicketPriority } from 'business/types/ticket'
import { useFlag } from 'core/flags'
import { Customer } from 'models/customer/types'
import useIsTicketViewed from 'ticket-list-view/hooks/useIsTicketViewed'
import { TicketCompact } from 'ticket-list-view/types'

import Ticket from '../Ticket'

jest.mock('core/flags', () => ({ useFlag: jest.fn() }))
const useFlagMock = assumeMock(useFlag)

jest.mock('ticket-list-view/hooks/useIsTicketViewed', () => jest.fn())
const useIsTicketViewedMock = useIsTicketViewed as jest.Mock

jest.mock('pages/tickets/common/components/PriorityLabel', () => ({
    PriorityLabel: jest.fn(({ priority }) => <div>priority: {priority}</div>),
}))

describe('Ticket', () => {
    const defaultTicket = {
        channel: 'email',
        customer: {
            id: 888,
            email: 'john.doe@gorgias.com',
            name: 'John Doe',
        },
        excerpt: 'Excerpt',
        id: 1,
        is_unread: false,
        last_message_datetime: '',
        subject: 'Subject',
        updated_datetime: '',
    } as TicketCompact

    const defaultProps = {
        isActive: false,
        ticket: defaultTicket,
        viewId: 1,
        onSelect: jest.fn(),
        isSelected: false,
    }

    beforeEach(() => {
        defaultProps.onSelect = jest.fn()

        useFlagMock.mockReturnValue(false)
        useIsTicketViewedMock.mockReturnValue({
            agentViewingMessage: '',
            isTicketViewed: false,
        })
    })

    it('should render a default ticket', () => {
        render(<Ticket {...defaultProps} />)
        expect(
            screen.getByText(defaultProps.ticket.customer!.name),
        ).toBeInTheDocument()
        expect(screen.getByText('email')).toBeInTheDocument()
        expect(
            screen.getByText(defaultProps.ticket.subject),
        ).toBeInTheDocument()
        expect(
            screen.getByText(defaultProps.ticket.excerpt!),
        ).toBeInTheDocument()
    })

    it('should link to a split ticket view url', () => {
        render(<Ticket {...defaultProps} />)
        const el = screen.getByText(defaultProps.ticket.subject).closest('a')
        expect(el).toHaveAttribute('to', '/app/views/1/1')
    })

    it('should link to a ticket view url if the flag is enabled', () => {
        useFlagMock.mockReturnValue(true)
        render(<Ticket {...defaultProps} />)
        const el = screen.getByText(defaultProps.ticket.subject).closest('a')
        expect(el).toHaveAttribute('to', '/app/tickets/1/1')
    })

    it('should render customer email', () => {
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    customer: {
                        ...defaultTicket.customer,
                        name: '',
                    } as Customer,
                }}
            />,
        )
        expect(
            screen.getByText(defaultProps.ticket.customer!.email!),
        ).toBeInTheDocument()
    })

    it('should render customer id', () => {
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    customer: {
                        ...defaultTicket.customer,
                        name: '',
                        email: '',
                    } as Customer,
                }}
            />,
        )
        expect(
            screen.getByText(`Customer #${defaultProps.ticket.customer!.id}`),
        ).toBeInTheDocument()
    })

    it('should handle unavailable informations on customer', () => {
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    customer: null,
                }}
            />,
        )
        expect(
            document.getElementsByClassName('customer')[0],
        ).toHaveTextContent('')
    })

    it('should select a ticket when the checkbox is clicked', async () => {
        const user = userEvent.setup()
        const onSelect = jest.fn()
        render(<Ticket {...defaultProps} onSelect={onSelect} />)

        await act(async () => {
            await user.click(screen.getByRole('checkbox'))
        })

        expect(onSelect).toHaveBeenCalledWith(1, true, false)
    })

    it('should render excerpt when there are no undelivered messages', () => {
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    last_sent_message_not_delivered: false,
                }}
            />,
        )
        expect(
            screen.getByText(defaultProps.ticket.excerpt!),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Last message not delivered'),
        ).not.toBeInTheDocument()
    })

    it('should render FailedMessageLabel when there are undelivered messages', () => {
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    last_sent_message_not_delivered: true,
                }}
            />,
        )
        expect(
            screen.getByText('Last message not delivered'),
        ).toBeInTheDocument()
        expect(
            screen.queryByText(defaultProps.ticket.excerpt!),
        ).not.toBeInTheDocument()
    })

    it('should render excerpt when last_sent_message_not_delivered is undefined', () => {
        render(
            <Ticket
                {...defaultProps}
                ticket={{
                    ...defaultTicket,
                    last_sent_message_not_delivered: undefined,
                }}
            />,
        )
        expect(
            screen.getByText(defaultProps.ticket.excerpt!),
        ).toBeInTheDocument()
        expect(
            screen.queryByText('Last message not delivered'),
        ).not.toBeInTheDocument()
    })

    describe('customer logic', () => {
        it('should render customer name when available', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={{
                        ...defaultTicket,
                        customer: {
                            id: 123,
                            name: 'John Smith',
                            email: 'john@example.com',
                        } as Customer,
                    }}
                />,
            )
            expect(screen.getByText('John Smith')).toBeInTheDocument()
        })

        it('should render customer email when name is not available', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={{
                        ...defaultTicket,
                        customer: {
                            id: 123,
                            name: '',
                            email: 'john@example.com',
                        } as Customer,
                    }}
                />,
            )
            expect(screen.getByText('john@example.com')).toBeInTheDocument()
        })

        it('should render customer id when name and email are not available', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={{
                        ...defaultTicket,
                        customer: {
                            id: 123,
                            name: '',
                            email: '',
                        } as Customer,
                    }}
                />,
            )
            expect(screen.getByText('Customer #123')).toBeInTheDocument()
        })

        it('should render empty string when customer is null', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={{
                        ...defaultTicket,
                        customer: null,
                    }}
                />,
            )
            expect(
                document.getElementsByClassName('customer')[0],
            ).toHaveTextContent('')
        })

        it('should render empty string when ticket has no channel property', () => {
            const ticketWithoutChannel = {
                id: 1,
                is_unread: false,
                subject: 'Subject',
                excerpt: 'Excerpt',
                customer: {
                    id: 123,
                    name: 'John Smith',
                    email: 'john@example.com',
                },
            }
            render(
                <Ticket
                    {...defaultProps}
                    ticket={ticketWithoutChannel as any}
                />,
            )
            // Should render skeleton since 'channel' is not present
            expect(screen.queryByText('John Smith')).not.toBeInTheDocument()
        })

        it('should render empty string when channel exists but customer is undefined', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={{
                        ...defaultTicket,
                        customer: null,
                    }}
                />,
            )
            expect(
                document.getElementsByClassName('customer')[0],
            ).toHaveTextContent('')
        })
    })

    describe('hasUndeliveredMessages logic', () => {
        it('should be true when last_sent_message_not_delivered is true', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={{
                        ...defaultTicket,
                        last_sent_message_not_delivered: true,
                    }}
                />,
            )
            expect(
                screen.getByText('Last message not delivered'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(defaultProps.ticket.excerpt!),
            ).not.toBeInTheDocument()
        })

        it('should be false when last_sent_message_not_delivered is false', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={{
                        ...defaultTicket,
                        last_sent_message_not_delivered: false,
                    }}
                />,
            )
            expect(
                screen.getByText(defaultProps.ticket.excerpt!),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Last message not delivered'),
            ).not.toBeInTheDocument()
        })

        it('should be falsy when last_sent_message_not_delivered is undefined', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={{
                        ...defaultTicket,
                        last_sent_message_not_delivered: undefined,
                    }}
                />,
            )
            expect(
                screen.getByText(defaultProps.ticket.excerpt!),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Last message not delivered'),
            ).not.toBeInTheDocument()
        })

        it('should be falsy when last_sent_message_not_delivered is not present', () => {
            const ticketWithoutProperty = {
                ...defaultTicket,
            }
            delete (ticketWithoutProperty as any)
                .last_sent_message_not_delivered

            render(<Ticket {...defaultProps} ticket={ticketWithoutProperty} />)
            expect(
                screen.getByText(defaultProps.ticket.excerpt!),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Last message not delivered'),
            ).not.toBeInTheDocument()
        })

        it('should be falsy when ticket is undefined (testing optional chaining)', () => {
            const ticketPartial = {
                id: 1,
                subject: 'Test Subject',
                excerpt: 'Test Excerpt',
            }

            render(<Ticket {...defaultProps} ticket={ticketPartial as any} />)
            expect(
                screen.queryByText('Last message not delivered'),
            ).not.toBeInTheDocument()
        })
    })

    describe('priority display', () => {
        const ticketWithPriority = (priority: TicketPriority) => ({
            ...defaultTicket,
            priority,
        })

        it('should display priority badge when feature flag is enabled and ticket has priority', () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === 'ticket-allow-priority-usage') return true
                return false
            })

            render(
                <Ticket
                    {...defaultProps}
                    ticket={ticketWithPriority(TicketPriority.High)}
                />,
            )

            expect(
                screen.getByText(`priority: ${TicketPriority.High}`),
            ).toBeInTheDocument()
        })

        it('should not display priority badge when feature flag is disabled', () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === 'ticket-allow-priority-usage') return false
                return false
            })

            render(
                <Ticket
                    {...defaultProps}
                    ticket={ticketWithPriority(TicketPriority.High)}
                />,
            )

            expect(
                screen.queryByText(`priority: ${TicketPriority.High}`),
            ).not.toBeInTheDocument()
        })

        it('should not display priority badge when feature flag is enabled but ticket has no priority', () => {
            useFlagMock.mockImplementation((flag) => {
                if (flag === 'ticket-allow-priority-usage') return true
                return false
            })

            render(
                <Ticket
                    {...defaultProps}
                    ticket={{
                        ...defaultTicket,
                        priority: undefined,
                    }}
                />,
            )

            // Check that no priority icons are displayed
            expect(
                screen.queryByText(`priority: ${TicketPriority.Low}`),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(`priority: ${TicketPriority.Normal}`),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(`priority: ${TicketPriority.High}`),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(`priority: ${TicketPriority.Critical}`),
            ).not.toBeInTheDocument()
        })
    })

    describe('translation behavior', () => {
        const ticketWithTranslation = {
            ...defaultTicket,
        }

        const mockTranslation = {
            ...mockTicketTranslationCompact(),
            subject: 'Translated Subject',
            excerpt: 'Translated Excerpt',
        }

        it('should display translated subject when translation.subject is provided', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={ticketWithTranslation}
                    translation={mockTranslation}
                />,
            )

            expect(screen.getByText('Translated Subject')).toBeInTheDocument()
            expect(
                screen.queryByText(defaultTicket.subject),
            ).not.toBeInTheDocument()
        })

        it('should display original subject when translation.subject is not provided', () => {
            render(<Ticket {...defaultProps} ticket={ticketWithTranslation} />)

            expect(screen.getByText(defaultTicket.subject)).toBeInTheDocument()
            expect(
                screen.queryByText('Translated Subject'),
            ).not.toBeInTheDocument()
        })

        it('should display translate icon when translation.subject is provided', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={ticketWithTranslation}
                    translation={mockTranslation}
                />,
            )

            expect(screen.getByText('translate')).toBeInTheDocument()
        })

        it('should not display translate icon when no translation prop is provided', () => {
            render(<Ticket {...defaultProps} ticket={ticketWithTranslation} />)

            expect(screen.queryByText('translate')).not.toBeInTheDocument()
        })

        it('should display translated excerpt when translation.excerpt is provided', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={ticketWithTranslation}
                    translation={mockTranslation}
                />,
            )

            expect(screen.getByText('Translated Excerpt')).toBeInTheDocument()
            expect(
                screen.queryByText(defaultTicket.excerpt!),
            ).not.toBeInTheDocument()
        })

        it('should display original excerpt when translation.excerpt is not provided', () => {
            render(<Ticket {...defaultProps} ticket={ticketWithTranslation} />)

            expect(screen.getByText(defaultTicket.excerpt!)).toBeInTheDocument()
            expect(
                screen.queryByText('Translated Excerpt'),
            ).not.toBeInTheDocument()
        })

        it('should display original excerpt when no translation prop is provided', () => {
            render(<Ticket {...defaultProps} ticket={ticketWithTranslation} />)

            expect(screen.getByText(defaultTicket.excerpt!)).toBeInTheDocument()
        })

        it('should display both translated subject and excerpt when both are provided', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={ticketWithTranslation}
                    translation={mockTranslation}
                />,
            )

            expect(screen.getByText('Translated Subject')).toBeInTheDocument()
            expect(screen.getByText('Translated Excerpt')).toBeInTheDocument()
            expect(screen.getByText('translate')).toBeInTheDocument()
            expect(
                screen.queryByText(defaultTicket.subject),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(defaultTicket.excerpt!),
            ).not.toBeInTheDocument()
        })

        it('should not display translated excerpt when there are undelivered messages', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={{
                        ...ticketWithTranslation,
                        last_sent_message_not_delivered: true,
                    }}
                    translation={mockTranslation}
                />,
            )

            expect(
                screen.getByText('Last message not delivered'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Translated Excerpt'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(defaultTicket.excerpt!),
            ).not.toBeInTheDocument()
        })

        it('should handle empty translation values gracefully', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={ticketWithTranslation}
                    translation={{
                        ...mockTicketTranslationCompact(),
                        subject: '',
                        excerpt: '',
                    }}
                />,
            )

            expect(screen.getByText(defaultTicket.subject)).toBeInTheDocument()
            expect(screen.getByText(defaultTicket.excerpt!)).toBeInTheDocument()
            expect(screen.queryByText('translate')).not.toBeInTheDocument()
        })

        it('should handle undefined translation values gracefully', () => {
            render(<Ticket {...defaultProps} ticket={ticketWithTranslation} />)

            expect(screen.getByText(defaultTicket.subject)).toBeInTheDocument()
            expect(screen.getByText(defaultTicket.excerpt!)).toBeInTheDocument()
            expect(screen.queryByText('translate')).not.toBeInTheDocument()
        })

        it('should use translated excerpt in tooltip when translation.excerpt is provided', () => {
            render(
                <Ticket
                    {...defaultProps}
                    ticket={ticketWithTranslation}
                    translation={mockTranslation}
                />,
            )

            const tooltip = screen.getByText('Translated Excerpt').parentElement
            expect(tooltip).toBeInTheDocument()
        })

        it('should use original excerpt in tooltip when translation.excerpt is not provided', () => {
            render(<Ticket {...defaultProps} ticket={ticketWithTranslation} />)

            const tooltip = screen.getByText(
                defaultTicket.excerpt!,
            ).parentElement
            expect(tooltip).toBeInTheDocument()
        })
    })
})
