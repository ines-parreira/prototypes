import { useCallback, useRef, useState } from 'react'

import type { ShopperData } from '@repo/customer'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import { executeAction } from 'state/infobar/actions'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

type CreateOrderData = {
    integrationId: number
    customerId: number
    customerImmutable: ReturnType<typeof fromJS>
}

export function useCreateOrder() {
    const dispatch = useAppDispatch()
    const [isOpen, setIsOpen] = useState(false)
    const [data, setData] = useState<CreateOrderData | null>(null)
    const parametersRef = useRef<Record<string, unknown>>({})

    const open = useCallback(
        (integrationId: number, shopperData: ShopperData) => {
            const customerImmutable = fromJS({
                id: shopperData.id,
                admin_graphql_api_id: shopperData.admin_graphql_api_id,
                email: shopperData.email,
                default_address: shopperData.default_address,
                currency: shopperData.currency,
            })
            setData({
                integrationId,
                customerId: shopperData.id,
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
                actionName: ShopifyActionType.CreateOrder,
                integrationId: data.integrationId,
                payload: {
                    customer_id: data.customerId,
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
