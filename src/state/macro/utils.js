// @flow
import {fromJS} from 'immutable'
import {getActionTemplate} from '../../utils'
import _forEach from 'lodash/forEach'

import type {Map} from 'immutable'

export function generateDefaultAction(actionType: string): ?Map<*,*> {
    const actionTemplate = getActionTemplate(actionType)

    if (!actionTemplate) {
        return null
    }

    let ret = fromJS({
        type: 'user',
        execution: actionTemplate.execution,
        name: actionTemplate.name,
        title: actionTemplate.title,
        arguments: {}
    })

    _forEach(actionTemplate.arguments, (arg, key) => {
        let defaultValue = arg.default

        if (typeof arg.default === 'undefined') {
            switch (arg.type) {
                case 'string':
                    defaultValue = ''
                    break
                case 'integer':
                    defaultValue = null
                    break
                case 'listDict':
                    defaultValue = []
                    break
                case 'dict':
                    defaultValue = {}
                    break
                default:
                    break
            }
        }

        ret = ret.setIn(['arguments', key], fromJS(defaultValue))
    })

    return ret
}

export function getDefaultMacro() {
    return fromJS({
        name: 'New macro',
        actions: [
            generateDefaultAction('setResponseText')
        ]
    })
}
