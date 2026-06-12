import _forEach from 'lodash/forEach'

import type { Macro, MacroAction } from '@gorgias/helpdesk-queries'

import { MacroActionName } from '../../models/macroAction/types'
import { getActionTemplate } from '../../utils'
import type { MacroApiError } from './types'

export function generateDefaultAction(actionType: MacroActionName) {
    const actionTemplate = getActionTemplate(actionType)

    if (!actionTemplate) {
        return null
    }

    let ret = {
        type: 'user',
        execution: actionTemplate.execution,
        name: actionTemplate.name,
        title: actionTemplate.title,
        arguments: {},
    } as MacroAction

    _forEach(
        (actionTemplate.arguments as {
            [key: string]: { default: Maybe<any>; type: string }
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

            ret = {
                ...ret,
                arguments: {
                    ...ret.arguments,
                    [key]: defaultValue,
                },
            }
        },
    )

    return ret
}

export function getDefaultMacro() {
    return {
        name: 'New macro',
        actions: [generateDefaultAction(MacroActionName.SetResponseText)],
        language: '',
    } as unknown as Macro
}

export function getErrorReason({
    response: {
        data: {
            error: { data },
        },
    },
}: MacroApiError) {
    const { actions, name = [] } = data || {}

    return [
        ...Object.values(actions || {}).reduce<string[]>(
            (errors: string[], action) => {
                Object.values(action).forEach((argumentsValue) => {
                    argumentsValue.forEach((reason) => {
                        errors.push(
                            ...(typeof reason === 'string'
                                ? [reason]
                                : Object.values(reason)),
                        )
                    })
                })
                return errors
            },
            [],
        ),
        ...name,
    ].join(', ')
}
