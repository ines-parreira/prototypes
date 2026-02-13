import { useCallback } from 'react'

import type {
    FinancialStatusValue,
    FulfillmentStatusValue,
    OrderCardProduct,
} from '@repo/ecommerce'
import {
    getFinancialStatusInfo,
    getFulfillmentStatusInfo,
} from '@repo/ecommerce'

import {
    Box,
    Button,
    Heading,
    Icon,
    OverlayContent,
    SidePanel,
    Tag,
} from '@gorgias/axiom'

type OrderData = {
    name: string
    financial_status: FinancialStatusValue
    fulfillment_status: FulfillmentStatusValue | null
}

type Props<T extends OrderData = OrderData> = {
    order: T | null
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    productsMap?: Map<number, OrderCardProduct>
    onDuplicate?: (order: T) => void
    onRefund?: (order: T) => void
    onCancel?: (order: T) => void
}

export function OrderSidePanelPreview<T extends OrderData = OrderData>({
    order,
    isOpen,
    onOpenChange,
    onDuplicate,
    onRefund,
    onCancel,
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
                                size="md"
                                intent="regular"
                            />
                        </Box>

                        <Box flex={1} minWidth={0}>
                            <Heading size="sm" overflow="ellipsis">
                                Order {order.name}
                            </Heading>
                        </Box>

                        <Box
                            flexDirection="row"
                            alignItems="center"
                            gap="xxxs"
                            flexShrink={0}
                        >
                            <Tag color={financialColor}>{financialLabel}</Tag>
                            <Tag color={fulfillmentColor}>
                                {fulfillmentLabel}
                            </Tag>

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

                    <Box
                        flexDirection="row"
                        alignItems="center"
                        gap="xs"
                        paddingTop="xs"
                    >
                        <Button
                            variant="secondary"
                            size="sm"
                            leadingSlot="select-multiple"
                            onClick={handleDuplicate}
                        >
                            Duplicate
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            leadingSlot="undo"
                            onClick={handleRefund}
                        >
                            Refund
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            leadingSlot="stop-sign"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </OverlayContent>
        </SidePanel>
    )
}
