import { render } from '@repo/testing'

import { TicketRow } from './TicketRow'

describe('TicketRow', () => {
    it('renders the title, date, message count, and automated status', () => {
        const { getByText } = render(
            <TicketRow
                iconName="ticket-voucher"
                title="Where is my order?"
                date="2 hours ago"
                status="automated"
                messageCount={3}
            />,
        )
        expect(getByText('Where is my order?')).toBeInTheDocument()
        expect(getByText('2 hours ago')).toBeInTheDocument()
        expect(getByText('3 messages')).toBeInTheDocument()
        expect(getByText('Automated')).toBeInTheDocument()
    })

    it('singularizes one-message tickets', () => {
        const { getByText } = render(
            <TicketRow
                iconName="ticket-voucher"
                title="Refund request"
                date="Yesterday"
                status="handover"
                messageCount={1}
            />,
        )
        expect(getByText('1 message')).toBeInTheDocument()
        expect(getByText('Handover')).toBeInTheDocument()
    })
})
