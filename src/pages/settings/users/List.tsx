import React, {useState} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import {Container} from 'reactstrap'
import {List, Map} from 'immutable'
import {useAsyncFn, useEffectOnce} from 'react-use'

import {useFlags} from 'launchdarkly-react-client-sdk'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {AgentsRelationshipsParam, FetchAgentsOptions} from 'models/agents/types'
import {fetchAgents as fetchAgentsRequest} from 'models/agents/resources'
import {CursorMeta} from 'models/api/types'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import Navigation from 'pages/common/components/Navigation/index.js'
import PageHeader from 'pages/common/components/PageHeader'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import {EventNavDirection} from 'pages/settings/audit/constants'
import settingsCss from 'pages/settings/settings.less'
import {
    FETCH_AGENTS_PAGINATION_ERROR,
    FETCH_AGENTS_PAGINATION_SUCCESS,
} from 'state/agents/constants'
import {getPaginatedAgents} from 'state/agents/selectors'
import {getAccessSettings} from 'state/currentAccount/selectors'
import {AccountSettingAccessSignupMode as SignupMode} from 'state/currentAccount/types'
import {toImmutable} from 'utils'
import {FeatureFlagKey} from 'config/featureFlags'

import Row from './Row'
import css from './List.less'
import cssRow from './Row.less'

const UserList = () => {
    useEffectOnce(() => {
        void fetchAgents()
    })

    const [meta, setMeta] = useState<CursorMeta | null>(null)
    const [currentCursor, setCurrentCursor] = useState<string | null>(null)
    const isAgentAvailabilityStatusEnabled =
        useFlags()[FeatureFlagKey.AgentsAvailabilityStatus]

    const dispatch = useAppDispatch()
    const agents = useAppSelector(getPaginatedAgents)

    const accountOwnerId = useAppSelector(
        (state) => state.currentAccount.get('user_id') as number
    )

    const accessSettings = useAppSelector(getAccessSettings)

    const createFetchAgents = async (
        direction?: EventNavDirection,
        cursor?: string | null
    ) => {
        const params: FetchAgentsOptions = {
            relationships: AgentsRelationshipsParam.AvailabilityStatus,
        }

        if (direction === EventNavDirection.PrevCursor && !!meta?.prev_cursor) {
            params.cursor = meta.prev_cursor
        } else if (
            direction === EventNavDirection.NextCursor &&
            meta?.next_cursor
        ) {
            params.cursor = meta.next_cursor
        } else if (!!cursor) {
            params.cursor = cursor
        }

        try {
            const {
                data: {data, meta},
            } = await fetchAgentsRequest(params)
            dispatch({
                type: FETCH_AGENTS_PAGINATION_SUCCESS,
                resp: toImmutable<List<any>>(data),
            })
            setMeta(meta)
            setCurrentCursor(params.cursor || null)
        } catch (error) {
            return dispatch({
                type: FETCH_AGENTS_PAGINATION_ERROR,
                error,
                reason: 'Failed to fetch team members',
            })
        }
    }

    const [{loading: isFetching}, fetchAgents] = useAsyncFn(createFetchAgents, [
        currentCursor,
        meta,
    ])

    return (
        <div className={classnames('full-width', css.component)}>
            <PageHeader title="Users">
                <Link to="/app/settings/users/add/">
                    <Button>Add user</Button>
                </Link>
            </PageHeader>

            <Container fluid className={settingsCss.pageContainer}>
                <p>
                    Manage users for your Gorgias account. Users (Ex: Agents,
                    Admins, etc..) can view tickets and respond to them.
                </p>
                <p>
                    You can <strong>add as many users as you want</strong>, at
                    no additional cost.
                </p>
                {accessSettings.getIn(['data', 'signup_mode']) ===
                    SignupMode.Invite && (
                    <LinkAlert
                        className="mb-3"
                        icon
                        actionLabel="Setup Your Email Domain"
                        actionHref="/app/settings/access"
                    >
                        You can also allow members to sign up using your
                        company's email domain.
                    </LinkAlert>
                )}
                <div className={css.list}>
                    <span
                        className={classnames(
                            css.tableHeader,
                            cssRow.component
                        )}
                    >
                        <span className={cssRow.avatar} style={{width: '36px'}}>
                            User
                        </span>
                        <span className={cssRow.meta} />
                        {isAgentAvailabilityStatusEnabled && (
                            <span className={cssRow.status}>Status</span>
                        )}
                        <span className={cssRow.role}>Role</span>
                        <span className={cssRow.twoFa}>2FA enabled</span>
                        <span className={cssRow.delete} />
                    </span>

                    {isFetching ? (
                        <Loader />
                    ) : (
                        agents.map((agent: Map<any, any>) => {
                            const agentId = agent.get('id')
                            return (
                                <Row
                                    key={agentId}
                                    agent={agent}
                                    isAccountOwner={agentId === accountOwnerId}
                                    cursorToRefresh={
                                        !meta?.prev_cursor && !meta?.next_cursor
                                            ? null
                                            : agents.size === 1 &&
                                              !!meta.prev_cursor
                                            ? meta.prev_cursor
                                            : currentCursor
                                    }
                                    refreshData={fetchAgents}
                                />
                            )
                        })
                    )}
                </div>

                <Navigation
                    className={css.navigation}
                    hasNextItems={!!meta?.next_cursor}
                    hasPrevItems={!!meta?.prev_cursor}
                    fetchNextItems={() =>
                        fetchAgents(EventNavDirection.NextCursor)
                    }
                    fetchPrevItems={() =>
                        fetchAgents(EventNavDirection.PrevCursor)
                    }
                />
            </Container>
        </div>
    )
}

export default UserList
