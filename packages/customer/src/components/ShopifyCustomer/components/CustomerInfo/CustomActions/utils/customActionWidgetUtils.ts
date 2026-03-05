import type { Widget } from '@gorgias/helpdesk-types'

import type {
    ButtonConfig,
    LinkConfig,
    NestedWidget,
    ShopifyWidget,
    WidgetTemplate,
} from './customActionTypes'

export function findCustomerWidget(
    template: WidgetTemplate | undefined,
): NestedWidget | undefined {
    return template?.widgets?.find((w) => w.path === 'customer')
}

export function updateCustomerWidget(
    template: WidgetTemplate,
    custom: { links: LinkConfig[]; buttons: ButtonConfig[] },
): WidgetTemplate {
    return {
        ...template,
        widgets: template.widgets?.map((w) =>
            w.path === 'customer'
                ? {
                      ...w,
                      meta: {
                          ...w.meta,
                          custom: {
                              ...w.meta?.custom,
                              ...custom,
                          },
                      },
                  }
                : w,
        ),
    }
}

export function findShopifyWidget(
    widgets: Widget[],
): ShopifyWidget | undefined {
    return widgets.find(
        (w): w is ShopifyWidget =>
            w.type === 'shopify' && w.context === 'ticket',
    )
}

export function buildInitialTemplate(custom: {
    links: LinkConfig[]
    buttons: ButtonConfig[]
}): WidgetTemplate {
    return {
        type: 'wrapper',
        widgets: [
            {
                path: 'customer',
                type: 'customer',
                meta: { custom },
            },
        ],
    }
}

export function applyOptimisticWidgetUpdate(
    old: { data: { data: Widget[] } } | undefined,
    widgetId: number,
    updatedTemplate: WidgetTemplate,
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

export function addItem<T>(items: T[], item: T): T[] {
    return [...items, item]
}

export function editItem<T>(items: T[], index: number, item: T): T[] {
    return items.map((existing, i) => (i === index ? item : existing))
}

export function removeItem<T>(items: T[], index: number): T[] {
    return items.filter((_, i) => i !== index)
}
