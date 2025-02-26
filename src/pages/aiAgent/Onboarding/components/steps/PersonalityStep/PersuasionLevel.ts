export enum PersuasionLevel {
    Educational = 'educational',
    Moderate = 'balanced',
    Assertive = 'assertive',
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
            'Focuses on providing detailed information to guide the customer without pressure.',
    },
    [PersuasionLevel.Moderate]: {
        label: 'Moderate',
        description:
            'Strikes a balance between educating the customer and encouraging them to make a purchase.',
    },
    [PersuasionLevel.Assertive]: {
        label: 'Assertive',
        description:
            'Prioritizes driving the sale with a strong focus on persuasion and urgency.',
    },
}

export const PersuasionLevelSteps = Object.entries(PersuasionLevelLabels).map(
    ([key, { label }]) => ({ key, label }),
)
