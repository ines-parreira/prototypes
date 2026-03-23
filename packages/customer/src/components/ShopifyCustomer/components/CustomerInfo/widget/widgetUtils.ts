import type { QueryClient } from '@tanstack/react-query'

import type { Widget } from '@gorgias/helpdesk-types'

type BaseNestedWidget = {
    path?: string
    [key: string]: unknown
}

type BaseWidgetTemplate = {
    type?: string
    widgets?: BaseNestedWidget[]
    [key: string]: unknown
}

type ShopifyWidget = Widget & {
    template?: BaseWidgetTemplate
}

export function findShopifyWidget(
    widgets: Widget[],
): ShopifyWidget | undefined {
    return widgets.find(
        (w): w is ShopifyWidget =>
            w.type === 'shopify' && w.context === 'ticket',
    )
}

export function findNestedWidget<T extends BaseNestedWidget>(
    template: { widgets?: T[] } | undefined,
    path: string,
): T | undefined {
    return template?.widgets?.find((w) => w.path === path)
}

export function applyOptimisticWidgetUpdate(
    old: { data: { data: Widget[] } } | undefined,
    widgetId: number,
    updatedTemplate: BaseWidgetTemplate,
): { data: { data: Widget[] } } | undefined {
    if (!old?.data?.data) return old
    return {
        ...old,
        data: {
            ...old.data,
            data: old.data.data.map((w) =>
                w.id === widgetId ? { ...w, template: updatedTemplate } : w,
            ),
        },
    }
}

type SaveWidgetParams = {
    widgetId: number
    updatedTemplate: BaseWidgetTemplate
    queryClient: QueryClient
    listWidgetsQueryKey: readonly unknown[]
    updateWidget: (params: {
        id: number
        data: { template: BaseWidgetTemplate }
    }) => Promise<unknown>
    invalidateWidgets: () => void
}

type CreateWidgetParams = {
    createPayload: {
        integration_id: null
        context: 'ticket'
        type: 'shopify'
        template: { [key: string]: unknown }
    }
    createWidget: (params: {
        data: {
            integration_id: null
            context: 'ticket'
            type: 'shopify'
            template: { [key: string]: unknown }
        }
    }) => Promise<unknown>
    invalidateWidgets: () => void
}

export async function saveWidgetWithOptimisticUpdate(
    params: SaveWidgetParams,
): Promise<void> {
    const {
        widgetId,
        updatedTemplate,
        queryClient,
        listWidgetsQueryKey,
        updateWidget,
        invalidateWidgets,
    } = params

    const previousData = queryClient.getQueryData(listWidgetsQueryKey)
    queryClient.setQueryData(
        listWidgetsQueryKey,
        (old: Parameters<typeof applyOptimisticWidgetUpdate>[0]) =>
            applyOptimisticWidgetUpdate(old, widgetId, updatedTemplate),
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
}

export async function createWidgetFromTemplate(
    params: CreateWidgetParams,
): Promise<void> {
    const { createPayload, createWidget, invalidateWidgets } = params
    await createWidget({ data: createPayload })
    invalidateWidgets()
}
