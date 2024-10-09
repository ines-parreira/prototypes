import {CustomField} from 'custom-fields/types'
import {AI_MANAGED_TYPES} from 'custom-fields/constants'
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
    customField.managed_type !== null &&
    Object.values(AI_MANAGED_TYPES).includes(customField.managed_type)
