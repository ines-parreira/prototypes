import type { ColumnDef } from '@gorgias/axiom'
import { Box, Text } from '@gorgias/axiom'
import type { Integration } from '@gorgias/helpdesk-types'

import { assetsUrl } from 'utils'

import { SyncStatusBadge } from './SyncStatusBadge'
import { mapStatus } from './utils'

import css from './columns.less'

const zendeskLogo = assetsUrl('/img/integrations/zendesk.png')

export const columns: ColumnDef<Integration, unknown>[] = [
    {
        id: 'name',
        accessorKey: 'name',
        header: 'Account',
        cell: (info) => {
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
        },
    },
    {
        id: 'updated_datetime',
        accessorKey: 'updated_datetime',
        header: 'Status',
        cell: (info) => {
            const { status, updatedDatetime } = mapStatus(info.row.original)
            return (
                <Box flexDirection="column" gap="xs" className={css.status}>
                    <Text as="span">{status}</Text>
                    {updatedDatetime && (
                        <Text as="p" size="xs" color="content-neutral-tertiary">
                            {updatedDatetime}
                        </Text>
                    )}
                </Box>
            )
        },
    },
    {
        id: 'tickets',
        accessorKey: 'meta.sync_tickets.count',
        header: 'Tickets',
        cell: (info) => {
            return <Box gap="xs">{info.getValue() as number}</Box>
        },
    },
    {
        id: 'macros',
        accessorKey: 'meta.sync_macros.count',
        header: 'Macros',
        cell: (info) => {
            return <Box gap="xs">{info.getValue() as number}</Box>
        },
    },
    {
        id: 'customers',
        accessorKey: 'meta.sync_users.customers_count',
        header: 'Customers',
        cell: (info) => {
            return <Box gap="xs">{info.getValue() as number}</Box>
        },
    },
    {
        id: 'users',
        accessorKey: 'meta.sync_users.users_count',
        header: 'Users',
        cell: (info) => {
            return <Box gap="xs">{info.getValue() as number}</Box>
        },
    },
    {
        id: 'sync-status',
        header: '',
        size: 100,
        cell: (info) => {
            return (
                <Box className={css.syncStatus} gap="xs">
                    <SyncStatusBadge integrationItem={info.row.original} />
                </Box>
            )
        },
    },
]
