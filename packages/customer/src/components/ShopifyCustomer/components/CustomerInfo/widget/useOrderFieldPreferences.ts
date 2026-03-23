import { useCallback, useMemo } from 'react'

import { ORDER_SECTION_CONFIGS } from '../fieldDefinitions/orderSectionConfig'
import type { OrderFieldPreferences, OrderSectionKey } from '../types'
import {
    buildCreateWidgetPayload,
    buildPreferencesFromStored,
    buildUpdatedTemplate,
} from './orderFieldPreferences.utils'
import type { WidgetTemplate } from './orderFieldPreferences.utils'
import { useShopifyWidget } from './useShopifyWidget'
import {
    createWidgetFromTemplate,
    findNestedWidget,
    saveWidgetWithOptimisticUpdate,
} from './widgetUtils'

const defaultPreferences = buildPreferencesFromStored()

export function useOrderFieldPreferences() {
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
    const orderWidget = useMemo(
        () => findNestedWidget(template, 'order'),
        [template],
    )

    const preferences = useMemo((): OrderFieldPreferences => {
        const stored = orderWidget?.meta?.custom?.orderSectionPreferences
        if (!stored) return defaultPreferences

        return buildPreferencesFromStored(stored)
    }, [orderWidget])

    const savePreferences = useCallback(
        async (newPreferences: OrderFieldPreferences) => {
            const orderSectionPreferences = newPreferences.sections

            if (widget?.id != null && template) {
                const updatedTemplate = buildUpdatedTemplate(
                    template,
                    orderSectionPreferences,
                )

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
                    createPayload: buildCreateWidgetPayload(
                        orderSectionPreferences,
                    ),
                    createWidget,
                    invalidateWidgets,
                })
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
