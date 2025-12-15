import type { ColumnDef } from '@gorgias/axiom'
import { Box, createSortableColumn, Text } from '@gorgias/axiom'
import type { Integration } from '@gorgias/helpdesk-types'

import { assetsUrl } from 'utils'

import { SyncStatusBadge } from './SyncStatusBadge'
import { mapStatus } from './utils'

import css from './columns.less'

const zendeskLogo = assetsUrl('/img/integrations/zendesk.png')

export const columns: ColumnDef<Integration, unknown>[] = [
    createSortableColumn<Integration>('name', 'Account', (info) => {
        return (
            <Box gap="xs" alignItems="center">
                <img
                    alt="Zendesk logo"
                    className={css.logo}
                    src={zendeskLogo}
                />
                <Text variant="bold">{info.getValue() as string}</Text>
            </Box>
        )
    }),
    createSortableColumn<Integration>('updated_datetime', 'Status', (info) => {
        const { status, updatedDatetime } = mapStatus(info.row.original)
        return (
            <Box flexDirection="column" gap="xs" className={css.status}>
                <Text as="span">{status}</Text>
                {updatedDatetime && (
                    <Text as="p" size="xs" color="neutral-grey-5">
                        {updatedDatetime}
                    </Text>
                )}
            </Box>
        )
    }),
    createSortableColumn<Integration>(
        'meta.sync_tickets.count',
        'Tickets',
        (info) => {
            return <Box gap="xs">{info.getValue() as number}</Box>
        },
    ),
    createSortableColumn<Integration>(
        'meta.sync_macros.count',
        'Macros',
        (info) => {
            return <Box gap="xs">{info.getValue() as number}</Box>
        },
    ),
    createSortableColumn<Integration>(
        'meta.sync_users.customers_count',
        'Customers',
        (info) => {
            return <Box gap="xs">{info.getValue() as number}</Box>
        },
    ),
    createSortableColumn<Integration>(
        'meta.sync_users.users_count',
        'Users',
        (info) => {
            return <Box gap="xs">{info.getValue() as number}</Box>
        },
    ),
    {
        id: 'sync-status',
        header: '',
        cell: (info) => {
            return (
                <Box className={css.syncStatus} gap="xs">
                    <SyncStatusBadge integrationItem={info.row.original} />
                </Box>
            )
        },
    },
]
