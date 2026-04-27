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

import { JourneyStateBadge } from 'AIJourney/components/JourneysTable/JourneyStateBadge/JourneyStateBadge'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import type { EnrichedUsageRow } from 'AIJourney/hooks/useSegmentsUsage/useSegmentsUsage'

export const SegmentUsageTable = ({
    segmentUsage,
    isLoading,
}: {
    segmentUsage: EnrichedUsageRow[]
    isLoading: boolean
}) => {
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
                {segmentUsage.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={3}>
                            <Box justifyContent="center">
                                <Text>This segment is not in use</Text>
                            </Box>
                        </TableCell>
                    </TableRow>
                ) : (
                    segmentUsage.map((row) => (
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
