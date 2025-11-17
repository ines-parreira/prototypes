import type { ComponentProps } from 'react'
import React, { useCallback } from 'react'

import { DropdownItem } from 'reactstrap'

import type { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import css from 'domains/reporting/pages/common/filters/AgentsStatsFilter.less'
import SelectFilter from 'domains/reporting/pages/common/SelectFilter'
import SelectStatsFilter from 'domains/reporting/pages/common/SelectStatsFilter'
import { mergeStatsFilters } from 'domains/reporting/state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { getLabelledHumanAndAutomationBotAgentsJS } from 'state/agents/selectors'
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
