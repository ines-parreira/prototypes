import { isGorgiasApiError } from 'models/api/types'

export const GENERIC_ENABLE_SKILL_ERROR =
    'An error occurred while enabling the skill.'

const formatTriggerConflict = (message: string) =>
    message.replace(
        /(\w+)::(\w+)/g,
        (_: string, group: string, name: string) =>
            `${group.charAt(0).toUpperCase() + group.slice(1)}/${name}`,
    )

export const getSkillEnableErrorMessage = (
    error: unknown,
    skillTitle: string,
): string => {
    if (!isGorgiasApiError(error)) {
        return GENERIC_ENABLE_SKILL_ERROR
    }

    const apiMessage = error.response.data.error.msg

    if (apiMessage.includes('already exists')) {
        if (apiMessage.includes('title')) {
            return `Another resource with name "${skillTitle}" already exists`
        }

        if (apiMessage.includes('identical content')) {
            return 'Another resource with identical instructions already exists'
        }

        return apiMessage
    }

    if (error.response.status === 409) {
        return formatTriggerConflict(apiMessage)
    }

    return GENERIC_ENABLE_SKILL_ERROR
}
