import { JourneyTypeEnum } from '@gorgias/convert-client'

export const aiJourneyKeys = {
    all: () => ['journeys'] as const,
    journeys: (
        integrationId: number | undefined,
        types?: JourneyTypeEnum[],
    ) => {
        const base = [...aiJourneyKeys.all(), integrationId] as const
        return types ? ([...base, { types }] as const) : base
    },
    journeyConfiguration: (journeyId: string | undefined) =>
        ['journeyConfiguration', journeyId] as const,
}
