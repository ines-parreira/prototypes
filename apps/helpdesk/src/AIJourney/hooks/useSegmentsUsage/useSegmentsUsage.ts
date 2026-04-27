import { useMemo } from 'react'

import { AudienceListSource, JourneyTypeEnum } from '@gorgias/convert-client'
import type {
    JourneyCampaignStateEnum,
    JourneyStatusEnum,
} from '@gorgias/convert-client'

import { JOURNEY_TYPE_MAP_TO_STRING } from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'
import { useAudiencesUsage } from 'AIJourney/queries'

export type EnrichedUsageRow = {
    id: string
    name: string
    type: string
    state: JourneyStatusEnum | JourneyCampaignStateEnum | undefined
    isCampaign: boolean
}

export const useSegmentsUsage = (segmentId?: string) => {
    const { currentIntegration, journeys, campaigns } = useJourneyContext()
    const { data: audienceUsage, isLoading } = useAudiencesUsage(
        currentIntegration?.id,
    )

    const segmentUsage = useMemo<EnrichedUsageRow[]>(() => {
        if (!audienceUsage) return []

        const audienceEntry = audienceUsage.data.find(
            (entry) =>
                entry.identifier === segmentId &&
                entry.source === AudienceListSource.Gorgias,
        )

        if (!audienceEntry) return []

        const allJourneys = [...(journeys ?? []), ...(campaigns ?? [])]

        return audienceEntry.usage.map((usageItem) => {
            const journey = allJourneys.find((j) => j.id === usageItem.id)
            const isCampaign = journey?.type === JourneyTypeEnum.Campaign

            const name = isCampaign
                ? (journey?.campaign?.title ?? '—')
                : (JOURNEY_TYPE_MAP_TO_STRING[
                      journey?.type as keyof typeof JOURNEY_TYPE_MAP_TO_STRING
                  ] ?? '—')

            const state = isCampaign ? journey?.campaign?.state : journey?.state

            return {
                id: usageItem.id,
                name,
                type: journey?.type ?? usageItem.type,
                state,
                isCampaign,
            }
        })
    }, [audienceUsage, campaigns, journeys, segmentId])

    return {
        segmentUsage,
        isLoading,
    }
}
