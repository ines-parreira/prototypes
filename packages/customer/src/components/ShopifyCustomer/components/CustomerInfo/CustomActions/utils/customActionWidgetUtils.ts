import { findNestedWidget } from '../../widget/widgetUtils'
import type {
    ButtonConfig,
    LinkConfig,
    NestedWidget,
    WidgetTemplate,
} from './customActionTypes'

export {
    applyOptimisticWidgetUpdate,
    findShopifyWidget,
} from '../../widget/widgetUtils'

export type WidgetPath = 'customer' | 'order'

type CustomActionsCustom = { links: LinkConfig[]; buttons: ButtonConfig[] }

export function findCustomerWidget(template: WidgetTemplate | undefined) {
    return findNestedWidget(template, 'customer')
}

export function findOrderWidget(template: WidgetTemplate | undefined) {
    return findNestedWidget(template, 'order')
}

function upsertNamedWidget(
    template: WidgetTemplate,
    custom: CustomActionsCustom,
    seed: NestedWidget & { path: string },
): WidgetTemplate {
    const existing = template.widgets?.some((w) => w.path === seed.path)

    if (existing) {
        return {
            ...template,
            widgets: template.widgets?.map((w) =>
                w.path === seed.path
                    ? {
                          ...w,
                          meta: {
                              ...w.meta,
                              custom: { ...w.meta?.custom, ...custom },
                          },
                      }
                    : w,
            ),
        }
    }

    return {
        ...template,
        widgets: [
            ...(template.widgets ?? []),
            { ...seed, meta: { ...seed.meta, custom } },
        ],
    }
}

export function updateCustomerWidget(
    template: WidgetTemplate,
    custom: CustomActionsCustom,
): WidgetTemplate {
    return upsertNamedWidget(template, custom, {
        path: 'customer',
        type: 'customer',
    })
}

export function updateOrderCustomActionsWidget(
    template: WidgetTemplate,
    custom: CustomActionsCustom,
): WidgetTemplate {
    return upsertNamedWidget(template, custom, {
        path: 'order',
        type: 'order',
        widgets: [],
    })
}

export function buildInitialTemplate(
    custom: CustomActionsCustom,
): WidgetTemplate {
    return {
        type: 'wrapper',
        widgets: [{ path: 'customer', type: 'customer', meta: { custom } }],
    }
}

export function buildInitialOrderTemplate(
    custom: CustomActionsCustom,
): WidgetTemplate {
    return {
        type: 'wrapper',
        widgets: [
            { path: 'order', type: 'order', widgets: [], meta: { custom } },
        ],
    }
}

export function readLegacyOrderCustomActions(
    template: WidgetTemplate | undefined,
): CustomActionsCustom {
    const ordersList = template?.widgets?.find((w) => w.path === 'orders')
    const innerCardTemplate = (
        ordersList?.widgets as NestedWidget[] | undefined
    )?.[0]
    return {
        links: innerCardTemplate?.meta?.custom?.links ?? [],
        buttons: innerCardTemplate?.meta?.custom?.buttons ?? [],
    }
}

type WidgetPathHandler = {
    find: (template: WidgetTemplate | undefined) => NestedWidget | undefined
    update: (
        template: WidgetTemplate,
        custom: CustomActionsCustom,
    ) => WidgetTemplate
    buildInitial: (custom: CustomActionsCustom) => WidgetTemplate
    readFallback?: (template: WidgetTemplate | undefined) => CustomActionsCustom
}

export const widgetPathHandlers: Record<WidgetPath, WidgetPathHandler> = {
    customer: {
        find: findCustomerWidget,
        update: updateCustomerWidget,
        buildInitial: buildInitialTemplate,
    },
    order: {
        find: findOrderWidget,
        update: updateOrderCustomActionsWidget,
        buildInitial: buildInitialOrderTemplate,
        readFallback: readLegacyOrderCustomActions,
    },
}
