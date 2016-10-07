import {fromJS} from 'immutable'

/**
 * Return item from items list where context matches
 * @param items
 * @param context
 * @returns {*}
 */
export function itemsWithContext(items = fromJS([]), context) {
    return items
        .filter((w) => w.get('context', '') === context)
}

export function itemsWithoutContext(items = fromJS([]), context) {
    return items
        .filter((w) => w.get('context', '') !== context)
}

/**
 * Return items with passed new widget where context matches
 * @param items
 * @param context
 * @param newWidgets
 * @returns {*}
 */
export function itemsWithUpdatedWidgets(items = fromJS([]), context, newWidgets) {
    const otherWidgets = itemsWithoutContext(items, context)
    return otherWidgets.merge(fromJS(newWidgets))
}

export function reorderWidgets(items = fromJS([])) {
    return items.map((item, i) => {
        const updatedItem = item
        updatedItem.set('order', i)
        return updatedItem
    })
}
