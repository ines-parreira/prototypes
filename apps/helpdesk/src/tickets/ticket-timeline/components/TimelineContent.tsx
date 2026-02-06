import { useCallback, useState } from 'react'

import type { EnrichedTicket } from '@repo/tickets'

import { Box } from '@gorgias/axiom'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useGetCustomer } from 'models/customer/queries'
import { extractOrders } from 'timeline/helpers/orders'
import { useTicketList } from 'timeline/hooks/useTicketList'

import { useOrderProducts } from '../hooks/useOrderProducts'
import { useTimelineData } from '../hooks/useTimelineData'
import type { ChannelToIconFn } from '../hooks/useTimelineData'
import { TicketTimelineSidePanelPreview } from './TicketTimelineSidePanelPreview'
import { TimelineFilters } from './TimelineFilters'
import { TimelineHeader } from './TimelineHeader'
import { TimelineList } from './TimelineList'

import css from './TicketTimeline.less'

type Props = {
    shopperId: number
    activeTicketId: string
    channelToCommunicationIcon: ChannelToIconFn
}

export function TimelineContent({
    shopperId,
    activeTicketId,
    channelToCommunicationIcon,
}: Props) {
    const { tickets, isLoading: isLoadingTickets } = useTicketList(shopperId)

    const { data: customerData } = useGetCustomer(shopperId, {
        enabled: !!shopperId,
    })

    const customer = customerData?.data
    const orders = customer ? extractOrders(customer) : []

    const { data: customFieldDefinitionsData } = useCustomFieldDefinitions({
        object_type: OBJECT_TYPES.TICKET,
        archived: false,
        limit: 100,
    })

    const customFieldDefinitions = customFieldDefinitionsData?.data || []

    const {
        timelineItems,
        enrichedTickets,
        totalNumber,
        isLoading: isLoadingConditions,
        rangeFilter,
        setRangeFilter,
        setInteractionTypeFilters,
        selectedStatusKeys,
        selectedTypeKeys,
        toggleSelectedStatus,
        sortOption,
        setSortOption,
    } = useTimelineData({
        tickets,
        orders,
        customFieldDefinitions,
        channelToIcon: channelToCommunicationIcon,
    })

    const isLoading = isLoadingTickets || isLoadingConditions

    const { products: productsMap } = useOrderProducts(customer, orders)

    const [selectedTicket, setSelectedTicket] = useState<EnrichedTicket | null>(
        null,
    )
    const [isOpen, setIsOpen] = useState(false)

    const currentIndex = selectedTicket
        ? enrichedTickets.findIndex(
              (e) => e.ticket.id === selectedTicket.ticket.id,
          )
        : -1
    const isFirstTicket = currentIndex <= 0
    const isLastTicket =
        currentIndex >= enrichedTickets.length - 1 || currentIndex === -1

    const handleSelect = useCallback((enriched: EnrichedTicket) => {
        setSelectedTicket(enriched)
        setIsOpen(true)
    }, [])

    const handleNext = useCallback(() => {
        if (currentIndex < enrichedTickets.length - 1) {
            setSelectedTicket(enrichedTickets[currentIndex + 1])
        }
    }, [currentIndex, enrichedTickets])

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setSelectedTicket(enrichedTickets[currentIndex - 1])
        }
    }, [currentIndex, enrichedTickets])

    return (
        <Box flexDirection="column" height={'100%'}>
            <Box
                paddingLeft="md"
                paddingRight="md"
                paddingTop="md"
                paddingBottom="xs"
                flexDirection="column"
            >
                <TimelineHeader
                    firstName={customer?.firstname}
                    lastName={customer?.lastname}
                />
                <TimelineFilters
                    setInteractionTypeFilters={setInteractionTypeFilters}
                    setRangeFilter={setRangeFilter}
                    toggleSelectedStatus={toggleSelectedStatus}
                    selectedTypeKeys={selectedTypeKeys}
                    selectedStatusKeys={selectedStatusKeys}
                    rangeFilter={rangeFilter}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                />
            </Box>
            <div className={css.scrollableContent}>
                <TimelineList
                    timelineItems={timelineItems}
                    enrichedTickets={enrichedTickets}
                    isLoading={isLoading}
                    totalNumber={totalNumber}
                    productsMap={productsMap}
                    activeTicketId={activeTicketId}
                    onSelect={handleSelect}
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
        </Box>
    )
}
