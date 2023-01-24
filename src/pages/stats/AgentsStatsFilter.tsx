import React, {ComponentProps, useCallback} from 'react'
import {DropdownItem} from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {mergeStatsFilters} from 'state/stats/actions'
import {getLabelledTeamsJS} from 'state/teams/selectors'
import {getLabelledAgentsJS} from 'state/agents/selectors'
import {StatsFilters} from 'models/stat/types'

import SelectFilter from './common/SelectFilter'
import SelectStatsFilter from './common/SelectStatsFilter'
import css from './AgentsStatsFilter.less'

type Props = {
    value: StatsFilters['agents']
    variant?: 'fill' | 'ghost'
}

export default function AgentsStatsFilter({
    value = [],
    variant = 'fill',
}: Props) {
    const dispatch = useAppDispatch()
    const agents = useAppSelector(getLabelledAgentsJS)
    const teams = useAppSelector(getLabelledTeamsJS)
    const Component = variant === 'fill' ? SelectFilter : SelectStatsFilter

    const handleFilterChange: ComponentProps<typeof Component>['onChange'] =
        useCallback(
            (values) => {
                dispatch(mergeStatsFilters({agents: values as number[]}))
            },
            [dispatch]
        )

    return (
        <Component
            plural="agents"
            singular="agent"
            onChange={handleFilterChange}
            value={value}
        >
            <DropdownItem header className={css.dropdownHeader}>
                Teams
            </DropdownItem>
            <div>
                {teams.map((team) => (
                    <SelectFilter.Group
                        key={`team-${team.id}`}
                        items={team.members}
                        label={team.label}
                        value={team.id}
                    />
                ))}
            </div>
            <DropdownItem divider className={css.dropdownDivider} />
            <DropdownItem header className={css.dropdownHeader}>
                Users
            </DropdownItem>
            {agents.map((agent) => (
                <Component.Item
                    key={`agent-${agent.id}`}
                    label={agent.label}
                    value={agent.id}
                />
            ))}
        </Component>
    )
}
