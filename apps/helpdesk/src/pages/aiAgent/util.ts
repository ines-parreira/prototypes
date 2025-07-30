import { AI_MANAGED_TYPES } from 'custom-fields/constants'
import { CustomField } from 'custom-fields/types'

import {
    GUIDANCE_ARTICLE_LIMIT,
    GUIDANCE_ARTICLE_LIMIT_WARNING,
    NEW_GUIDANCE_ARTICLE_LIMIT,
    NEW_GUIDANCE_ARTICLE_LIMIT_WARNING,
} from './constants'
import { NonNullProperties } from './types'

export const filterNonNull = <T extends object>(
    obj: T,
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

export const getGuidanceArticleLimitWarning = (
    isIncreaseGuidanceCreationLimit: boolean,
) => {
    return isIncreaseGuidanceCreationLimit
        ? NEW_GUIDANCE_ARTICLE_LIMIT_WARNING
        : GUIDANCE_ARTICLE_LIMIT_WARNING
}

export const getGuidanceArticleLimit = (
    isIncreaseGuidanceCreationLimit: boolean,
) => {
    return isIncreaseGuidanceCreationLimit
        ? NEW_GUIDANCE_ARTICLE_LIMIT
        : GUIDANCE_ARTICLE_LIMIT
}
