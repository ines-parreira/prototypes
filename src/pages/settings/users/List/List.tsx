import React, { useCallback, useEffect, useState } from 'react'

import classnames from 'classnames'
import { Link } from 'react-router-dom'

import { ListUsersParams, useListUsers } from '@gorgias/api-queries'
import {
    ListUsersOrderBy,
    ListUsersRelationshipsItem,
} from '@gorgias/api-types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { isStarterTier } from 'models/billing/utils'
import { UserSortableProperties } from 'models/user/types'
import Button from 'pages/common/components/button/Button'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import settingsCss from 'pages/settings/settings.less'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import UsersSettingsTable from './UsersSettingsTable'

import css from './List.less'

const STALE_TIME_MS = 5 * 60 * 1000 // 5 minutes (in ms)
const AGENTS_PER_PAGE = 15

const UserList = () => {
    const dispatch = useAppDispatch()
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const isStarterPlan = isStarterTier(currentHelpdeskPlan)

    const [listUsersParams, setListUsersParams] = useState<ListUsersParams>({
        order_by: ListUsersOrderBy.NameAsc,
    })

    const { data, isLoading, isError } = useListUsers(
        {
            ...listUsersParams,
            relationships: [ListUsersRelationshipsItem.AvailabilityStatus],
            limit: AGENTS_PER_PAGE,
        },
        {
            query: { staleTime: STALE_TIME_MS, keepPreviousData: true },
        },
    )
    const users = data?.data.data
    const hasNoResults = listUsersParams.search && !isLoading && !users?.length

    useEffect(() => {
        if (isError) {
            void dispatch(
                notify({
                    message: 'Failed to fetch users',
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [dispatch, isError])

    const fetchPrevItems = useCallback(() => {
        setListUsersParams({
            ...listUsersParams,
            cursor: data?.data.meta.prev_cursor ?? undefined,
        })
    }, [data?.data.meta.prev_cursor, listUsersParams])

    const fetchNextItems = useCallback(() => {
        setListUsersParams({
            ...listUsersParams,
            cursor: data?.data.meta.next_cursor ?? undefined,
        })
    }, [data?.data.meta.next_cursor, listUsersParams])

    const onSortOptionsChange = useCallback(
        (order_by: UserSortableProperties, order_dir: OrderDirection) =>
            setListUsersParams({
                ...listUsersParams,
                order_by: `${order_by}:${order_dir}` as ListUsersOrderBy,
                cursor: undefined,
            }),
        [listUsersParams],
    )

    const onSearchChange = useCallback(
        (search: string) => {
            setListUsersParams({
                ...listUsersParams,
                search,
                cursor: undefined,
            })
        },
        [listUsersParams],
    )

    return (
        <div className="full-width">
            <PageHeader title="Users">
                <div className="d-flex">
                    <Search
                        className="mr-2"
                        value={listUsersParams.search || ''}
                        onChange={onSearchChange}
                        placeholder="Search users..."
                        searchDebounceTime={300}
                    />
                    <Link to="/app/settings/users/add/">
                        <Button>Create user</Button>
                    </Link>
                </div>
            </PageHeader>

            <div
                className={classnames(settingsCss.pageContainer, css.container)}
            >
                {hasNoResults ? (
                    <div
                        className={classnames(
                            css.empty,
                            'd-flex flex-column text-center full-height justify-content-center',
                        )}
                    >
                        <h3 className="font-weight-bold mb-2">No results</h3>
                        <div>
                            You may want to try using a different name, email or
                            check for typos.
                        </div>
                    </div>
                ) : (
                    <>
                        <p>
                            Create and manage Gorgias users. You can{' '}
                            <strong>
                                {isStarterPlan
                                    ? 'add up to 3 users'
                                    : 'add as many users as you need'}
                            </strong>
                            , at no additional cost.
                        </p>
                        <div className={css.table}>
                            <UsersSettingsTable
                                isLoading={isLoading}
                                users={users}
                                onSortOptionsChange={onSortOptionsChange}
                                options={listUsersParams}
                            />
                            <Navigation
                                className={css.navigation}
                                hasNextItems={!!data?.data.meta.next_cursor}
                                hasPrevItems={!!data?.data.meta.prev_cursor}
                                fetchNextItems={fetchNextItems}
                                fetchPrevItems={fetchPrevItems}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default UserList
