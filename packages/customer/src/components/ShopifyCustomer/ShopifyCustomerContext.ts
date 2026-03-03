import { createContext } from 'react'

import type { ShopperData } from './types'

export enum NotificationStatus {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
}

export type NotificationParams = {
    status: NotificationStatus
    message: string
}

export type ShopifyCustomerContextType = {
    dispatchNotification: (params: NotificationParams) => void
    onCreateOrder?: (integrationId: number, shopperData: ShopperData) => void
}

export const ShopifyCustomerContext = createContext<ShopifyCustomerContextType>(
    {
        dispatchNotification: () => {},
    },
)
