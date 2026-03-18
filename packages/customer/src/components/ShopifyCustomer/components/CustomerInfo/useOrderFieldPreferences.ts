import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useCreateWidget,
    useListWidgets,
    useUpdateWidget,
} from '@gorgias/helpdesk-queries'
import type { Widget } from '@gorgias/helpdesk-types'

import {
    buildCreateWidgetPayload,
    buildDefaultPreferences,
    buildOptimisticWidgetListUpdate,
    buildPreferencesFromStored,
    buildUpdatedTemplate,
    findOrderWidget,
} from './orderFieldPreferences.utils'
import type { WidgetTemplate } from './orderFieldPreferences.utils'
import { ORDER_SECTION_CONFIGS } from './orderSectionConfig'
import type { OrderFieldPreferences, OrderSectionKey } from './types'

type ShopifyWidget = Widget & {
    template?: WidgetTemplate
}

const LIST_WIDGETS_LIMIT = 100
const defaultPreferences = buildDefaultPreferences()

export function useOrderFieldPreferences() {
    const queryClient = useQueryClient()

    const listWidgetsParams = { limit: LIST_WIDGETS_LIMIT } as const
    const { data: widgetsResponse, isLoading } =
        useListWidgets(listWidgetsParams)

    const { mutateAsync: updateWidget } = useUpdateWidget()
    const { mutateAsync: createWidget } = useCreateWidget()

    const widget = useMemo((): ShopifyWidget | undefined => {
        if (!widgetsResponse) return undefined
        const widgets =
            'data' in widgetsResponse ? widgetsResponse.data.data : []
        if (!Array.isArray(widgets)) return undefined

        return widgets.find(
            (w): w is ShopifyWidget =>
                w.type === 'shopify' && w.context === 'ticket',
        )
    }, [widgetsResponse])

    const template = widget?.template as WidgetTemplate | undefined
    const orderWidget = useMemo(() => findOrderWidget(template), [template])

    const preferences = useMemo((): OrderFieldPreferences => {
        const stored = orderWidget?.meta?.custom?.orderSectionPreferences
        if (!stored) return defaultPreferences

        return buildPreferencesFromStored(stored)
    }, [orderWidget])

    const listWidgetsQueryKey = queryKeys.widgets.listWidgets(listWidgetsParams)

    const invalidateWidgets = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: listWidgetsQueryKey,
        })
    }, [queryClient, listWidgetsQueryKey])

    const savePreferences = useCallback(
        async (newPreferences: OrderFieldPreferences) => {
            const orderSectionPreferences = newPreferences.sections

            if (widget?.id != null && template) {
                const widgetId = widget.id
                const updatedTemplate = buildUpdatedTemplate(
                    template,
                    orderSectionPreferences,
                )

                const previousData =
                    queryClient.getQueryData(listWidgetsQueryKey)
                queryClient.setQueryData(
                    listWidgetsQueryKey,
                    (old: { data: { data: Widget[] } } | undefined) =>
                        buildOptimisticWidgetListUpdate(
                            old,
                            widgetId,
                            updatedTemplate,
                        ),
                )

                try {
                    await updateWidget({
                        id: widgetId,
                        data: { template: updatedTemplate },
                    })
                } catch (error) {
                    queryClient.setQueryData(listWidgetsQueryKey, previousData)
                    throw error
                } finally {
                    invalidateWidgets()
                }
            } else {
                await createWidget({
                    data: buildCreateWidgetPayload(orderSectionPreferences),
                })
                invalidateWidgets()
            }
        },
        [
            widget,
            template,
            updateWidget,
            createWidget,
            invalidateWidgets,
            queryClient,
            listWidgetsQueryKey,
        ],
    )

    const getVisibleFields = useMemo(
        () => (sectionKey: OrderSectionKey) => {
            const section = preferences.sections[sectionKey]
            if (!section) return []
            const config = ORDER_SECTION_CONFIGS.find(
                (c) => c.key === sectionKey,
            )
            if (!config) return []
            return section.fields
                .filter((f) => f.visible && config.fieldDefinitions[f.id])
                .map((f) => config.fieldDefinitions[f.id])
        },
        [preferences],
    )

    return { preferences, savePreferences, getVisibleFields, isLoading }
}
