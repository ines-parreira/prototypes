import { useCallback } from 'react'

import { useShopifyWidget } from '../../widget/useShopifyWidget'
import {
    createWidgetFromTemplate,
    saveWidgetWithOptimisticUpdate,
} from '../../widget/widgetUtils'
import type {
    ButtonConfig,
    LinkConfig,
    WidgetTemplate,
} from '../utils/customActionTypes'
import type { WidgetPath } from '../utils/customActionWidgetUtils'
import { widgetPathHandlers } from '../utils/customActionWidgetUtils'

export type CustomActionsUpdate = {
    links: LinkConfig[]
    buttons: ButtonConfig[]
}

export type CustomActionsBatchUpdate = Partial<
    Record<WidgetPath, CustomActionsUpdate>
>

export function useSaveCustomActions() {
    const {
        shopifyWidget: widget,
        template: rawTemplate,
        queryClient,
        listWidgetsQueryKey,
        updateWidget,
        createWidget,
        invalidateWidgets,
    } = useShopifyWidget()

    const template = rawTemplate as WidgetTemplate | undefined

    const save = useCallback(
        async (updates: CustomActionsBatchUpdate) => {
            const entries = Object.entries(updates) as [
                WidgetPath,
                CustomActionsUpdate,
            ][]
            if (entries.length === 0) return

            if (widget?.id && template) {
                let updatedTemplate = template
                for (const [path, custom] of entries) {
                    updatedTemplate = widgetPathHandlers[path].update(
                        updatedTemplate,
                        custom,
                    )
                }
                await saveWidgetWithOptimisticUpdate({
                    widgetId: widget.id,
                    updatedTemplate,
                    queryClient,
                    listWidgetsQueryKey,
                    updateWidget,
                    invalidateWidgets,
                })
                return
            }

            const [firstPath, firstCustom] = entries[0]
            let combined =
                widgetPathHandlers[firstPath].buildInitial(firstCustom)
            for (const [path, custom] of entries.slice(1)) {
                combined = widgetPathHandlers[path].update(combined, custom)
            }
            await createWidgetFromTemplate({
                createPayload: {
                    integration_id: null,
                    context: 'ticket' as const,
                    type: 'shopify' as const,
                    template: combined as { [key: string]: unknown },
                },
                createWidget,
                invalidateWidgets,
            })
        },
        [
            widget,
            template,
            queryClient,
            listWidgetsQueryKey,
            updateWidget,
            createWidget,
            invalidateWidgets,
        ],
    )

    return { save }
}
