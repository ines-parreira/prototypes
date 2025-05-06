export enum PersuasionLevel {
    Educational = 'educational',
    Moderate = 'balanced',
    Assertive = 'aggressive',
}

type PersuasionLevelInfo = {
    label: string
    description: string
}
export const PersuasionLevelLabels: Record<
    PersuasionLevel,
    PersuasionLevelInfo
> = {
    [PersuasionLevel.Educational]: {
        label: 'Educational',
        description:
            'Provide helpful information to build customer confidence, without pressure.',
    },
    [PersuasionLevel.Moderate]: {
        label: 'Moderate',
        description:
            'Strike a balance between providing educational information and encouraging a purchase.',
    },
    [PersuasionLevel.Assertive]: {
        label: 'Promotional',
        description:
            'Drive purchases by confidently recommending products and encouraging immediate action.',
    },
}

export const PersuasionLevelSteps = Object.entries(PersuasionLevelLabels).map(
    ([key, { label }]) => ({ key, label }),
)
