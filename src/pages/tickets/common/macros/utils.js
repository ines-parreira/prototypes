// @flow
import {fromJS} from 'immutable'

import type {Map} from 'immutable'

import {getActionTemplate} from '../../../../utils.ts'
import {getDefaultMacro} from '../../../../state/macro/utils.ts'

export const isMacroDisabled = (
    macro: Object,
    disableExternalActions?: boolean
) => {
    if (!disableExternalActions) {
        return false
    }

    return macro.get('actions', fromJS([])).some((action) => {
        const actionTemplate = getActionTemplate(action.get('name'))
        return actionTemplate && actionTemplate.execution === 'back'
    })
}

export const getDefaultSelectedMacroId = (
    macros: Map<any, any>,
    selectedMacroId: ?number,
    isCreatingMacro?: boolean
) => {
    const currentMacro = getCurrentMacro(
        macros,
        selectedMacroId,
        isCreatingMacro
    )
    if (macros.isEmpty()) {
        return null
    }
    // selectedMacroId not in macro list
    if (currentMacro.isEmpty()) {
        return macros.getIn([0, 'id'])
    }
    return selectedMacroId
}

export const getCurrentMacro = (
    macros: Map<any, any>,
    selectedMacroId: ?number,
    isCreatingMacro?: boolean
) => {
    if (isCreatingMacro) {
        return getDefaultMacro()
    }
    return (
        macros.find((macro) => macro.get('id') === selectedMacroId) ||
        fromJS({})
    )
}
