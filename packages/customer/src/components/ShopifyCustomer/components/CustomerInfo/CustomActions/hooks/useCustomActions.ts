import { useMemo } from 'react'

import { useShopifyWidget } from '../../widget/useShopifyWidget'
import type { WidgetTemplate } from '../utils/customActionTypes'
import type { WidgetPath } from '../utils/customActionWidgetUtils'
import { widgetPathHandlers } from '../utils/customActionWidgetUtils'

type UseCustomActionsOptions = {
    widgetPath?: WidgetPath
}

export function useCustomActions(options: UseCustomActionsOptions = {}) {
    const { widgetPath = 'customer' } = options
    const handler = widgetPathHandlers[widgetPath]

    const { template: rawTemplate, isLoading } = useShopifyWidget()

    const template = rawTemplate as WidgetTemplate | undefined
    const targetWidget = useMemo(
        () => handler.find(template),
        [handler, template],
    )
    const fallback = useMemo(() => {
        if (targetWidget || !handler.readFallback) return undefined
        return handler.readFallback(template)
    }, [handler, template, targetWidget])
    const links = useMemo(
        () => targetWidget?.meta?.custom?.links ?? fallback?.links ?? [],
        [targetWidget, fallback],
    )
    const buttons = useMemo(
        () => targetWidget?.meta?.custom?.buttons ?? fallback?.buttons ?? [],
        [targetWidget, fallback],
    )

    return {
        links,
        buttons,
        isLoading,
    }
}
