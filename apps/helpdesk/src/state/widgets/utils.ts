import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { cloneDeep } from '@gorgias/toolkit'
import { DEFAULT_SOURCE_PATHS } from 'config'

import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
} from './constants'
import { WidgetEnvironment } from './types'

/**
 * Return item from items list where context matches
 */
export function itemsWithContext(
    items: List<any> = fromJS([]),
    context: WidgetEnvironment,
): List<any> {
    // TODO(customers-migration): update this line when we migrated widgets with a `user` context
    return items.filter((w: Map<any, any>) => {
        if (['customer', 'user'].includes(context)) {
            return ['customer', 'user'].includes(w.get('context', ''))
        }
        return w.get('context', '') === context
    }) as List<any>
}

export function itemsWithoutContext(
    items: List<any> = fromJS([]),
    context: WidgetEnvironment,
): List<any> {
    // TODO(customers-migration): update this line when we migrated widgets with a `user` context
    return items.filter((w: Map<any, any>) => {
        if (['customer', 'user'].includes(context)) {
            return !['customer', 'user'].includes(w.get('context', ''))
        }
        return w.get('context', '') !== context
    }) as List<any>
}

/**
 * Return source paths for widgets.
 */
export function getSourcePathFromContext(
    context: WidgetEnvironment,
    type = '',
) {
    // Using cloneDeep so that we don't mess with the `DEFAULT_SOURCE_PATHS`
    // object. We only want that object to act as a CONSTANT and have
    // a new copy of it each time that we use.
    const config = cloneDeep(DEFAULT_SOURCE_PATHS[context])

    // if we can't find a source for the context type
    // return the standalone context type
    if (!config) {
        return cloneDeep(
            DEFAULT_SOURCE_PATHS[WidgetEnvironment.Ticket][
                STANDALONE_WIDGET_TYPE
            ],
        )
    }

    if (!type) {
        return Object.values(config)
    }

    let sourcePath = config[type as keyof typeof config]
    if (!sourcePath) {
        sourcePath = config.custom
    }

    return sourcePath
}

/**
 * Return items with passed new widget where context matches
 */
export function itemsWithUpdatedWidgets(
    items: List<any> = fromJS([]),
    context: WidgetEnvironment,
    newWidgets: List<any>,
): List<any> {
    const otherWidgets = itemsWithoutContext(items, context)
    return otherWidgets.merge(fromJS(newWidgets))
}

export function reorderWidgets(items: List<any> = fromJS([])): List<any> {
    return items.map((item: Map<any, any>, i) =>
        item.set('order', i),
    ) as List<any>
}

export function getWidgetSourcePath(
    widget: Map<string, unknown>,
    sources: Map<string, unknown>,
): string[] | null {
    const widgetType = widget.get('type') as string
    const context = widget.get('context') as WidgetEnvironment
    const integrationId = widget.get('integration_id')

    if (widgetType === STANDALONE_WIDGET_TYPE) {
        return []
    }

    if (widgetType === CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE) {
        const appId = widget.get('app_id') as string
        if (appId) {
            const sourcePath = getSourcePathFromContext(
                context,
                'customer_external_data',
            ) as string[]
            if (!sources.getIn([...sourcePath, appId])) return null
            return [...sourcePath, appId]
        }
    }

    // Widgets bound to an integration resolve their data via integrations.<id>
    // when the customer has data there. Mirrors legacy InfobarWidgets, which
    // iterates customer.integrations and matches by integration_id (HTTP-style)
    // before falling back to the type-specific path.
    if (integrationId) {
        const integrationsPath = getSourcePathFromContext(
            context,
            'integrations',
        ) as string[]
        const finalPath = [...integrationsPath, String(integrationId)]
        if (sources.getIn(finalPath)) return finalPath
        if (widgetType !== CUSTOM_WIDGET_TYPE) return null
    }

    if (widgetType === CUSTOM_WIDGET_TYPE) {
        return getSourcePathFromContext(context, 'custom') as string[]
    }

    return null
}
