import { TicketTimelineWidget } from '@repo/tickets'
import { useParams } from 'react-router-dom'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useGetCustomer } from 'models/customer/queries'
import type { Customer } from 'models/customer/types'
import { useTicketList } from 'timeline/hooks/useTicketList'
import { useTimelinePanel } from 'timeline/hooks/useTimelinePanel'

import { channelToCommunicationIcon } from './channelToCommunicationIcon'
import { useTicketTimelineData } from './useTicketTimelineData'

import css from './TicketTimelineWidgetContainer.less'

function getCustomerName(
    customer:
        | Pick<Customer, 'name' | 'firstname' | 'lastname' | 'email'>
        | null
        | undefined,
): string | undefined {
    if (!customer) return undefined
    return customer.name || customer.firstname
}

export function TicketTimelineWidgetContainer() {
    const { ticketId: activeTicketId } = useParams<{ ticketId?: string }>()
    const ticketId = activeTicketId ? Number(activeTicketId) : undefined

    // Get customer ID from the current ticket
    const { data: currentTicketData } = useGetTicket(ticketId!, undefined, {
        query: {
            enabled: ticketId !== undefined,
        },
    })
    const shopperId = currentTicketData?.data?.customer?.id
    const { tickets, isLoading: isLoadingTickets } = useTicketList(shopperId)
    const {
        isOpen: isTimelineOpen,
        openTimeline,
        closeTimeline,
    } = useTimelinePanel()

    const handleToggleTimeline = () => {
        if (!shopperId) return

        if (isTimelineOpen) {
            closeTimeline()
        } else {
            openTimeline(shopperId)
        }
    }

    const { data: customFieldDefinitionsData } = useCustomFieldDefinitions({
        object_type: OBJECT_TYPES.TICKET,
        archived: false,
        limit: 100,
    })

    const customFieldDefinitions = customFieldDefinitionsData?.data || []

    const {
        displayedTickets,
        totalNumber,
        openTicketsNumber,
        snoozedTicketsNumber,
    } = useTicketTimelineData({
        tickets,
        customFieldDefinitions,
        activeTicketId,
        channelToIcon: channelToCommunicationIcon,
    })

    const { data: customerData } = useGetCustomer(shopperId ?? 0, {
        enabled: totalNumber === 1 && !!shopperId,
    })

    const customerName =
        totalNumber === 1 ? getCustomerName(customerData?.data) : undefined

    return (
        <div className={css.container}>
            <TicketTimelineWidget
                tickets={displayedTickets}
                totalNumber={totalNumber}
                openTicketsNumber={openTicketsNumber}
                snoozedTicketsNumber={snoozedTicketsNumber}
                isLoading={isLoadingTickets}
                customerName={customerName}
                isTimelineOpen={isTimelineOpen}
                onToggleTimeline={handleToggleTimeline}
            />
        </div>
    )
}
