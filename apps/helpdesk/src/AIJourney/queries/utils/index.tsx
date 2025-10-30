import { JourneyTypeEnum } from '@gorgias/convert-client'

export const aiJourneyKeys = {
    journeys: (
        integrationId: number | undefined,
        types?: JourneyTypeEnum[],
    ) => ['journeys', integrationId, types],
    journeyConfiguration: (journeyId: string | undefined) => [
        'journeyConfiguration',
        journeyId,
    ],
}
