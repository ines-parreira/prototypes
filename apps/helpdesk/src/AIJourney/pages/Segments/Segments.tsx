import { Box, Button, Heading, Size } from '@gorgias/axiom'

import { SegmentsTable } from 'AIJourney/components'

export type Segment = {
    id: number
    name: string
    conditions: string
    count: number
    created_datetime: string
    updated_datetime: string
}

const MOCK_SEGMENTS: Segment[] = [
    {
        id: 1,
        name: 'Support small business',
        conditions: 'gt(shopper.lifetime_value, 1000)',
        count: 0,
        created_datetime: '2026-01-15T00:00:00',
        updated_datetime: '2026-09-12T00:00:00',
    },
    {
        id: 2,
        name: 'Super brand like really super',
        conditions: 'gt(shopper.lifetime_value, 1000)',
        count: 98762,
        created_datetime: '2026-01-15T00:00:00',
        updated_datetime: '2026-01-20T00:00:00',
    },
]

export const Segments = () => {
    return (
        <Box width="100%" flexDirection="column">
            <Box m={Size.Lg} flexDirection="column">
                <Box alignItems="center" justifyContent="space-between">
                    <Heading size="xl">Segments</Heading>
                    <Button
                        variant="secondary"
                        leadingSlot="cloud"
                        onClick={() => {}}
                    >
                        Create segment
                    </Button>
                </Box>
            </Box>
            <SegmentsTable
                data={MOCK_SEGMENTS}
                onSegmentClick={() => {}}
                onEditClick={() => {}}
                onDuplicateClick={() => {}}
                onDeleteClick={() => {}}
            />
        </Box>
    )
}
