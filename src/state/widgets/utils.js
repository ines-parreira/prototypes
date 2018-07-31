// @flow
import {fromJS} from 'immutable'
import _difference from 'lodash/difference'
import _values from 'lodash/values'
import _forEach from 'lodash/forEach'
import {DEFAULT_SOURCE_PATHS} from '../../config'

import type {List, Map} from 'immutable'
import type {contextType} from './types'
type itemsType = List<Map<*,*>>
type contextFromSourcePathType = {
    context: contextType,
    type: string
}

/**
 * Return item from items list where context matches
 * @param items
 * @param context
 * @returns {*}
 */
export function itemsWithContext(items: itemsType = fromJS([]), context: contextType): itemsType {
    // TODO(custoners-migration): update this line when we migrated widgets with a `user` context
    return items.filter((w) => {
        if (['customer', 'user'].includes(context)) {
            console.log(['customer', 'user'].includes(w.get('context', '')))
            return ['customer', 'user'].includes(w.get('context', ''))
        }
        return w.get('context', '') === context
    })
}

export function itemsWithoutContext(items: itemsType = fromJS([]), context: contextType): itemsType {
    // TODO(custoners-migration): update this line when we migrated widgets with a `user` context
    return items.filter((w) => {
        if (['customer', 'user'].includes(context)) {
            return !['customer', 'user'].includes(w.get('context', ''))
        }
        return w.get('context', '') !== context
    })
}

/**
 * Return source paths for widgets
 * @param context - context of widget (ticket, customer, etc.)
 * @param type (Optional) - type of widget (custom, shopify, etc.)
 * @returns {string/Array}
 */
export function getSourcePathFromContext(context: contextType, type: string = ''): string | Array<string> {
    const config = DEFAULT_SOURCE_PATHS[context]

    const defaultSourcePath = config.custom

    if (!config) {
        return defaultSourcePath
    }

    if (!type) {
        return _values(config)
    }

    return config[type] || defaultSourcePath
}

/**
 * Return context and type of widget for passed source path (path on wrapper)
 * @param sourcePath - path of wrapper (ticket.customer.data, etc.)
 * @returns {{context: string, type: string}}
 */
export function getContextFromSourcePath(sourcePath: Array<string>): contextFromSourcePathType {
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
 * @param items
 * @param context
 * @param newWidgets
 * @returns {*}
 */
export function itemsWithUpdatedWidgets(items: itemsType = fromJS([]), context: contextType, newWidgets: {}): itemsType {
    const otherWidgets = itemsWithoutContext(items, context)
    return otherWidgets.merge(fromJS(newWidgets))
}

export function reorderWidgets(items: itemsType = fromJS([])): itemsType {
    return items.map((item, i) => item.set('order', i))
}
