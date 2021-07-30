import {fromJS, List, Map} from 'immutable'
import _difference from 'lodash/difference'
import _values from 'lodash/values'
import _forEach from 'lodash/forEach'

import {DEFAULT_SOURCE_PATHS} from '../../config'

import {WidgetContextType} from './types'

/**
 * Return item from items list where context matches
 */
export function itemsWithContext(
    items: List<any> = fromJS([]),
    context: WidgetContextType
): List<any> {
    // TODO(custoners-migration): update this line when we migrated widgets with a `user` context
    return items.filter((w: Map<any, any>) => {
        if (['customer', 'user'].includes(context)) {
            return ['customer', 'user'].includes(w.get('context', ''))
        }
        return w.get('context', '') === context
    }) as List<any>
}

export function itemsWithoutContext(
    items: List<any> = fromJS([]),
    context: WidgetContextType
): List<any> {
    // TODO(custoners-migration): update this line when we migrated widgets with a `user` context
    return items.filter((w: Map<any, any>) => {
        if (['customer', 'user'].includes(context)) {
            return !['customer', 'user'].includes(w.get('context', ''))
        }
        return w.get('context', '') !== context
    }) as List<any>
}

/**
 * Return source paths for widgets
 */
export function getSourcePathFromContext(
    context: WidgetContextType,
    type = ''
) {
    const config = DEFAULT_SOURCE_PATHS[context]

    const defaultSourcePath = config.custom

    if (!config) {
        return defaultSourcePath
    }

    if (!type) {
        return _values(config)
    }

    return config[type as keyof typeof config] || defaultSourcePath
}

/**
 * Return context and type of widget for passed source path (path on wrapper)
 */
export function getContextFromSourcePath(sourcePath: Array<string> | string) {
    const config = DEFAULT_SOURCE_PATHS

    let result = {
        context: 'ticket',
        type: 'custom',
    }

    _forEach(config, (contextConfig, context) => {
        _forEach(contextConfig, (path, type) => {
            if (_difference(path, sourcePath).length === 0) {
                result = {
                    context,
                    type,
                }
            }
        })
    })

    return result
}

/**
 * Return items with passed new widget where context matches
 */
export function itemsWithUpdatedWidgets(
    items: List<any> = fromJS([]),
    context: WidgetContextType,
    newWidgets: List<any>
): List<any> {
    const otherWidgets = itemsWithoutContext(items, context)
    return otherWidgets.merge(fromJS(newWidgets))
}

export function reorderWidgets(items: List<any> = fromJS([])): List<any> {
    return items.map((item: Map<any, any>, i) => item.set('order', i)) as List<
        any
    >
}
