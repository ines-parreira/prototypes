export enum QaScoreDimensions {
    LANGUAGE_PROFICIENCY = 'language_proficiency',
    RESOLUTION_COMPLETENESS = 'resolution_completeness',
    ACCURACY = 'accuracy',
    INTERNAL_COMPLIANCE = 'internal_compliance',
    EFFICIENCY = 'efficiency',
    COMMUNICATION_SKILLS = 'communication_skills',
    BRAND_VOICE = 'brand_voice',
}

export const RESOLUTION_COMPLETENESS_OPTIONS = [
    { value: 0, label: 'Incomplete' },
    { value: 1, label: 'Complete' },
]

export const QA_SCORE_DIMENSIONS = [
    {
        value: QaScoreDimensions.LANGUAGE_PROFICIENCY,
        label: 'Language proficiency',
    },
    {
        value: QaScoreDimensions.RESOLUTION_COMPLETENESS,
        label: 'Resolution completeness',
    },
    { value: QaScoreDimensions.ACCURACY, label: 'Accuracy' },
    {
        value: QaScoreDimensions.INTERNAL_COMPLIANCE,
        label: 'Internal compliance',
    },
    { value: QaScoreDimensions.EFFICIENCY, label: 'Efficiency' },
    { value: QaScoreDimensions.COMMUNICATION_SKILLS, label: 'Communication' },
    { value: QaScoreDimensions.BRAND_VOICE, label: 'Brand voice' },
]

export const getQaScoreDimensionFromObjectPath = (path: string) => {
    const regex = /\[([^\]]+)\]/
    const match = path.match(regex)
    if (!match) {
        return null
    }

    const value = match[1]

    return QA_SCORE_DIMENSIONS.some((dimension) => dimension.value === value)
        ? (value as QaScoreDimensions)
        : null
}
