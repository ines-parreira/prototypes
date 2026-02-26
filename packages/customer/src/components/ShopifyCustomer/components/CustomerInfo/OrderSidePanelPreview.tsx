import { useCallback } from 'react'

import type {
    FinancialStatusValue,
    FulfillmentStatusValue,
    OrderCardProduct,
} from '@repo/ecommerce/shopify/types'
import {
    getFinancialStatusInfo,
    getFulfillmentStatusInfo,
} from '@repo/ecommerce/shopify/utils'

import {
    Box,
    Button,
    Heading,
    Icon,
    OverlayContent,
    SidePanel,
    Tag,
} from '@gorgias/axiom'

import { OrderActions } from './OrderActions'
import { OrderDetailsSection } from './OrderDetailsSection'

type OrderData = {
    id: number | string
    name: string
    financial_status: FinancialStatusValue
    fulfillment_status: FulfillmentStatusValue | null
    tags?: string
    note?: string
    created_at?: string
    order_status_url?: string
    invoice_url?: string
}

type Props<T extends OrderData = OrderData> = {
    order: T | null
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    productsMap?: Map<number, OrderCardProduct>
    isDraftOrder?: boolean
    onDuplicate?: (order: T) => void
    onRefund?: (order: T) => void
    onCancel?: (order: T) => void
    storeName?: string
    integrationId?: number
    ticketId?: string
}

export function OrderSidePanelPreview<T extends OrderData = OrderData>({
    order,
    isOpen,
    onOpenChange,
    isDraftOrder,
    onDuplicate,
    onRefund,
    onCancel,
    storeName,
    integrationId,
    ticketId,
}: Props<T>) {
    const handleClose = useCallback(() => {
        onOpenChange(false)
    }, [onOpenChange])

    const handleDuplicate = useCallback(() => {
        if (order && onDuplicate) {
            onDuplicate(order)
        }
    }, [order, onDuplicate])

    const handleRefund = useCallback(() => {
        if (order && onRefund) {
            onRefund(order)
        }
    }, [order, onRefund])

    const handleCancel = useCallback(() => {
        if (order && onCancel) {
            onCancel(order)
        }
    }, [order, onCancel])

    if (!order) return null

    const { label: financialLabel, color: financialColor } =
        getFinancialStatusInfo(order.financial_status)

    const { label: fulfillmentLabel, color: fulfillmentColor } =
        getFulfillmentStatusInfo(order.fulfillment_status)

    return (
        <SidePanel
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            size="md"
            withoutOverlay
            withoutPadding
        >
            <OverlayContent>
                <Box
                    flexDirection="column"
                    paddingTop={'md'}
                    paddingLeft={'lg'}
                    paddingRight={'lg'}
                    flex={1}
                >
                    <Box
                        flexDirection="row"
                        alignItems="center"
                        gap="xxxs"
                        marginBottom={'xxs'}
                    >
                        <Box flexShrink={0}>
                            <Icon
                                name="vendor-shopify-colored"
                                size="lg"
                                intent="regular"
                            />
                        </Box>

                        <Box flex={1} minWidth={0} alignItems="center" gap="xs">
                            <Heading size="lg" overflow="ellipsis">
                                Order {order.name}
                            </Heading>
                            <Box gap="xxxs">
                                <Tag color={financialColor}>
                                    {financialLabel}
                                </Tag>
                                <Tag color={fulfillmentColor}>
                                    {fulfillmentLabel}
                                </Tag>
                            </Box>
                        </Box>

                        <Box
                            flexDirection="row"
                            alignItems="center"
                            gap="xxxs"
                            flexShrink={0}
                        >
                            <Button
                                as="button"
                                icon="close"
                                intent="regular"
                                size="sm"
                                variant="tertiary"
                                onClick={handleClose}
                                aria-label="Close preview"
                            />
                        </Box>
                    </Box>

                    {!isDraftOrder && (
                        <OrderActions
                            onDuplicate={handleDuplicate}
                            onRefund={handleRefund}
                            onCancel={handleCancel}
                        />
                    )}

                    <OrderDetailsSection
                        order={order}
                        isDraftOrder={isDraftOrder}
                        integrationId={integrationId}
                        ticketId={ticketId}
                        storeName={storeName}
                    />
                </Box>
            </OverlayContent>
        </SidePanel>
    )
}
