import React from 'react'

import { render, screen } from '@testing-library/react'

import { TicketChannel, TicketStatus } from 'business/types/ticket'
import { LegacyDrillDownTicketDetailsCell } from 'domains/reporting/pages/common/drill-down/LegacyDrillDownTicketDetailsCell'

describe('<LegacyDrillDownTicketDetailsCell />', () => {
    const subject = 'Ticket subject'
    const ticketDetails = {
        id: 1,
        channel: TicketChannel.Chat,
        subject,
        description: 'Ticket description',
        isRead: true,
        created: '2023-01-31T00:00',
        contactReason: 'some reason',
        status: TicketStatus.Closed,
    }

    it('should render cell', () => {
        render(
            <LegacyDrillDownTicketDetailsCell ticketDetails={ticketDetails} />,
        )

        expect(screen.getByText(subject)).toBeInTheDocument()
    })

    it('should render with highlight class name when unread', () => {
        const { container } = render(
            <LegacyDrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    isRead: false,
                }}
            />,
        )

        expect(container.firstChild).toHaveClass('highlighted')
    })

    it('should not render with highlight class name when read', () => {
        const { container } = render(
            <LegacyDrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    isRead: true,
                }}
            />,
        )

        expect(container.firstChild).not.toHaveClass('highlighted')
    })

    it('should not render with highlight class name when ticket status is null', () => {
        const { container } = render(
            <LegacyDrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    isRead: false,
                    status: null,
                }}
            />,
        )

        expect(container.firstChild).not.toHaveClass('highlighted')
    })

    it('should render with subject fallback when missing', () => {
        render(
            <LegacyDrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    subject: null,
                }}
            />,
        )

        expect(
            screen.getByText(`Ticket ${ticketDetails.id}`),
        ).toBeInTheDocument()
    })

    it('should render ticket icon when status is not null and channel exists', () => {
        const { container } = render(
            <LegacyDrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    channel: TicketChannel.Email,
                    status: TicketStatus.Open,
                }}
            />,
        )

        expect(container.querySelector('.material-icons')).toBeInTheDocument()
    })

    it('should render NullTicketIcon when status is null', () => {
        const { container } = render(
            <LegacyDrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    status: null,
                }}
            />,
        )

        expect(container.querySelector('.material-icons')).toHaveTextContent(
            'delete',
        )
    })

    it('should render placeholder when channel is missing but status exists', () => {
        render(
            <LegacyDrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    channel: null,
                    status: TicketStatus.Closed,
                }}
            />,
        )

        expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should render description when provided', () => {
        const description = 'This is a ticket description'
        render(
            <LegacyDrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    description,
                }}
            />,
        )

        expect(screen.getByText(description)).toBeInTheDocument()
    })

    it('should pass through bodyCellProps', () => {
        const { container } = render(
            <LegacyDrillDownTicketDetailsCell
                ticketDetails={ticketDetails}
                bodyCellProps={{
                    width: 500,
                    className: 'custom-class',
                }}
            />,
        )

        const bodyCell = container.firstChild as HTMLElement
        expect(bodyCell).toHaveClass('custom-class')
        expect(bodyCell).toHaveAttribute('width', '500')
    })

    it('should merge bodyCellProps className with highlighted class', () => {
        const { container } = render(
            <LegacyDrillDownTicketDetailsCell
                ticketDetails={{
                    ...ticketDetails,
                    isRead: false,
                }}
                bodyCellProps={{
                    className: 'custom-class',
                }}
            />,
        )

        const bodyCell = container.firstChild as HTMLElement
        expect(bodyCell).toHaveClass('custom-class')
        expect(bodyCell).toHaveClass('highlighted')
    })
})
