import React, {PropsWithRef} from 'react'
import {Link} from 'react-router-dom'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {getAgent} from 'state/agents/selectors'
import {mergeStatsFilters} from 'state/stats/actions'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {User} from 'config/types/user'
import css from './AgentCellContent.less'

export const AgentCellContent = ({
    agentId,
    bodyCellProps,
}: {
    agentId: number
    bodyCellProps?: PropsWithRef<BodyCellProps>
}) => {
    const agent: User = useAppSelector(getAgent(agentId)).toJS()
    const dispatch = useAppDispatch()

    const handleClick = () => {
        dispatch(mergeStatsFilters({agents: [agentId]}))
    }

    return (
        <BodyCell {...bodyCellProps}>
            <Link
                to="/app/stats/support-performance-overview"
                onClick={handleClick}
                className={css.container}
            >
                <Avatar
                    name={agent.name || agent.email}
                    url={agent.meta?.profile_picture_url}
                    size={36}
                    shape="round"
                    className={css.avatar}
                />
                <span className={css.agent}>{agent.name || agent.email}</span>
            </Link>
        </BodyCell>
    )
}
