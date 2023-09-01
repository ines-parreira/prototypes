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
import Tooltip from 'pages/common/components/Tooltip'
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
    const agentName = agent.name || agent.email
    const tooltipTargetID = `agent-${agent.id}`

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
                    name={agentName}
                    url={agent.meta?.profile_picture_url}
                    size={36}
                    shape="round"
                    className={css.avatar}
                />
                <span className={css.agent} id={tooltipTargetID}>
                    {agentName}
                </span>
                <Tooltip target={tooltipTargetID} trigger={['hover']}>
                    {agentName}
                </Tooltip>
            </Link>
        </BodyCell>
    )
}
