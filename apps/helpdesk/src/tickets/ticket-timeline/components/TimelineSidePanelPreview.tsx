import { useCallback } from 'react'

import { OrderSidePanelContent } from '@repo/customer'
import type { OrderData } from '@repo/customer'
import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'
import type { EnrichedTicket } from '@repo/tickets'
import { useHistory } from 'react-router-dom'

import { Box, Button, Icon, OverlayFooter, SidePanel } from '@gorgias/axiom'

import { ErrorBoundary } from 'pages/ErrorBoundary'
import { TicketModalProvider } from 'timeline/ticket-modal/components/TicketModalProvider'

import { SidePanelTicketDetail } from './SidePanelTicketDetail'

import css from './TicketTimelineSidePanelPreview.less'

type Props<T extends OrderData = OrderData> = {
    enrichedTicket: EnrichedTicket | null
    selectedOrder: T | null
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    hasPrevious: boolean
    hasNext: boolean
    onNext: () => void
    onPrevious: () => void
    productsMap?: Map<number, OrderCardProduct>
    storeName?: string
    integrationId?: number
    ticketId?: string
    onDuplicate?: (order: T) => void
    onRefund?: (order: T) => void
    onCancel?: (order: T) => void
}

export function TimelineSidePanelPreview<T extends OrderData = OrderData>({
    enrichedTicket,
    selectedOrder,
    isOpen,
    onOpenChange,
    hasPrevious,
    hasNext,
    onNext,
    onPrevious,
    productsMap,
    storeName,
    integrationId,
    ticketId,
    onDuplicate,
    onRefund,
    onCancel,
}: Props<T>) {
    const history = useHistory()

    const handleClose = useCallback(() => {
        onOpenChange(false)
    }, [onOpenChange])

    const handleExpand = useCallback(() => {
        if (!enrichedTicket) return
        handleClose()
        history.push(`/app/ticket/${enrichedTicket.ticket.id}`)
    }, [enrichedTicket, handleClose, history])

    return (
        <SidePanel
            isOpen={isOpen && (!!enrichedTicket || !!selectedOrder)}
            onOpenChange={onOpenChange}
            size="md"
            withoutOverlay
            withoutPadding
        >
            {enrichedTicket && (
                <ErrorBoundary>
                    <TicketModalProvider isInsideSidePanel>
                        <SidePanelTicketDetail
                            ticket={enrichedTicket.ticket}
                            customFields={enrichedTicket.customFields}
                            iconName={enrichedTicket.iconName}
                            conditionsLoading={enrichedTicket.conditionsLoading}
                            onExpand={handleExpand}
                            additionalHeaderActions={
                                <Button
                                    as="button"
                                    icon="close"
                                    intent="regular"
                                    size="sm"
                                    variant="tertiary"
                                    onClick={handleClose}
                                    aria-label="Close preview"
                                />
                            }
                        />
                    </TicketModalProvider>
                </ErrorBoundary>
            )}
            {selectedOrder && (
                <OrderSidePanelContent
                    order={selectedOrder}
                    onClose={handleClose}
                    productsMap={productsMap}
                    storeName={storeName}
                    integrationId={integrationId}
                    ticketId={ticketId}
                    onDuplicate={onDuplicate}
                    onRefund={onRefund}
                    onCancel={onCancel}
                />
            )}
            <OverlayFooter hideCancelButton>
                <div className={css.footer}>
                    <Box gap="xxxs" padding="lg">
                        <Button
                            variant="secondary"
                            isDisabled={!hasPrevious}
                            onClick={onPrevious}
                            aria-label={
                                enrichedTicket
                                    ? 'Previous ticket'
                                    : 'Previous order'
                            }
                        >
                            <Icon name="arrow-chevron-left" />
                        </Button>
                        <Button
                            variant="secondary"
                            isDisabled={!hasNext}
                            onClick={onNext}
                            aria-label={
                                enrichedTicket ? 'Next ticket' : 'Next order'
                            }
                        >
                            <Icon name="arrow-chevron-right" />
                        </Button>
                    </Box>
                </div>
            </OverlayFooter>
        </SidePanel>
    )
}
