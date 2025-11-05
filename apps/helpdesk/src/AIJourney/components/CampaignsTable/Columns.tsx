import { Link } from 'react-router-dom'

import {
    Box,
    Button,
    ColumnDef,
    createSortableColumn,
    Text,
} from '@gorgias/axiom'
import { JourneyApiDTO } from '@gorgias/convert-client'

import { JOURNEY_TYPES_MAP_TO_URL } from 'AIJourney/constants'

import { CampaignsTableMeta } from './types'

export const columns: ColumnDef<JourneyApiDTO, unknown>[] = [
    createSortableColumn<JourneyApiDTO>('campaign.title', 'Title', (info) => {
        const storeName = info.row.original.store_name
        const journeyType = info.row.original.type
        const journeyId = info.row.original.id
        return (
            <Box gap="xxxs" minWidth="200px">
                <Link
                    to={`/app/ai-journey/${storeName}/${JOURNEY_TYPES_MAP_TO_URL[journeyType]}/setup/${journeyId}`}
                >
                    <Text variant="bold">{info.getValue() as string}</Text>
                </Link>
            </Box>
        )
    }),
    createSortableColumn<JourneyApiDTO>('campaign.state', 'Status', (info) => {
        return (
            <Box gap="xxxs" minWidth="200px">
                {info.getValue() as string}
            </Box>
        )
    }),
    {
        id: 'actions',
        cell: (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <Button
                    as="button"
                    icon="delete_outline"
                    intent="regular"
                    size="sm"
                    variant="tertiary"
                    onClick={() => meta.onRemoveClick(info.row.original.id)}
                />
            )
        },
    },
]
