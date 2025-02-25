import React, { ComponentProps, useCallback } from 'react'

import { DropdownItem } from 'reactstrap'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { LegacyStatsFilters } from 'models/stat/types'
import css from 'pages/stats/common/filters/AgentsStatsFilter.less'
import SelectFilter from 'pages/stats/common/SelectFilter'
import SelectStatsFilter from 'pages/stats/common/SelectStatsFilter'
import { getLabelledHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
import { mergeStatsFilters } from 'state/stats/statsSlice'
import { getLabelledTeamsJS } from 'state/teams/selectors'

type Props = {
    value: LegacyStatsFilters['agents']
    variant?: 'fill' | 'ghost'
}

export const agentsStatsFilterLabels = {
    plural: 'agents',
    singular: 'agent',
}

/**
 * @deprecated
 * @date 2024-07-19
 * @type feature-component
 */
export default function DEPRECATED_AgentsStatsFilter({
    value = [],
    variant = 'fill',
}: Props) {
    const dispatch = useAppDispatch()
    const agents = useAppSelector(getLabelledHumanAndAutomationBotAgentsJS)
    const teams = useAppSelector(getLabelledTeamsJS)
    const Component = variant === 'fill' ? SelectFilter : SelectStatsFilter

    const handleFilterChange: ComponentProps<typeof Component>['onChange'] =
        useCallback(
            (values) => {
                dispatch(mergeStatsFilters({ agents: values as number[] }))
            },
            [dispatch],
        )

    return (
        <Component
            {...agentsStatsFilterLabels}
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
