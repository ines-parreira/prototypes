import { Link } from 'react-router-dom'

import { Icon, Text } from '@gorgias/axiom'

import { TicketThreadAuditLogEventAttribution } from '#events/components/TicketThreadEventItem/components/TicketThreadAuditLogEventAttribution'
import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import type { TicketThreadAuditLogEventByType } from '#events/types'

type TicketThreadAuditLogCustomerUpdatedEventProps = {
    item: TicketThreadAuditLogEventByType<'ticket-customer-updated'>
}
export function TicketThreadAuditLogCustomerUpdatedEvent({
    item,
}: TicketThreadAuditLogCustomerUpdatedEventProps) {
    const event = item.data
    const oldCustomer = event.data?.old_customer
    const newCustomer = event.data?.new_customer

    return (
        <TicketThreadEventContainer>
            <Icon name="user" />
            <Text size="sm">
                {oldCustomer && newCustomer ? (
                    <>
                        Customer changed from{' '}
                        <Link to={`/app/customer/${oldCustomer.id}`}>
                            {oldCustomer.name || `Customer #${oldCustomer.id}`}
                        </Link>{' '}
                        to{' '}
                        <Link to={`/app/customer/${newCustomer.id}`}>
                            {newCustomer.name || `Customer #${newCustomer.id}`}
                        </Link>
                    </>
                ) : (
                    'Customer updated'
                )}
            </Text>
            <TicketThreadAuditLogEventAttribution
                attribution={item.meta.attribution}
                authorId={event.user_id}
            />
            {event.created_datetime && (
                <TicketThreadEventDateTime datetime={event.created_datetime} />
            )}
        </TicketThreadEventContainer>
    )
}
