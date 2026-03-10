import { useCallback, useRef, useState } from 'react'

import type { OrderData } from '@repo/customer'
import { useQueryClient } from '@tanstack/react-query'
import { fromJS } from 'immutable'

import {
    ObjectType,
    queryKeys,
    SourceType,
} from '@gorgias/ecommerce-storage-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import { executeAction } from 'state/infobar/actions'
import { ShopifyActionType } from 'Widgets/modules/Shopify/types'

type CancelOrderData = {
    integrationId: number
    orderImmutable: ReturnType<typeof fromJS>
}

export function useCancelOrder() {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const [isOpen, setIsOpen] = useState(false)
    const [data, setData] = useState<CancelOrderData | null>(null)
    const parametersRef = useRef<Record<string, unknown>>({})

    const open = useCallback((integrationId: number, order: OrderData) => {
        setData({
            integrationId,
            orderImmutable: fromJS(order),
        })
        parametersRef.current = {}
        setIsOpen(true)
    }, [])

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

        const orderId = data.orderImmutable.get('id')
        const ordersQueryKey = queryKeys.ecommerceData.listEcommerceData(
            ObjectType.Order,
            SourceType.Shopify,
        )

        queryClient.setQueriesData(
            { queryKey: ordersQueryKey },
            (cachedData: unknown) => {
                const response = cachedData as
                    | {
                          data?: {
                              data?: Array<{ data?: Record<string, unknown> }>
                          }
                      }
                    | undefined
                if (!response?.data?.data) return cachedData
                return {
                    ...response,
                    data: {
                        ...response.data,
                        data: response.data.data.map((item) =>
                            item.data?.id === orderId
                                ? {
                                      ...item,
                                      data: {
                                          ...item.data,
                                          cancelled_at:
                                              new Date().toISOString(),
                                      },
                                  }
                                : item,
                        ),
                    },
                }
            },
        )

        dispatch(
            executeAction({
                actionName: ShopifyActionType.CancelOrder,
                integrationId: data.integrationId,
                payload: parametersRef.current,
                callback: () => {
                    void queryClient.invalidateQueries({
                        queryKey: ordersQueryKey,
                    })
                },
            }),
        )
        setIsOpen(false)
        setData(null)
        parametersRef.current = {}
    }, [data, dispatch, queryClient])

    const onClose = useCallback(() => {
        setIsOpen(false)
        setData(null)
        parametersRef.current = {}
    }, [])

    return { isOpen, data, open, onChange, onBulkChange, onSubmit, onClose }
}
