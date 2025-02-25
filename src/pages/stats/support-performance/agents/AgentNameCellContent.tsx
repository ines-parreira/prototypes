import React, { PropsWithRef } from 'react'

import { Link } from 'react-router-dom'

import { User } from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import { AgentAvatar } from 'pages/stats/common/AgentAvatar'
import { STATS_ROUTE_PREFIX } from 'pages/stats/common/components/constants'
import css from 'pages/stats/support-performance/agents/AgentCellContent.less'
import { STATS_ROUTES } from 'routes/constants'
import { mergeStatsFilters } from 'state/stats/statsSlice'

export type AgentNameCellContentProps = {
    agent: User
    bodyCellProps?: PropsWithRef<BodyCellProps>
}

export const AgentNameCellContent = ({
    agent,
    bodyCellProps,
}: AgentNameCellContentProps) => {
    const dispatch = useAppDispatch()

    const handleClick = () => {
        dispatch(mergeStatsFilters({ agents: [agent.id] }))
    }

    return (
        <BodyCell {...bodyCellProps}>
            <Link
                to={`${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW}`}
                onClick={handleClick}
                className={css.container}
            >
                <AgentAvatar agent={agent} />
            </Link>
        </BodyCell>
    )
}
