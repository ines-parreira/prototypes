import React, {useEffect} from 'react'
import cs from 'classnames'
import {Link} from 'react-router-dom'
import {Container} from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {usePaginatedQuery} from 'hooks/usePaginatedQuery/usePaginatedQuery'
import {AgentsRelationshipsParam} from 'models/agents/types'
import {isStarterTierPrice} from 'models/billing/utils'
import {useListAgent} from 'models/agents/queries'
import Button from 'pages/common/components/button/Button'
import Spinner from 'pages/common/components/Spinner'
import Navigation from 'pages/common/components/Navigation/Navigation'
import PageHeader from 'pages/common/components/PageHeader'
import settingsCss from 'pages/settings/settings.less'
import {notify} from 'state/notifications/actions'
import {getCurrentHelpdeskProduct} from 'state/billing/selectors'
import {getAccountOwnerId} from 'state/currentAccount/selectors'
import {NotificationStatus} from 'state/notifications/types'

import css from './List.less'
import Row from './Row'

const STALE_TIME = 1000 * 60 * 5 // 5 minutes
const AGENTS_PER_PAGE = 15

const UserList = () => {
    const dispatch = useAppDispatch()

    const accountOwnerId = useAppSelector(getAccountOwnerId)

    const paginatedAgents = usePaginatedQuery(
        useListAgent,
        {
            limit: AGENTS_PER_PAGE,
            relationships: AgentsRelationshipsParam.AvailabilityStatus,
        },
        {keepPreviousData: true, staleTime: STALE_TIME, retry: false}
    )

    useEffect(() => {
        if (paginatedAgents.error) {
            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: "Couldn't load user list. Please try again.",
                })
            )
        }
    }, [paginatedAgents.error, dispatch])

    const {data: {data: agents = []} = {}} = paginatedAgents.data ?? {}

    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskProduct)
    const isStarterPlan = isStarterTierPrice(currentHelpdeskPlan)

    return (
        <div className={cs('full-width')}>
            <PageHeader title="Users">
                <Link to="/app/settings/users/add/">
                    <Button>Create user</Button>
                </Link>
            </PageHeader>

            <Container fluid className={settingsCss.pageContainer}>
                <p>
                    Create and manage Gorgias users. You can{' '}
                    <strong>
                        {isStarterPlan
                            ? 'add up to 3 users'
                            : 'add as many users as you need'}
                    </strong>
                    , at no additional cost.
                </p>
                <div className={css.listWrapper}>
                    <span className={css.listHeader}>
                        <span className={cs(css.cell, css.avatar)}>User</span>
                        <span className={cs(css.cell, css.email)}>Email</span>
                        <span className={cs(css.cell, css.role)}>Role</span>
                        <span className={cs(css.cell, css.twoFA)}>2FA</span>
                    </span>

                    {paginatedAgents.isError ? (
                        <p>Something went wrong</p>
                    ) : paginatedAgents.isLoading ? (
                        <div className={css.spinnerWrapper}>
                            <Spinner color="gloom" width="50" />
                        </div>
                    ) : (
                        <ul className={css.list}>
                            {agents.map((agent) => {
                                return (
                                    <Row
                                        key={agent.id}
                                        agent={agent}
                                        isAccountOwner={
                                            agent.id === accountOwnerId
                                        }
                                    />
                                )
                            })}
                        </ul>
                    )}
                </div>
                <Navigation
                    hasPrevItems={paginatedAgents.hasPreviousPage}
                    fetchPrevItems={paginatedAgents.fetchPreviousPage}
                    hasNextItems={paginatedAgents.hasNextPage}
                    fetchNextItems={paginatedAgents.fetchNextPage}
                />
            </Container>
        </div>
    )
}

export default UserList
