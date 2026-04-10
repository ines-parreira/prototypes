import type { JourneyTypeEnum } from '@gorgias/convert-client'
import type { ListSegmentsParams } from '@gorgias/customer-segmentation-types'

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
        [...aiJourneyKeys.all(), 'journeyConfiguration', journeyId] as const,
    segmentsAll: () => [...aiJourneyKeys.all(), 'segments'] as const,
    conditionsMetadata: () =>
        [...aiJourneyKeys.all(), 'conditionsMetadata'] as const,
    segments: (
        integrationId?: number,
        params?: Omit<ListSegmentsParams, 'integration_id'>,
    ) => [...aiJourneyKeys.all(), 'segments', integrationId, params] as const,
}
