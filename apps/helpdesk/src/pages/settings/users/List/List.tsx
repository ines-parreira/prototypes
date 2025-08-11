import React, { useEffect } from 'react'

import classnames from 'classnames'
import { Link } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { isStarterTier } from 'models/billing/utils'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import settingsCss from 'pages/settings/settings.less'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import UsersSettingsTable from './UsersSettingsTable'
import { useUserList } from './useUserList'

import css from './List.less'

const UserList = () => {
    const dispatch = useAppDispatch()
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const isStarterPlan = isStarterTier(currentHelpdeskPlan)
    const usersList = useUserList()
    const hasNoResults =
        usersList.params.search &&
        !usersList.isLoading &&
        !usersList.users.length

    useEffect(() => {
        if (usersList.isError) {
            void dispatch(
                notify({
                    message: 'Failed to fetch users',
                    status: NotificationStatus.Error,
                }),
            )
        }
    }, [dispatch, usersList.isError])

    return (
        <div className="full-width">
            <PageHeader title="Users">
                <div className="d-flex">
                    <Search
                        className="mr-2"
                        value={usersList.params.search || ''}
                        onChange={usersList.setSearch}
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
                            css.emptyWrapper,
                            'd-flex flex-column text-center full-height justify-content-center',
                        )}
                    >
                        <div className={css.emptyTitle}>No results</div>
                        <div className={css.emptyBody}>
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
                                isLoading={usersList.isLoading}
                                users={usersList.users}
                                onSortOptionsChange={usersList.setOrderBy}
                                options={usersList.params}
                            />
                            <Navigation
                                hasNextItems={usersList.hasNextItems}
                                hasPrevItems={usersList.hasPrevItems}
                                fetchNextItems={usersList.fetchNextItems}
                                fetchPrevItems={usersList.fetchPrevItems}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default UserList
