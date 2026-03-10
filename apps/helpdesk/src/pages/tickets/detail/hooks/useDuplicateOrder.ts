import { useCallback, useRef, useState } from 'react'

import type { OrderData, ShopperData } from '@repo/customer'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import { executeAction } from 'state/infobar/actions'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

type DuplicatableOrder = OrderData & { customer: ShopperData }

type DuplicateOrderData = {
    integrationId: number
    orderId: number
    orderImmutable: ReturnType<typeof fromJS>
    customerImmutable: ReturnType<typeof fromJS>
}

export function useDuplicateOrder() {
    const dispatch = useAppDispatch()
    const [isOpen, setIsOpen] = useState(false)
    const [data, setData] = useState<DuplicateOrderData | null>(null)
    const parametersRef = useRef<Record<string, unknown>>({})

    const open = useCallback(
        (integrationId: number, order: DuplicatableOrder) => {
            const orderImmutable = fromJS(order)
            const customerImmutable = fromJS({
                id: order.customer.id,
                admin_graphql_api_id: order.customer.admin_graphql_api_id,
                email: order.customer.email,
                default_address: order.customer.default_address,
                currency: order.currency,
            })
            setData({
                integrationId,
                orderId: Number(order.id),
                orderImmutable,
                customerImmutable,
            })
            parametersRef.current = {}
            setIsOpen(true)
        },
        [],
    )

    const onChange = useCallback(
        (
            name: string,
            value: string | number | boolean | Record<string, unknown>,
            callback?: () => void,
        ) => {
            parametersRef.current[name] = value
            callback?.()
        },
        [],
    )

    const onBulkChange = useCallback(
        (
            values: Array<{
                name: string
                value: string | number | boolean | Record<string, unknown>
            }>,
            callback?: () => void,
        ) => {
            values.forEach(({ name, value }) => {
                parametersRef.current[name] = value
            })
            callback?.()
        },
        [],
    )

    const onSubmit = useCallback(() => {
        if (!data) return
        dispatch(
            executeAction({
                actionName: ShopifyActionType.DuplicateOrder,
                integrationId: data.integrationId,
                payload: {
                    order_id: data.orderId,
                    ...parametersRef.current,
                },
            }),
        )
        setIsOpen(false)
        setData(null)
        parametersRef.current = {}
    }, [data, dispatch])

    const onClose = useCallback(() => {
        setIsOpen(false)
        setData(null)
        parametersRef.current = {}
    }, [])

    return { isOpen, data, open, onChange, onBulkChange, onSubmit, onClose }
}
