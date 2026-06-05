import { UserRole } from '@repo/permissions'

import {
    createColumnHelper,
    DataTableBaseCell,
    DataTableBooleanFilter,
    DataTableMultiSelectFilter,
    DataTableTextCell,
    MultiSelectItem,
    Tag,
} from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-queries'

import { UserAvatar } from '../UserAvatar'
import { ROLE_CONFIG, UserRoleTag } from '../UserRoleTag'

const roleFilterItems = Object.entries(ROLE_CONFIG).map(([value, config]) => ({
    id: value,
    label: config.label,
}))

const columnHelper = createColumnHelper<User>()

export const usersListPageColumns = [
    columnHelper.accessor((user) => user.name ?? user.email ?? '', {
        id: 'name',
        header: 'User',
        enableSorting: true,
        cell: (info) => (
            <DataTableTextCell
                {...info}
                variant="bold"
                overflow="ellipsis"
                leadingSlot={<UserAvatar user={info.row.original} />}
            />
        ),
    }),
    columnHelper.accessor((user) => user.email ?? '', {
        id: 'email',
        header: 'Email',
        enableSorting: true,
    }),
    columnHelper.accessor((user) => user.role?.name, {
        id: 'role',
        header: 'Role',
        enableSorting: true,
        cell: (info) => (
            <DataTableBaseCell {...info}>
                <UserRoleTag user={info.row.original} />
            </DataTableBaseCell>
        ),
        filter: (
            <DataTableMultiSelectFilter items={roleFilterItems}>
                {(item) => <MultiSelectItem label={item.label} />}
            </DataTableMultiSelectFilter>
        ),
    }),
    columnHelper.accessor(
        (user) =>
            user.role?.name === UserRole.Bot ? undefined : user.has_2fa_enabled,
        {
            id: 'has_2fa_enabled',
            header: '2FA',
            enableSorting: true,
            cell: (info) => {
                const enabled = info.getValue()
                return (
                    <DataTableBaseCell {...info}>
                        <Tag
                            color={
                                enabled === undefined
                                    ? 'grey'
                                    : enabled
                                      ? 'green'
                                      : 'red'
                            }
                        >
                            {enabled === undefined
                                ? 'N/A'
                                : enabled
                                  ? 'Enabled'
                                  : 'Disabled'}
                        </Tag>
                    </DataTableBaseCell>
                )
            },
            filter: <DataTableBooleanFilter />,
        },
    ),
]
