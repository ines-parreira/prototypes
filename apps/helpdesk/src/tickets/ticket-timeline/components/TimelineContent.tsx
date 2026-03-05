import { useCallback, useMemo, useState } from 'react'

import { ShopifyCustomerProvider } from '@repo/customer'
import type { EnrichedTicket } from '@repo/tickets'

import { Box } from '@gorgias/axiom'
import { useGetIntegration } from '@gorgias/helpdesk-queries'

import type { Order } from 'constants/integrations/types/shopify'
import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { useNotify } from 'hooks/useNotify'
import { useGetCustomer } from 'models/customer/queries'
import { extractOrders } from 'timeline/helpers/orders'
import { TimelineItemKind } from 'timeline/types'

import { useOrderProducts } from '../hooks/useOrderProducts'
import { useTicketList } from '../hooks/useTicketList'
import { useTimelineData } from '../hooks/useTimelineData'
import type { ChannelToIconFn } from '../hooks/useTimelineData'
import { TimelineFilters } from './TimelineFilters'
import { TimelineHeader } from './TimelineHeader'
import { TimelineList } from './TimelineList'
import { TimelineSidePanelPreview } from './TimelineSidePanelPreview'

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
    const {
        tickets,
        isLoading: isLoadingTickets,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useTicketList(shopperId)

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

    const { notify: dispatchNotification } = useNotify()

    const [selectedTicket, setSelectedTicket] = useState<EnrichedTicket | null>(
        null,
    )
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const selectedOrderIntegrationId = useMemo(() => {
        if (!selectedOrder || !customer?.integrations) return undefined
        const entry = Object.entries(customer.integrations).find(
            ([, integration]) =>
                integration.orders?.some((o) => o.id === selectedOrder.id),
        )
        return entry ? parseInt(entry[0], 10) : undefined
    }, [selectedOrder, customer?.integrations])

    const { data: selectedOrderIntegrationData } = useGetIntegration(
        selectedOrderIntegrationId ?? 0,
        { query: { enabled: !!selectedOrderIntegrationId } },
    )

    const selectedItemIndex = useMemo(() => {
        if (selectedTicket) {
            return timelineItems.findIndex(
                (item) =>
                    item.kind === TimelineItemKind.Ticket &&
                    item.ticket.id === selectedTicket.ticket.id,
            )
        }
        if (selectedOrder) {
            return timelineItems.findIndex(
                (item) =>
                    item.kind === TimelineItemKind.Order &&
                    item.order.id === selectedOrder.id,
            )
        }
        return -1
    }, [selectedTicket, selectedOrder, timelineItems])

    const hasPrevious = selectedItemIndex > 0
    const hasNext =
        selectedItemIndex !== -1 && selectedItemIndex < timelineItems.length - 1

    const navigateToItem = useCallback(
        (index: number) => {
            const item = timelineItems[index]
            if (!item) return

            if (item.kind === TimelineItemKind.Ticket) {
                const enriched = enrichedTickets.find(
                    (e) => e.ticket.id === item.ticket.id,
                )
                if (enriched) {
                    setSelectedTicket(enriched)
                    setSelectedOrder(null)
                }
            } else {
                setSelectedOrder(item.order)
                setSelectedTicket(null)
            }
        },
        [timelineItems, enrichedTickets],
    )

    const handleSelectTicket = useCallback((enriched: EnrichedTicket) => {
        setSelectedTicket(enriched)
        setSelectedOrder(null)
        setIsOpen(true)
    }, [])

    const handleSelectOrder = useCallback((order: Order) => {
        setSelectedOrder(order)
        setSelectedTicket(null)
        setIsOpen(true)
    }, [])

    const handleDuplicateOrder = useCallback((order: Order) => {
        // TODO: to be implemented in the follow-up PR
        console.warn('Duplicate order:', order.name)
    }, [])

    const handleRefundOrder = useCallback((order: Order) => {
        // TODO: to be implemented in the follow-up PR
        console.warn('Refund order:', order.name)
    }, [])

    const handleCancelOrder = useCallback((order: Order) => {
        // TODO: to be implemented in the follow-up PR
        console.warn('Cancel order:', order.name)
    }, [])

    const handleNext = useCallback(() => {
        if (hasNext) {
            navigateToItem(selectedItemIndex + 1)
        }
    }, [hasNext, selectedItemIndex, navigateToItem])

    const handlePrevious = useCallback(() => {
        if (hasPrevious) {
            navigateToItem(selectedItemIndex - 1)
        }
    }, [hasPrevious, selectedItemIndex, navigateToItem])

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
                    onSelectTicket={handleSelectTicket}
                    onSelectOrder={handleSelectOrder}
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                />
            </div>
            <ShopifyCustomerProvider
                dispatchNotification={dispatchNotification}
            >
                <TimelineSidePanelPreview
                    enrichedTicket={selectedTicket}
                    selectedOrder={selectedOrder}
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                    hasPrevious={hasPrevious}
                    hasNext={hasNext}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                    productsMap={productsMap}
                    storeName={selectedOrderIntegrationData?.data.name}
                    integrationId={selectedOrderIntegrationId}
                    ticketId={activeTicketId}
                    onDuplicate={handleDuplicateOrder}
                    onRefund={handleRefundOrder}
                    onCancel={handleCancelOrder}
                />
            </ShopifyCustomerProvider>
        </Box>
    )
}
