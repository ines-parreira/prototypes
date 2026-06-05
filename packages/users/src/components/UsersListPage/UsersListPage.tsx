import { useEffect, useMemo } from 'react'

import { FullHeightPanel } from '@repo/layout'
import { UserRole } from '@repo/permissions'

import {
    Button,
    DataTable,
    DataTableSearch,
    PanelHeader,
    toast,
} from '@gorgias/axiom'
import type { PaginationState } from '@gorgias/axiom'
import type { User } from '@gorgias/helpdesk-queries'

import { useAllUsers } from '../../hooks/useAllUsers'
import { useAllUsersLoadingState } from '../../hooks/useAllUsersLoadingState'
import { usersListPageColumns } from './columns'

const AI_AGENT_CLIENT_ID = '658d6f54fbff9b7c6f2d0321'

// Stable reference: the DataTable owns the page index internally, so a fresh
// object each render would reset it back to page 0.
const DEFAULT_PAGINATION: PaginationState = {
    pageIndex: 0,
    pageSize: 20,
}

export function UsersListPage() {
    const users = useAllUsers()
    const { isLoading, isError } = useAllUsersLoadingState()

    const visibleUsers = useMemo(
        () => users.filter(isVisibleSettingsUser),
        [users],
    )

    useEffect(() => {
        if (isError) {
            toast.error('Failed to fetch users')
        }
    }, [isError])

    return (
        <FullHeightPanel>
            <PanelHeader
                title="Users"
                trailingSlot={
                    <Button as="a" href="/app/settings/users/add/">
                        Create user
                    </Button>
                }
            />
            <DataTable
                data={visibleUsers}
                columns={usersListPageColumns}
                isLoading={isLoading}
                search={{ enable: true }}
                sorting={{ enable: true }}
                filters={{ enable: true }}
                pagination={{ enable: true, defaultValue: DEFAULT_PAGINATION }}
                getRowHref={(user) => `/app/settings/users/${user.id}`}
                persistence={{
                    enable: true,
                    id: 'users-page',
                }}
            >
                <DataTableSearch placeholder="Search users..." />
            </DataTable>
        </FullHeightPanel>
    )
}

function isVisibleSettingsUser(user: User) {
    return (
        user.role?.name !== UserRole.Bot ||
        user.client_id === AI_AGENT_CLIENT_ID
    )
}
