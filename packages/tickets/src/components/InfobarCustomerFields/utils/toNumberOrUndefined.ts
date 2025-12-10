import type { InputSettingsNumber } from '@gorgias/helpdesk-types'

/**
 * Converting min/max types from InputSettingsNumber (min/max) to NumberField component props (number | undefined)
 */
export function toNumberOrUndefined(
    value: InputSettingsNumber['min'] | InputSettingsNumber['max'],
): number | undefined {
    if (value === null || value === undefined) {
        return undefined
    }
    return typeof value === 'number' ? value : Number(value)
}
