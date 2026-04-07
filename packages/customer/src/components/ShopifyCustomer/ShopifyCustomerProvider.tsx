import type { ReactNode } from 'react'
import { useMemo } from 'react'

import type { ShopifyCustomerContextType } from './ShopifyCustomerContext'
import { ShopifyCustomerContext } from './ShopifyCustomerContext'

type Props = ShopifyCustomerContextType & {
    children: ReactNode
}

export function ShopifyCustomerProvider({
    onCreateOrder,
    onEditOrder,
    onDuplicateOrder,
    onRefundOrder,
    onCancelOrder,
    children,
}: Props) {
    const value = useMemo(
        () => ({
            onCreateOrder,
            onEditOrder,
            onDuplicateOrder,
            onRefundOrder,
            onCancelOrder,
        }),
        [
            onCreateOrder,
            onEditOrder,
            onDuplicateOrder,
            onRefundOrder,
            onCancelOrder,
        ],
    )

    return (
        <ShopifyCustomerContext.Provider value={value}>
            {children}
        </ShopifyCustomerContext.Provider>
    )
}
