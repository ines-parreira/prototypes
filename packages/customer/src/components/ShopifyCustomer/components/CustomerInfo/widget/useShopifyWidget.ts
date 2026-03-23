import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useCreateWidget,
    useListWidgets,
    useUpdateWidget,
} from '@gorgias/helpdesk-queries'

import { findShopifyWidget } from './widgetUtils'

const LIST_WIDGETS_LIMIT = 100

export function useShopifyWidget() {
    const queryClient = useQueryClient()

    const listWidgetsParams = { limit: LIST_WIDGETS_LIMIT } as const
    const { data: widgetsResponse, isLoading } =
        useListWidgets(listWidgetsParams)

    const { mutateAsync: updateWidget } = useUpdateWidget()
    const { mutateAsync: createWidget } = useCreateWidget()

    const shopifyWidget = useMemo(() => {
        if (!widgetsResponse) return undefined
        const widgets =
            'data' in widgetsResponse ? widgetsResponse.data.data : []
        if (!Array.isArray(widgets)) return undefined

        return findShopifyWidget(widgets)
    }, [widgetsResponse])

    const template = shopifyWidget?.template

    const listWidgetsQueryKey = queryKeys.widgets.listWidgets(listWidgetsParams)

    const invalidateWidgets = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: listWidgetsQueryKey,
        })
    }, [queryClient, listWidgetsQueryKey])

    return {
        shopifyWidget,
        template,
        queryClient,
        listWidgetsQueryKey,
        updateWidget,
        createWidget,
        invalidateWidgets,
        isLoading,
    }
}
