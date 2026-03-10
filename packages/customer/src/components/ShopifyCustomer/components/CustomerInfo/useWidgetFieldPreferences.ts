import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useCreateWidget,
    useListWidgets,
    useUpdateWidget,
} from '@gorgias/helpdesk-queries'
import type { Widget } from '@gorgias/helpdesk-types'

import { FIELD_DEFINITIONS } from './fields'
import { SECTION_CONFIGS } from './sectionConfig'
import type {
    FieldPreference,
    LeafTemplate,
    SectionKey,
    SectionPreferences,
    ShopifyFieldPreferences,
} from './types'
import {
    preferencesToWidgetFields,
    sectionPreferencesToWidgets,
    widgetFieldsToPreferences,
} from './widgetFieldNormalization'

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

type ShopifyWidget = Widget & {
    template?: WidgetTemplate
}

const ALL_FIELD_IDS = Object.keys(FIELD_DEFINITIONS)
const LIST_WIDGETS_LIMIT = 100

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

function findCustomerWidget(
    template: WidgetTemplate | undefined,
): NestedWidget | undefined {
    return template?.widgets?.find((w) => w.path === 'customer')
}

export function useWidgetFieldPreferences() {
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
    const customerWidget = useMemo(
        () => findCustomerWidget(template),
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

    const listWidgetsQueryKey = queryKeys.widgets.listWidgets(listWidgetsParams)

    const invalidateWidgets = useCallback(() => {
        queryClient.invalidateQueries({
            queryKey: listWidgetsQueryKey,
        })
    }, [queryClient, listWidgetsQueryKey])

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
                                          fieldPreferences,
                                          sectionPreferences:
                                              newPreferences.sections,
                                      },
                                  },
                              }
                            : w,
                    ),
                }

                const previousData =
                    queryClient.getQueryData(listWidgetsQueryKey)
                queryClient.setQueryData(
                    listWidgetsQueryKey,
                    (old: { data: { data: Widget[] } } | undefined) => {
                        if (!old?.data?.data) return old
                        return {
                            ...old,
                            data: {
                                ...old.data,
                                data: old.data.data.map((w) =>
                                    w.id === widget.id
                                        ? { ...w, template: updatedTemplate }
                                        : w,
                                ),
                            },
                        }
                    },
                )

                try {
                    await updateWidget({
                        id: widget.id,
                        data: { template: updatedTemplate },
                    })
                } catch (error) {
                    queryClient.setQueryData(listWidgetsQueryKey, previousData)
                    throw error
                } finally {
                    invalidateWidgets()
                }
            } else {
                const initialTemplate: WidgetTemplate = {
                    type: 'wrapper',
                    widgets: [
                        {
                            path: 'customer',
                            type: 'customer',
                            widgets: allWidgets,
                            meta: {
                                custom: {
                                    fieldPreferences,
                                    sectionPreferences: newPreferences.sections,
                                },
                            },
                        },
                    ],
                }

                await createWidget({
                    data: {
                        integration_id: null,
                        context: 'ticket' as const,
                        type: 'shopify' as const,
                        template: initialTemplate as {
                            [key: string]: unknown
                        },
                    },
                })
                invalidateWidgets()
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
