import { useCallback, useState } from 'react'

import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import type { EnrichedTicket } from '@repo/tickets'
import { TicketTimelineWidget } from '@repo/tickets'
import { useParams } from 'react-router-dom'

import { useGetTicket } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useGetCustomer } from 'models/customer/queries'
import type { Customer } from 'models/customer/types'
import { TicketTimelineSidePanelPreview } from 'tickets/ticket-timeline/components/TicketTimelineSidePanelPreview'
import { TICKET_FETCHED_LIMIT } from 'tickets/ticket-timeline/constants'
import { useTicketList } from 'timeline/hooks/useTicketList'

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
    const { onChangeTab, onToggle, isExpanded } = useTicketInfobarNavigation()

    // Get customer ID from the current ticket
    const { data: currentTicketData } = useGetTicket(ticketId!, undefined, {
        query: {
            enabled: ticketId !== undefined,
        },
    })
    const shopperId = currentTicketData?.data?.customer?.id
    const { tickets, isLoading: isLoadingTickets } = useTicketList(shopperId)

    const { data: customFieldDefinitionsData } = useCustomFieldDefinitions({
        object_type: OBJECT_TYPES.TICKET,
        archived: false,
        limit: 100,
    })

    const customFieldDefinitions = customFieldDefinitionsData?.data || []

    const {
        displayedTickets,
        allEnrichedTickets,
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

    const [selectedTicket, setSelectedTicket] = useState<EnrichedTicket | null>(
        null,
    )
    const [isOpen, setIsOpen] = useState(false)

    const currentIndex = selectedTicket
        ? allEnrichedTickets.findIndex(
              (e) => e.ticket.id === selectedTicket.ticket.id,
          )
        : -1
    const isFirstTicket = currentIndex <= 0
    const isLastTicket =
        currentIndex >= allEnrichedTickets.length - 1 || currentIndex === -1

    const handleToggleTimeline = () => {
        // Switch to Timeline tab first
        onChangeTab(TicketInfobarTab.Timeline)

        // Then expand infobar if it's collapsed
        if (!isExpanded) {
            onToggle()
        }
    }

    const handleSelectTicket = useCallback((enrichedTicket: EnrichedTicket) => {
        setSelectedTicket(enrichedTicket)
        setIsOpen(true)
    }, [])

    const handleNext = useCallback(() => {
        if (currentIndex < allEnrichedTickets.length - 1) {
            setSelectedTicket(allEnrichedTickets[currentIndex + 1])
        }
    }, [currentIndex, allEnrichedTickets])

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setSelectedTicket(allEnrichedTickets[currentIndex - 1])
        }
    }, [currentIndex, allEnrichedTickets])

    return (
        <>
            <div className={css.container}>
                <TicketTimelineWidget
                    tickets={displayedTickets}
                    totalNumber={totalNumber}
                    openTicketsNumber={openTicketsNumber}
                    snoozedTicketsNumber={snoozedTicketsNumber}
                    isLoading={isLoadingTickets}
                    customerName={customerName}
                    onToggleTimeline={handleToggleTimeline}
                    onSelectTicket={handleSelectTicket}
                    fetchLimit={TICKET_FETCHED_LIMIT}
                />
            </div>
            <TicketTimelineSidePanelPreview
                enrichedTicket={selectedTicket}
                isOpen={isOpen}
                onOpenChange={setIsOpen}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isFirstTicket={isFirstTicket}
                isLastTicket={isLastTicket}
            />
        </>
    )
}
