import { useCallback } from 'react'
import type { ReactNode } from 'react'

import type { OrderCardProduct } from '@repo/ecommerce/shopify/types'

import { Box, Button, Icon, OverlayFooter, SidePanel } from '@gorgias/axiom'

import { OrderSidePanelContent } from './OrderSidePanelContent'
import type { OrderData } from './OrderSidePanelContent'
import type { EditShippingAddressModalRenderProps } from './ShippingAddressSection'

import css from './OrderSidePanelPreview.less'

export type { EditShippingAddressModalRenderProps }

type Props<T extends OrderData = OrderData> = {
    order: T | null
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    productsMap?: Map<number, OrderCardProduct>
    isDraftOrder?: boolean
    onEdit?: (order: T) => void
    onDuplicate?: (order: T) => void
    onRefund?: (order: T) => void
    onCancel?: (order: T) => void
    storeName?: string
    integrationId?: number
    ticketId?: string
    customerId?: string
    renderEditShippingAddressModal?: (
        props: EditShippingAddressModalRenderProps,
    ) => ReactNode
    hasPrevious?: boolean
    hasNext?: boolean
    onNavigatePrevious?: () => void
    onNavigateNext?: () => void
}

export function OrderSidePanelPreview<T extends OrderData = OrderData>({
    order,
    isOpen,
    onOpenChange,
    productsMap,
    isDraftOrder,
    onEdit,
    onDuplicate,
    onRefund,
    onCancel,
    storeName,
    integrationId,
    ticketId,
    customerId,
    renderEditShippingAddressModal,
    hasPrevious,
    hasNext,
    onNavigatePrevious,
    onNavigateNext,
}: Props<T>) {
    const handleClose = useCallback(() => {
        onOpenChange(false)
    }, [onOpenChange])

    if (!order) return null

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="md"
            withoutOverlay
            withoutPadding
        >
            <OrderSidePanelContent
                order={order}
                onClose={handleClose}
                productsMap={productsMap}
                isDraftOrder={isDraftOrder}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onRefund={onRefund}
                onCancel={onCancel}
                storeName={storeName}
                integrationId={integrationId}
                ticketId={ticketId}
                customerId={customerId}
                renderEditShippingAddressModal={renderEditShippingAddressModal}
            />

            {(onNavigatePrevious ||
                onNavigateNext ||
                order.order_status_url) && (
                <OverlayFooter hideCancelButton>
                    <div className={css.footer}>
                        {order.order_status_url && (
                            <Box mr="xs">
                                <Button
                                    as="a"
                                    href={order.order_status_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variant="secondary"
                                    trailingSlot={<Icon name="external-link" />}
                                >
                                    View Order
                                </Button>
                            </Box>
                        )}
                        {(onNavigatePrevious || onNavigateNext) && (
                            <Box gap="xs">
                                <Button
                                    variant="secondary"
                                    isDisabled={!hasPrevious}
                                    onClick={onNavigatePrevious}
                                    aria-label="Previous order"
                                >
                                    <Icon name="arrow-chevron-left" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    isDisabled={!hasNext}
                                    onClick={onNavigateNext}
                                    aria-label="Next order"
                                >
                                    <Icon name="arrow-chevron-right" />
                                </Button>
                            </Box>
                        )}
                    </div>
                </OverlayFooter>
            )}
        </SidePanel>
    )
}
