import {fromJS, Map} from 'immutable'
import _forEach from 'lodash/forEach'

import {MacroActionName} from '../../models/macroAction/types'
import {getActionTemplate} from '../../utils'

import {MacroApiError} from './types'

export function generateDefaultAction(
    actionType: MacroActionName
): Maybe<Map<any, any>> {
    const actionTemplate = getActionTemplate(actionType)

    if (!actionTemplate) {
        return null
    }

    let ret = fromJS({
        type: 'user',
        execution: actionTemplate.execution,
        name: actionTemplate.name,
        title: actionTemplate.title,
        arguments: {},
    }) as Map<any, any>

    _forEach(
        (actionTemplate.arguments as {
            [key: string]: {default: Maybe<any>; type: string}
        }) || {},
        (arg, key) => {
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
        }
    )

    return ret
}

export function getDefaultMacro() {
    return fromJS({
        name: 'New macro',
        actions: [generateDefaultAction(MacroActionName.SetResponseText)],
    }) as Map<any, any>
}

export function getErrorReason(error: MacroApiError) {
    return Object.values(error.response.data.error.data?.actions || {})
        .reduce((errors: string[], action) => {
            Object.values(action).forEach((argumentsValue) => {
                argumentsValue.forEach((reason) => {
                    errors.push(
                        ...(typeof reason === 'string'
                            ? [reason]
                            : Object.values(reason))
                    )
                })
            })
            return errors
        }, [])
        .join(', ')
}
