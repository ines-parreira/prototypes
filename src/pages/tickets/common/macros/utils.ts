import { Macro } from '@gorgias/api-queries'

import { ActionTemplateExecution } from 'config'
import { getDefaultMacro } from 'state/macro/utils'
import { getActionTemplate } from 'utils'

export const isMacroDisabled = (
    macro: Macro,
    areExternalActionsDisabled?: boolean,
) => {
    if (!areExternalActionsDisabled) return false

    return macro.actions?.some(
        (action) =>
            getActionTemplate(action.name)?.execution ===
            ActionTemplateExecution.External,
    )
}

export const getDefaultSelectedMacroId = (
    macros: Macro[],
    selectedMacroId: number | null,
    isCreatingMacro?: boolean,
) => {
    const currentMacro = getCurrentMacro(
        macros,
        selectedMacroId,
        isCreatingMacro,
    )
    if (!macros.length) {
        return null
    }
    // selectedMacroId not in macro list
    if (!currentMacro) {
        return macros[0].id!
    }
    return selectedMacroId
}

export const getCurrentMacro = (
    macros: (Macro | undefined)[],
    selectedMacroId: Maybe<number>,
    isCreatingMacro?: boolean,
) => {
    if (isCreatingMacro) {
        return getDefaultMacro()
    }
    return macros.find((macro) => macro?.id === selectedMacroId)
}
