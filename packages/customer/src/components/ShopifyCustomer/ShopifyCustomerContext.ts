import { createContext } from 'react'

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
}

export const ShopifyCustomerContext = createContext<ShopifyCustomerContextType>(
    {
        dispatchNotification: () => {},
    },
)
