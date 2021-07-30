import {fromJS, Map, List} from 'immutable'

import {getActionTemplate} from '../../../../utils'
import {getDefaultMacro} from '../../../../state/macro/utils'

export const isMacroDisabled = (
    macro: Map<any, any>,
    disableExternalActions?: boolean
) => {
    if (!disableExternalActions) {
        return false
    }

    return (macro.get('actions', fromJS([])) as List<any>).some(
        (action: Map<any, any>) => {
            const actionTemplate = getActionTemplate(action.get('name'))
            return !!actionTemplate && actionTemplate.execution === 'back'
        }
    )
}

export const getDefaultSelectedMacroId = (
    macros: List<any>,
    selectedMacroId: Maybe<number>,
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
        return macros.getIn([0, 'id']) as number
    }
    return selectedMacroId
}

export const getCurrentMacro = (
    macros: List<any>,
    selectedMacroId: Maybe<number>,
    isCreatingMacro?: boolean
) => {
    if (isCreatingMacro) {
        return getDefaultMacro()
    }
    return (macros.find(
        (macro: Map<any, any>) => macro.get('id') === selectedMacroId
    ) || fromJS({})) as Map<any, any>
}
