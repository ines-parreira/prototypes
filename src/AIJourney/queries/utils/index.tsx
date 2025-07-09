export const aiJourneyKeys = {
    journeys: (integrationId: number | undefined) => [
        'journeys',
        integrationId,
    ],
    journeyConfiguration: (journeyId: string | undefined) => [
        'journeyConfiguration',
        journeyId,
    ],
}
