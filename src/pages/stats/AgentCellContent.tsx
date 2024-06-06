import React, {PropsWithRef} from 'react'
import {Link} from 'react-router-dom'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import useAppDispatch from 'hooks/useAppDispatch'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import {User} from 'config/types/user'
import {AgentAvatar} from './AgentAvatar'
import css from './AgentCellContent.less'

export const AgentCellContent = ({
    agent,
    bodyCellProps,
}: {
    agent: User
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) => {
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
