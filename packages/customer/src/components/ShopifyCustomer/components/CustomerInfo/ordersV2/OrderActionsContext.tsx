import { createContext, useContext } from 'react'

import type { OrderData } from '../../../types'

export type OrderActionHandlers = {
    onEdit: (integrationId: number, order: OrderData) => void
    onDuplicate: (integrationId: number, order: OrderData) => void
    onRefund: (integrationId: number, order: OrderData) => void
    onCancel: (integrationId: number, order: OrderData) => void
}

const noop = () => undefined

const defaultHandlers: OrderActionHandlers = {
    onEdit: noop,
    onDuplicate: noop,
    onRefund: noop,
    onCancel: noop,
}

export const OrderActionsContext =
    createContext<OrderActionHandlers>(defaultHandlers)

export function useOrderActions(): OrderActionHandlers {
    return useContext(OrderActionsContext)
}
