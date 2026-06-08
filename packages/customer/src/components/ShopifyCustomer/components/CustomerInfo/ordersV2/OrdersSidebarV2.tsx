import { useCallback, useMemo, useState } from 'react'

import { OrderRow } from './OrderRow'
import { OrdersEmptyState } from './OrdersEmptyState'
import { OrdersSectionHeader } from './OrdersSectionHeader'
import type { OrdersSidebarV2Props, OrdersV2Order } from './types'

import css from './OrdersSidebarV2.less'

export function OrdersSidebarV2({
    orders,
    draftOrders,
    isLoadingOrders,
    isLoadingDraftOrders,
    productsMap,
    storeName,
    integrationId,
    ticketId,
    customerId,
    selectedExternalId,
    onCreateOrder,
    renderEditShippingAddressModal,
}: OrdersSidebarV2Props) {
    // Merge regular + draft orders into one list, newest first.
    const mergedOrders = useMemo<OrdersV2Order[]>(() => {
        const merged: OrdersV2Order[] = [
            ...(orders ?? []).map((eco) => ({
                eco,
                data: eco.data,
                isDraft: false,
            })),
            ...(draftOrders ?? []).map((eco) => ({
                eco,
                data: eco.data,
                isDraft: true,
            })),
        ]

        return merged.sort((a, b) => {
            const ta = new Date(a.data.created_at).getTime()
            const tb = new Date(b.data.created_at).getTime()
            if (Number.isNaN(ta) && Number.isNaN(tb)) return 0
            if (Number.isNaN(ta)) return 1
            if (Number.isNaN(tb)) return -1
            return tb - ta
        })
    }, [orders, draftOrders])

    // Which rows are expanded — all collapsed by default; multiple may be open.
    const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())

    const toggleRow = useCallback((id: string) => {
        setExpandedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }, [])

    if (isLoadingOrders || isLoadingDraftOrders) {
        return null
    }

    if (mergedOrders.length === 0) {
        return (
            <>
                <div className={css.widgetSpacer} />
                <OrdersEmptyState />
            </>
        )
    }

    return (
        <>
            <div className={css.widgetSpacer} />
            <OrdersSectionHeader
                count={mergedOrders.length}
                onCreateOrder={onCreateOrder}
            />
            {mergedOrders.map((order) => (
                <OrderRow
                    key={order.eco.id}
                    order={order}
                    isExpanded={expandedIds.has(order.eco.id)}
                    onToggle={() => toggleRow(order.eco.id)}
                    productsMap={productsMap}
                    storeName={storeName}
                    integrationId={integrationId}
                    ticketId={ticketId}
                    ticketCustomerId={customerId}
                    customerExternalId={selectedExternalId}
                    renderEditShippingAddressModal={
                        renderEditShippingAddressModal
                    }
                />
            ))}
        </>
    )
}
