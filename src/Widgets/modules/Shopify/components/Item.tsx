import React, { createContext, FunctionComponent, useContext } from 'react'

import { fromJS, List, Map } from 'immutable'

import { Badge } from '@gorgias/merchant-ui-kit'

import { StaticField } from 'Widgets/modules/Template/modules/Field'

import { OrderContext } from './Order'

const OrderItemContext = createContext<{
    refundedQuantity: number | null
}>({
    refundedQuantity: null,
})

const BeforeContent = () => {
    const { refundedQuantity } = useContext(OrderItemContext)

    if (!refundedQuantity) {
        return null
    }

    return (
        <StaticField label="Refunded">
            <Badge type={'warning'}>
                {refundedQuantity} item{refundedQuantity > 1 && 's'}
            </Badge>
        </StaticField>
    )
}

interface ItemCustomization {
    BeforeContent: React.FC
    Wrapper: React.FC<{ source: any; children: React.ReactNode }>
}

const Wrapper: FunctionComponent<{ source: Map<string, unknown> }> = ({
    source: item,
    children,
}) => {
    const { order } = useContext(OrderContext)
    const itemId = item.get('id') as number
    const refunds = order.get('refunds', fromJS([])) as List<any>

    const refundedQuantity = refunds
        .map((refund: Map<string, unknown>) => {
            // keep refund items information about current item
            return (
                refund.get('refund_line_items', fromJS([])) as List<any>
            ).filter(
                (lineItem: Map<string, number>) =>
                    lineItem.get('line_item_id').toString() ===
                    itemId.toString(),
            )
        })
        .filter((refundedItemInfo) =>
            typeof refundedItemInfo === 'undefined'
                ? false
                : !refundedItemInfo.isEmpty(),
        ) // remove falsey data
        .flatten(true) // flatten all those refund info in one List
        .reduce((total = 0, refund: Map<string, number>) => {
            // sum all refunded quantities
            return total + refund.get('quantity')
        }, 0)

    return (
        <OrderItemContext.Provider
            value={{
                refundedQuantity,
            }}
        >
            {children}
        </OrderItemContext.Provider>
    )
}

export const itemCustomization: ItemCustomization = {
    BeforeContent,
    Wrapper,
}
