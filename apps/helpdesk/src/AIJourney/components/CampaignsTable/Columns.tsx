import {
    Box,
    Button,
    ColumnDef,
    createSortableColumn,
    Text,
} from '@gorgias/axiom'
import { JourneyApiDTO } from '@gorgias/convert-client'

import { CampaignsTableMeta } from './types'

export const columns: ColumnDef<JourneyApiDTO, unknown>[] = [
    createSortableColumn<JourneyApiDTO>('campaign.title', 'Title', (info) => {
        return (
            <Box gap="xxxs" minWidth="200px">
                <Text variant="bold">{info.getValue() as string}</Text>
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
