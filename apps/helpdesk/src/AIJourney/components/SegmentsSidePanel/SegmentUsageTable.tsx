import { useMemo } from 'react'

import {
    Box,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Text,
} from '@gorgias/axiom'
import { AudienceListSource, JourneyTypeEnum } from '@gorgias/convert-client'
import type {
    JourneyCampaignStateEnum,
    JourneyStatusEnum,
} from '@gorgias/convert-client'

import { JourneyStateBadge } from 'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge'
import { JOURNEY_TYPE_MAP_TO_STRING, JOURNEY_TYPES } from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'
import { useAudiencesUsage } from 'AIJourney/queries/UseAudiencesUsage/UseAudiencesUsage'

type EnrichedUsageRow = {
    id: string
    name: string
    type: string
    state: JourneyStatusEnum | JourneyCampaignStateEnum | undefined
    isCampaign: boolean
}

export const SegmentUsageTable = ({ segmentId }: { segmentId: string }) => {
    const { currentIntegration, journeys, campaigns } = useJourneyContext()
    const { data: audienceUsage, isLoading } = useAudiencesUsage(
        currentIntegration?.id,
    )

    const usageItems = useMemo<EnrichedUsageRow[]>(() => {
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
    }, [audienceUsage, segmentId, journeys, campaigns])

    if (isLoading) {
        return <Skeleton />
    }

    return (
        <Table withBorder>
            <TableHeader>
                <TableRow>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {usageItems.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Box justifyContent="center">
                                <Text>This segment is not in use</Text>
                            </Box>
                        </TableCell>
                    </TableRow>
                ) : (
                    usageItems.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell>{row.name}</TableCell>
                            <TableCell>
                                {row.type === JOURNEY_TYPES.CAMPAIGN
                                    ? 'Campaign'
                                    : 'Flow'}
                            </TableCell>
                            <TableCell>
                                {row.state ? (
                                    <JourneyStateBadge
                                        state={row.state}
                                        isCampaign={row.isCampaign}
                                    />
                                ) : (
                                    <Text>—</Text>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}
