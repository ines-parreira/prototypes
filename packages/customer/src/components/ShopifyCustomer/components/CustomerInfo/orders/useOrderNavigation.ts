import { useCallback, useMemo, useState } from 'react'

import type { DateFormatType, TimeFormatType } from '@repo/utils'

import type { OrderEcommerceData, ShopperData } from '../../../types'
import type { OrderFieldRenderContext } from '../types'

type Params = {
    orders: OrderEcommerceData[] | undefined
    draftOrders: OrderEcommerceData[] | undefined
    selectedIntegrationId: number | undefined
    selectedIntegrationName: string | undefined
    shopper: { data: ShopperData } | undefined
    onCreateOrder?: (integrationId: number, shopperData: ShopperData) => void
    ticketId?: string
    dateFormat: DateFormatType
    timeFormat: TimeFormatType
}

export function useOrderNavigation({
    orders,
    draftOrders,
    selectedIntegrationId,
    selectedIntegrationName,
    shopper,
    onCreateOrder,
    ticketId,
    dateFormat,
    timeFormat,
}: Params) {
    const allOrders = useMemo(
        () => [...(orders ?? []), ...(draftOrders ?? [])],
        [orders, draftOrders],
    )

    const [selectedOrderIndex, setSelectedOrderIndex] = useState<number | null>(
        null,
    )

    const ordersListIndex = useMemo(() => {
        if (selectedOrderIndex === null) return undefined
        const ordersLength = orders?.length ?? 0
        if (selectedOrderIndex < ordersLength)
            return selectedOrderIndex.toString()
        return undefined
    }, [selectedOrderIndex, orders?.length])

    const selectedOrder =
        selectedOrderIndex !== null
            ? (allOrders[selectedOrderIndex] ?? null)
            : null

    const isDraftOrder =
        draftOrders?.some((order) => order.id === selectedOrder?.id) ?? false

    const handleSelectOrder = useCallback(
        (order: OrderEcommerceData) => {
            const index = allOrders.findIndex((o) => o.id === order.id)
            setSelectedOrderIndex(index !== -1 ? index : null)
        },
        [allOrders],
    )

    const handleNavigatePrevious = useCallback(() => {
        setSelectedOrderIndex((prev) =>
            prev !== null && prev > 0 ? prev - 1 : prev,
        )
    }, [])

    const handleNavigateNext = useCallback(() => {
        setSelectedOrderIndex((prev) =>
            prev !== null && prev < allOrders.length - 1 ? prev + 1 : prev,
        )
    }, [allOrders.length])

    const handleCreateOrder = useCallback(() => {
        if (selectedIntegrationId && shopper?.data && onCreateOrder) {
            onCreateOrder(selectedIntegrationId, shopper.data)
        }
    }, [selectedIntegrationId, shopper?.data, onCreateOrder])

    const hasPrevious = selectedOrderIndex !== null && selectedOrderIndex > 0
    const hasNext =
        selectedOrderIndex !== null && selectedOrderIndex < allOrders.length - 1

    const firstOrder = allOrders[0]?.data
    const orderContext: OrderFieldRenderContext = {
        order: firstOrder ?? { id: '' },
        isDraftOrder: firstOrder
            ? draftOrders?.some((o) => o.data.id === firstOrder.id)
            : undefined,
        integrationId: selectedIntegrationId,
        ticketId,
        storeName: selectedIntegrationName,
        dateFormat,
        timeFormat,
    }

    return {
        allOrders,
        selectedOrderIndex,
        setSelectedOrderIndex,
        selectedOrder,
        isDraftOrder,
        ordersListIndex,
        handleSelectOrder,
        handleNavigatePrevious,
        handleNavigateNext,
        handleCreateOrder,
        hasPrevious,
        hasNext,
        orderContext,
    }
}
