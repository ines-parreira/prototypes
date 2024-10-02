import {CustomField} from 'models/customField/types'
import {NonNullProperties} from './types'

export const filterNonNull = <T extends object>(
    obj: T
): Partial<NonNullProperties<T>> => {
    const result: Partial<NonNullProperties<T>> = {}

    Object.entries(obj).forEach(([key, value]) => {
        if (value !== null) {
            result[key as keyof T] = value
        }
    })

    return result
}

export const isHandoffEnabled = (silentHandover: boolean) => !silentHandover

export const isAiAgentEnabled = (deactivatedDatetime: string | null) => {
    return deactivatedDatetime === null
}

export const isAiAgentCustomField = (customField: CustomField) =>
    ['AI Intent', 'AI Agent Outcome'].includes(customField.label)
