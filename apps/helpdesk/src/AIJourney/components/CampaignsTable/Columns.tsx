import type { ColumnDef } from '@gorgias/axiom'
import { Box, createSortableColumn } from '@gorgias/axiom'
import type {
    JourneyApiDTO,
    JourneyCampaignStateEnum,
} from '@gorgias/convert-client'

import type { UpdatableJourneyCampaignState } from '../../constants'
import CampaignName from './CampaignName/CampaignName'
import CampaignStateBadge from './CampaignStateBadge/CampaignStateBadge'
import { MoreOptions } from './MoreOptions/MoreOptions'
import type { CampaignsTableMeta } from './types'

export const columns: ColumnDef<JourneyApiDTO, unknown>[] = [
    createSortableColumn<JourneyApiDTO>('campaign.title', 'Title', (info) => {
        const storeName = info.row.original.store_name
        const journeyType = info.row.original.type
        const journeyId = info.row.original.id
        return (
            <Box gap="xs">
                <CampaignName
                    name={info.getValue() as string}
                    storeName={storeName}
                    journeyType={journeyType}
                    journeyId={journeyId}
                />
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
                        handleChangeStatus={(
                            status: UpdatableJourneyCampaignState,
                        ) => {
                            meta.onChangeStatus(info.row.original.id, status)
                        }}
                        handleCancelClick={() =>
                            meta.onCancelClick(info.row.original.id)
                        }
                        handleRemoveClick={() =>
                            meta.onRemoveClick(info.row.original.id)
                        }
                        handleSendClick={() =>
                            meta.onSendClick(info.row.original.id)
                        }
                        handleDuplicateClick={() =>
                            meta.onDuplicateClick(info.row.original)
                        }
                    />
                </Box>
            )
        },
    },
]
