import React, {PropsWithRef} from 'react'
import {Link} from 'react-router-dom'

import {User} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import css from 'pages/stats/AgentCellContent.less'
import {AgentAvatar} from 'pages/stats/common/AgentAvatar'
import {mergeStatsFilters} from 'state/stats/statsSlice'

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
        dispatch(mergeStatsFilters({agents: [agent.id]}))
    }

    return (
        <BodyCell {...bodyCellProps}>
            <Link
                to="/app/stats/support-performance-overview"
                onClick={handleClick}
                className={css.container}
            >
                <AgentAvatar agent={agent} />
            </Link>
        </BodyCell>
    )
}
