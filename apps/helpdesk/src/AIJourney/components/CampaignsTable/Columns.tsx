import { Link } from 'react-router-dom'

import { Box, ColumnDef, createSortableColumn, Text } from '@gorgias/axiom'
import {
    JourneyApiDTO,
    JourneyCampaignStateEnum,
} from '@gorgias/convert-client'

import { JOURNEY_TYPES_MAP_TO_URL } from 'AIJourney/constants'

import CampaignStateBadge from './CampaignStateBadge/CampaignStateBadge'
import { MoreOptions } from './MoreOptions/MoreOptions'
import { CampaignsTableMeta } from './types'

export const columns: ColumnDef<JourneyApiDTO, unknown>[] = [
    createSortableColumn<JourneyApiDTO>('campaign.title', 'Title', (info) => {
        const storeName = info.row.original.store_name
        const journeyType = info.row.original.type
        const journeyId = info.row.original.id
        return (
            <Box gap="xs">
                <Link
                    to={`/app/ai-journey/${storeName}/${JOURNEY_TYPES_MAP_TO_URL[journeyType]}/setup/${journeyId}`}
                >
                    <Text variant="bold" color="black">
                        {info.getValue() as string}
                    </Text>
                </Link>
            </Box>
        )
    }),
    createSortableColumn<JourneyApiDTO>('campaign.state', 'Status', (info) => {
        return (
            <Box gap="xs">
                <CampaignStateBadge
                    state={info.getValue() as JourneyCampaignStateEnum}
                />
            </Box>
        )
    }),
    {
        id: 'actions',
        cell: (info) => {
            const meta = info.table.options.meta as CampaignsTableMeta
            return (
                <Box gap="xs">
                    <MoreOptions
                        shopName={info.row.original.store_name}
                        journeyId={info.row.original.id}
                        state={info.row.original.campaign?.state!}
                        handleChangeStatus={() => {}}
                        handleRemoveClick={() =>
                            meta.onRemoveClick(info.row.original.id)
                        }
                        handleSendClick={() =>
                            meta.onSendClick(info.row.original.id)
                        }
                    />
                </Box>
            )
        },
    },
]
