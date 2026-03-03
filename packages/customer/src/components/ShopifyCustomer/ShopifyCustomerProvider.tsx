import type { ReactNode } from 'react'
import { useMemo } from 'react'

import type { ShopifyCustomerContextType } from './ShopifyCustomerContext'
import { ShopifyCustomerContext } from './ShopifyCustomerContext'

type Props = ShopifyCustomerContextType & {
    children: ReactNode
}

export function ShopifyCustomerProvider({
    dispatchNotification,
    onCreateOrder,
    children,
}: Props) {
    const value = useMemo(
        () => ({ dispatchNotification, onCreateOrder }),
        [dispatchNotification, onCreateOrder],
    )

    return (
        <ShopifyCustomerContext.Provider value={value}>
            {children}
        </ShopifyCustomerContext.Provider>
    )
}
