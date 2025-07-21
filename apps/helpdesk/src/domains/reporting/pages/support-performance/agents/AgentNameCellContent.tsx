import React, { PropsWithRef } from 'react'

import { Link } from 'react-router-dom'

import { User } from 'config/types/user'
import { AgentAvatar } from 'domains/reporting/pages/common/AgentAvatar'
import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import css from 'domains/reporting/pages/support-performance/agents/AgentCellContent.less'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import { STATS_ROUTES } from 'routes/constants'

export type AgentNameCellContentProps = {
    agent: User
    bodyCellProps?: PropsWithRef<BodyCellProps>
    redirectTo?: string
}

export const AgentNameCellContent = ({
    agent,
    bodyCellProps,
    redirectTo,
}: AgentNameCellContentProps) => {
    const dispatch = useAppDispatch()

    const handleClick = () => {
        dispatch(mergeStatsFilters({ agents: [agent.id] }))
    }

    return (
        <BodyCell {...bodyCellProps}>
            <Link
                to={
                    redirectTo ??
                    `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW}`
                }
                onClick={handleClick}
                className={css.container}
            >
                <AgentAvatar agent={agent} />
            </Link>
        </BodyCell>
    )
}
