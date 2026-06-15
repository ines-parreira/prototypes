import { screen } from '@testing-library/react'

import { getCurrentUserHandler } from '../../../../../../../tests/getCurrentUser.mock'
import { render } from '../../../../../../../tests/render.utils'
import { server } from '../../../../../../../tests/server'
import { TicketThreadItemTag } from '../../../../../../../thread/itemTags'
import type { TicketThreadAuditLogEventByType } from '../../../../../../types'
import { TicketThreadAuditLogTicketSlaPolicyAssignedEvent } from '../TicketThreadAuditLogTicketSlaPolicyAssignedEvent'

function buildItem(
    eventData: TicketThreadAuditLogEventByType<'ticket-sla-policy-assigned'>['data']['data'],
): TicketThreadAuditLogEventByType<'ticket-sla-policy-assigned'> {
    return {
        _tag: TicketThreadItemTag.Events.AuditLogEvent,
        type: 'ticket-sla-policy-assigned',
        datetime: '2024-03-21T11:00:00Z',
        meta: { attribution: 'none' },
        data: {
            object_type: 'Ticket',
            type: 'ticket-sla-policy-assigned',
            user_id: 42,
            created_datetime: '2024-03-21T11:00:00Z',
            data: eventData,
        },
    }
}

function renderItem(
    item: TicketThreadAuditLogEventByType<'ticket-sla-policy-assigned'>,
) {
    return render(
        <TicketThreadAuditLogTicketSlaPolicyAssignedEvent item={item} />,
    )
}

describe('TicketThreadAuditLogTicketSlaPolicyAssignedEvent', () => {
    beforeEach(() => {
        server.use(getCurrentUserHandler().handler)
    })

    it('renders the policy name as a link to settings when uuid and name are present', () => {
        renderItem(
            buildItem({
                sla_policy_uuid: 'abc-123',
                sla_policy_name: 'Standard SLA',
            }),
        )

        const link = screen.getByRole('link', { name: 'Standard SLA' })
        expect(link).toHaveAttribute('href', '/app/settings/sla/abc-123')
        expect(link).toHaveAttribute('target', '_blank')
        expect(screen.getByText(/" assigned/)).toBeInTheDocument()
    })

    it('renders the policy name as plain text when uuid is missing', () => {
        renderItem(
            buildItem({
                sla_policy_name: 'Standard SLA',
            }),
        )

        expect(screen.getByText(/Standard SLA/)).toBeInTheDocument()
        expect(
            screen.queryByRole('link', { name: 'Standard SLA' }),
        ).not.toBeInTheDocument()
    })

    it('renders nothing for the policy name when both uuid and name are missing', () => {
        renderItem(buildItem({}))

        expect(screen.queryByRole('link')).not.toBeInTheDocument()
        expect(screen.getByText(/SLA Policy/)).toBeInTheDocument()
    })

    it('renders the datetime', () => {
        renderItem(
            buildItem({
                sla_policy_uuid: 'abc-123',
                sla_policy_name: 'Standard SLA',
            }),
        )

        expect(screen.getByText('03/21/2024')).toBeInTheDocument()
    })
})
