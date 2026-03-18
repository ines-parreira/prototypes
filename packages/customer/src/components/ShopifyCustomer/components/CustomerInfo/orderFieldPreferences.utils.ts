import type { Widget } from '@gorgias/helpdesk-types'

import { ORDER_SECTION_CONFIGS } from './orderSectionConfig'
import type {
    FieldPreference,
    OrderFieldPreferences,
    OrderSectionKey,
    OrderSectionPreferences,
} from './types'

export type OrderNestedWidget = {
    path?: string
    type?: string
    widgets?: unknown[]
    meta?: {
        custom?: {
            orderSectionPreferences?: Partial<
                Record<OrderSectionKey, OrderSectionPreferences>
            >
        }
        [key: string]: unknown
    }
    [key: string]: unknown
}

export type WidgetTemplate = {
    type?: string
    widgets?: OrderNestedWidget[]
    [key: string]: unknown
}

export type SectionState = {
    fields: FieldPreference[]
    sectionVisible: boolean
}

export function buildPreferencesFromStored(
    stored: Partial<Record<OrderSectionKey, OrderSectionPreferences>>,
): OrderFieldPreferences {
    const sections: OrderFieldPreferences['sections'] = {}
    for (const config of ORDER_SECTION_CONFIGS) {
        if (stored[config.key]) {
            sections[config.key] = stored[config.key]
        } else if (config.isNonConfigurable) {
            sections[config.key] = { fields: [] }
        } else {
            sections[config.key] = {
                fields: Object.keys(config.fieldDefinitions).map((id) => ({
                    id,
                    visible: true,
                })),
            }
        }
    }
    return { sections }
}

export function buildOptimisticWidgetListUpdate(
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

export function buildCreateWidgetPayload(
    orderSectionPreferences: OrderFieldPreferences['sections'],
) {
    return {
        integration_id: null,
        context: 'ticket' as const,
        type: 'shopify' as const,
        template: buildInitialTemplate(orderSectionPreferences) as {
            [key: string]: unknown
        },
    }
}

export function buildDefaultPreferences(): OrderFieldPreferences {
    const sections: OrderFieldPreferences['sections'] = {}
    for (const config of ORDER_SECTION_CONFIGS) {
        if (config.isNonConfigurable) {
            sections[config.key] = { fields: [] }
            continue
        }
        sections[config.key] = {
            fields: Object.keys(config.fieldDefinitions).map((id) => ({
                id,
                visible: true,
            })),
        }
    }
    return { sections }
}

export function findOrderWidget(
    template: WidgetTemplate | undefined,
): OrderNestedWidget | undefined {
    return template?.widgets?.find((w) => w.path === 'order')
}

export function buildUpdatedTemplate(
    template: WidgetTemplate,
    orderSectionPreferences: OrderFieldPreferences['sections'],
): WidgetTemplate {
    const hasOrderWidget = template.widgets?.some((w) => w.path === 'order')

    return {
        ...template,
        widgets: hasOrderWidget
            ? template.widgets?.map((w) =>
                  w.path === 'order'
                      ? {
                            ...w,
                            meta: {
                                ...w.meta,
                                custom: {
                                    ...w.meta?.custom,
                                    orderSectionPreferences,
                                },
                            },
                        }
                      : w,
              )
            : [
                  ...(template.widgets ?? []),
                  {
                      path: 'order',
                      type: 'order',
                      widgets: [],
                      meta: {
                          custom: {
                              orderSectionPreferences,
                          },
                      },
                  },
              ],
    }
}

export function buildInitialTemplate(
    orderSectionPreferences: OrderFieldPreferences['sections'],
): WidgetTemplate {
    return {
        type: 'wrapper',
        widgets: [
            {
                path: 'order',
                type: 'order',
                widgets: [],
                meta: {
                    custom: {
                        orderSectionPreferences,
                    },
                },
            },
        ],
    }
}

export function initSections(
    preferences: OrderFieldPreferences,
): Record<OrderSectionKey, SectionState> {
    const sections = {} as Record<OrderSectionKey, SectionState>
    for (const config of ORDER_SECTION_CONFIGS) {
        const sectionPref = preferences.sections?.[config.key]
        if (sectionPref) {
            const hasVisibleFields =
                sectionPref.fields.length === 0 ||
                sectionPref.fields.some((f) => f.visible)
            sections[config.key] = {
                fields: config.isNonConfigurable ? [] : sectionPref.fields,
                sectionVisible: sectionPref.sectionVisible ?? hasVisibleFields,
            }
        } else if (config.isNonConfigurable) {
            sections[config.key] = {
                fields: [],
                sectionVisible: true,
            }
        } else {
            sections[config.key] = {
                fields: Object.keys(config.fieldDefinitions).map((id) => ({
                    id,
                    visible: true,
                })),
                sectionVisible: true,
            }
        }
    }
    return sections
}

export function sectionsEqual(
    a: Record<OrderSectionKey, SectionState>,
    b: Record<OrderSectionKey, SectionState>,
): boolean {
    for (const config of ORDER_SECTION_CONFIGS) {
        const aState = a[config.key]
        const bState = b[config.key]
        if (aState.sectionVisible !== bState.sectionVisible) return false
        if (aState.fields.length !== bState.fields.length) return false
        if (
            !aState.fields.every(
                (f, i) =>
                    f.id === bState.fields[i].id &&
                    f.visible === bState.fields[i].visible,
            )
        )
            return false
    }
    return true
}
