import {fromJS, Map} from 'immutable'
import _forEach from 'lodash/forEach'

import {MacroActionName} from '../../models/macroAction/types'
import {getActionTemplate} from '../../utils.js'

export function generateDefaultAction(
    actionType: MacroActionName
): Maybe<Map<any, any>> {
    //$TsFixMe remove cast once getActionTemplate is migrated
    const actionTemplate = getActionTemplate(actionType) as Maybe<
        Record<string, unknown>
    >

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
