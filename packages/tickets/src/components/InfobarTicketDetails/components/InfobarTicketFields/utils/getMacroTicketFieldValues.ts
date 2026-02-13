import type { Macro } from '@gorgias/helpdesk-types'

import { MacroActionName } from '../../../../../utils/macros/types'

type MacroValue = string | number | boolean | undefined
export type MacroTicketFieldValues = Record<number, MacroValue>

export function getMacroTicketFieldValues(
    macro: Macro | undefined,
): MacroTicketFieldValues {
    if (!macro || !macro.actions) return {}

    return macro.actions.reduce<MacroTicketFieldValues>((acc, action) => {
        if (
            action.name === MacroActionName.SetCustomFieldValue &&
            action.arguments.value !== ''
        ) {
            const customFieldId = action.arguments.custom_field_id as
                | number
                | undefined

            if (customFieldId) {
                acc[customFieldId] = action.arguments.value as MacroValue
            }
        }
        return acc
    }, {})
}
