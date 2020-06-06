// @flow

import {type Map} from 'immutable'
import _isObject from 'lodash/isObject'
import _isFunction from 'lodash/isFunction'

export function infobarWidgetShouldRender(source: Map<*, *>): boolean {
    // prevent buggy display if source...
    // ... is empty
    if (!source) {
        return false
    }

    // ... is not an object
    if (!_isObject(source)) {
        return false
    }

    // ... is not immutable
    if (!source.isEmpty || (source.isEmpty && !_isFunction(source.isEmpty))) {
        return false
    }

    // ... is an empty Immutable
    if (source.isEmpty()) {
        return false
    }

    return true
}
