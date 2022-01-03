import React, {ComponentProps, useCallback} from 'react'
import {fromJS} from 'immutable'
import {DropdownItem} from 'reactstrap'
import {useSelector} from 'react-redux'

import useAppDispatch from '../../hooks/useAppDispatch'
import {mergeStatsFilters} from '../../state/stats/actions'
import {AgentsStatsFilterValue, StatsFilterType} from '../../state/stats/types'
import {getLabelledTeamsJS} from '../../state/teams/selectors'
import {getLabelledAgentsJS} from '../../state/agents/selectors'

import SelectFilter from './common/SelectFilter'
import css from './DEPRECATED_StatsFilters.less'

type Props = {
    value: AgentsStatsFilterValue
}

export default function AgentsStatsFilter({value}: Props) {
    const dispatch = useAppDispatch()
    const agents = useSelector(getLabelledAgentsJS)
    const teams = useSelector(getLabelledTeamsJS)

    const handleFilterChange: ComponentProps<typeof SelectFilter>['onChange'] =
        useCallback(
            (values) => {
                dispatch(
                    mergeStatsFilters(
                        fromJS({[StatsFilterType.Agents]: values})
                    )
                )
            },
            [dispatch]
        )

    return (
        <SelectFilter
            plural="agents"
            singular="agent"
            onChange={handleFilterChange}
            value={value}
        >
            <DropdownItem header className={css.dropdownHeader}>
                Teams
            </DropdownItem>
            {teams.map((team) => (
                <SelectFilter.Group
                    key={`team-${team.id}`}
                    items={team.members}
                    label={team.label}
                    value={team.id}
                />
            ))}
            <DropdownItem divider className={css.dropdownDivider} />
            <DropdownItem header className={css.dropdownHeader}>
                Users
            </DropdownItem>
            {agents.map((agent) => (
                <SelectFilter.Item
                    key={`agent-${agent.id}`}
                    label={agent.label}
                    value={agent.id}
                />
            ))}
        </SelectFilter>
    )
}
