import type { TicketFieldsState } from '../store/useTicketFieldsStore'
import type { MacroTicketFieldValues } from './getMacroTicketFieldValues'

export const mergeTicketFieldsValues = (
    fields: TicketFieldsState,
    appliedMacroTicketFieldValues: MacroTicketFieldValues = {},
) => {
    return Object.entries(
        appliedMacroTicketFieldValues,
    ).reduce<TicketFieldsState>((acc, [key, value]) => {
        acc[Number(key)] = {
            ...acc[Number(key)],
            value: value,
        }
        return acc
    }, fields)
}
