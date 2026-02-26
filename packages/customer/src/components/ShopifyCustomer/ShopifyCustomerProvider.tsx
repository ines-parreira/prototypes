import type { ReactNode } from 'react'

import type { ShopifyCustomerContextType } from './ShopifyCustomerContext'
import { ShopifyCustomerContext } from './ShopifyCustomerContext'

type Props = ShopifyCustomerContextType & {
    children: ReactNode
}

export function ShopifyCustomerProvider({
    dispatchNotification,
    children,
}: Props) {
    return (
        <ShopifyCustomerContext.Provider value={{ dispatchNotification }}>
            {children}
        </ShopifyCustomerContext.Provider>
    )
}
