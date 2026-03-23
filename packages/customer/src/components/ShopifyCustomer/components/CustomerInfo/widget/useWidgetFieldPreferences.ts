import { useCallback, useMemo } from 'react'

import { FIELD_DEFINITIONS } from '../fieldDefinitions/fields'
import { SECTION_CONFIGS } from '../fieldDefinitions/sectionConfig'
import type {
    FieldPreference,
    LeafTemplate,
    SectionKey,
    SectionPreferences,
    ShopifyFieldPreferences,
} from '../types'
import { useShopifyWidget } from './useShopifyWidget'
import {
    preferencesToWidgetFields,
    sectionPreferencesToWidgets,
    widgetFieldsToPreferences,
} from './widgetFieldNormalization'
import {
    createWidgetFromTemplate,
    findNestedWidget,
    saveWidgetWithOptimisticUpdate,
} from './widgetUtils'

type NestedWidget = {
    path?: string
    type?: string
    widgets?: LeafTemplate[]
    meta?: {
        custom?: {
            links?: unknown[]
            buttons?: unknown[]
            fieldPreferences?: FieldPreference[]
            sectionPreferences?: Partial<Record<SectionKey, SectionPreferences>>
        }
        [key: string]: unknown
    }
    [key: string]: unknown
}

type WidgetTemplate = {
    type?: string
    widgets?: NestedWidget[]
    [key: string]: unknown
}

const ALL_FIELD_IDS = Object.keys(FIELD_DEFINITIONS)

function buildDefaultSections(): Partial<
    Record<SectionKey, SectionPreferences>
> {
    const sections: Partial<Record<SectionKey, SectionPreferences>> = {}
    for (const config of SECTION_CONFIGS) {
        sections[config.key] = {
            fields: Object.keys(config.fieldDefinitions).map((id) => ({
                id,
                visible: false,
            })),
        }
    }
    return sections
}

const defaultPreferences: ShopifyFieldPreferences = {
    fields: ALL_FIELD_IDS.map((id) => ({ id, visible: false })),
    sections: buildDefaultSections(),
}

export function useWidgetFieldPreferences() {
    const {
        shopifyWidget: widget,
        template: rawTemplate,
        queryClient,
        listWidgetsQueryKey,
        updateWidget,
        createWidget,
        invalidateWidgets,
        isLoading,
    } = useShopifyWidget()

    const template = rawTemplate as WidgetTemplate | undefined
    const customerWidget = useMemo(
        () => findNestedWidget<NestedWidget>(template, 'customer'),
        [template],
    )

    const preferences = useMemo((): ShopifyFieldPreferences => {
        if (!customerWidget?.widgets) return defaultPreferences

        const fields = widgetFieldsToPreferences(
            customerWidget.widgets as LeafTemplate[],
            customerWidget.meta?.custom?.fieldPreferences,
        )

        if (fields.length === 0) return defaultPreferences

        const storedSections = customerWidget.meta?.custom?.sectionPreferences
        const sections: Partial<Record<SectionKey, SectionPreferences>> = {}

        for (const config of SECTION_CONFIGS) {
            if (storedSections?.[config.key]) {
                sections[config.key] = storedSections[config.key]
            } else if (config.key === 'customer') {
                sections[config.key] = { fields }
            } else {
                sections[config.key] = {
                    fields: Object.keys(config.fieldDefinitions).map((id) => ({
                        id,
                        visible: false,
                    })),
                }
            }
        }

        return { fields, sections }
    }, [customerWidget])

    const savePreferences = useCallback(
        async (newPreferences: ShopifyFieldPreferences) => {
            const existingLeaves = customerWidget?.widgets as
                | LeafTemplate[]
                | undefined

            const { widgets: newLeaves, fieldPreferences } =
                preferencesToWidgetFields(newPreferences.fields, existingLeaves)

            const sectionWidgets = sectionPreferencesToWidgets(
                newPreferences.sections,
                existingLeaves,
            )
            const allWidgets = [
                ...newLeaves,
                ...sectionWidgets,
            ] as LeafTemplate[]

            const customerMeta = {
                custom: {
                    fieldPreferences,
                    sectionPreferences: newPreferences.sections,
                },
            }

            if (widget?.id && template) {
                const updatedTemplate: WidgetTemplate = {
                    ...template,
                    widgets: template.widgets?.map((w) =>
                        w.path === 'customer'
                            ? {
                                  ...w,
                                  widgets: allWidgets,
                                  meta: {
                                      ...w.meta,
                                      custom: {
                                          ...w.meta?.custom,
                                          ...customerMeta.custom,
                                      },
                                  },
                              }
                            : w,
                    ),
                }

                await saveWidgetWithOptimisticUpdate({
                    widgetId: widget.id,
                    updatedTemplate,
                    queryClient,
                    listWidgetsQueryKey,
                    updateWidget,
                    invalidateWidgets,
                })
            } else {
                await createWidgetFromTemplate({
                    createPayload: {
                        integration_id: null,
                        context: 'ticket' as const,
                        type: 'shopify' as const,
                        template: {
                            type: 'wrapper',
                            widgets: [
                                {
                                    path: 'customer',
                                    type: 'customer',
                                    widgets: allWidgets,
                                    meta: customerMeta,
                                },
                            ],
                        } as { [key: string]: unknown },
                    },
                    createWidget,
                    invalidateWidgets,
                })
            }
        },
        [
            widget,
            template,
            customerWidget,
            updateWidget,
            createWidget,
            invalidateWidgets,
            queryClient,
            listWidgetsQueryKey,
        ],
    )

    return { preferences, savePreferences, isLoading }
}
