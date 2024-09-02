import React, {useCallback, useState} from 'react'
import {connect} from 'react-redux'
import {emptyFilter} from 'pages/stats/common/filters/helpers'
import {RemovableFilter} from 'pages/stats/common/filters/types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import {getFilterTeamsJS} from 'state/teams/selectors'
import {getFilterAgentsJS} from 'state/agents/selectors'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'

import Filter from 'pages/stats/common/components/Filter'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {agentsFilterLogicalOperators} from 'pages/stats/common/filters/constants'
import {DropdownOption} from 'pages/stats/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {RootState} from 'state/types'
import {getPageStatsFiltersWithLogicalOperators} from 'state/stats/selectors'

type Props = {
    value: StatsFiltersWithLogicalOperator['agents']
} & RemovableFilter

export const AGENTS_FILTER_NAME = 'Agent'

export default function AgentsFilter({
    value = emptyFilter,
    initialiseAsOpen = false,
    onRemove,
}: Props) {
    const dispatch = useAppDispatch()
    const agents = useAppSelector(getFilterAgentsJS)
    const teams = useAppSelector(getFilterTeamsJS)
    const [selectedTeamOption, setSelectedTeamOption] = useState<
        DropdownOption[]
    >([])
    const teamValuePrefix = 'team_'

    const handleFilterValuesChange = useCallback(
        (values) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    agents: {
                        values,
                        operator: value.operator,
                    },
                })
            )
        },
        [dispatch, value.operator]
    )

    const filterOptions = [
        {
            title: 'Teams',
            options: [
                ...teams.map((team) => ({
                    ...team,
                    value: `${teamValuePrefix}${team.value}`,
                })),
            ],
        },
        {title: 'Users', options: agents},
    ]

    const getSelectedItems = useCallback(() => {
        const agentsInValue = () =>
            agents.filter((agent) => value.values.includes(Number(agent.value)))

        const selectedAgents = agentsInValue().map(({label, value}) => ({
            label,
            value,
        }))
        return [...selectedAgents, ...selectedTeamOption]
    }, [agents, selectedTeamOption, value])

    const handleTeamOption = (opt: DropdownOption) => {
        const foundTeam = teams.filter(
            (team) => team.value === opt.value.replace(teamValuePrefix, '')
        )[0]
        const teamIsSelected = selectedTeamOption.find(
            (team) => team.value === opt.value
        )
        if (teamIsSelected) {
            handleFilterValuesChange(
                value.values.filter((id) => !foundTeam.members.includes(id))
            )
            setSelectedTeamOption(
                selectedTeamOption.filter((team) => team.value !== opt.value)
            )
        } else {
            handleFilterValuesChange([
                ...value.values,
                ...foundTeam.members.map((id) => id),
            ])
            setSelectedTeamOption([...selectedTeamOption, opt])
        }
    }

    const handleAgentOption = (opt: DropdownOption) => {
        const foundAgent = agents.find((agent) => agent.value === opt.value)

        const agentIsSelected = value.values.includes(Number(foundAgent?.value))

        if (agentIsSelected) {
            handleFilterValuesChange(
                value.values.filter((id) => id !== Number(foundAgent?.value))
            )
        } else {
            handleFilterValuesChange([
                ...value.values,
                Number(foundAgent?.value),
            ])
        }
    }

    const onOptionChange = (opt: DropdownOption) => {
        if (opt.value.startsWith(teamValuePrefix)) {
            handleTeamOption(opt)
        } else {
            handleAgentOption(opt)
        }
    }

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    agents: {
                        values: value.values,
                        operator: operator,
                    },
                })
            )
        },
        [dispatch, value.values]
    )

    const handleDropdownOpen = () => {
        dispatch(statFiltersDirty())
    }
    const handleDropdownClosed = () => {
        dispatch(statFiltersClean())
    }

    return (
        <Filter
            filterName={AGENTS_FILTER_NAME}
            selectedOptions={getSelectedItems()}
            selectedLogicalOperator={value.operator}
            logicalOperators={agentsFilterLogicalOperators}
            filterOptionGroups={filterOptions}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    agents.map((agent) => Number(agent.value))
                )
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
                setSelectedTeamOption([])
            }}
            onRemove={() => {
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({agents: emptyFilter})
                )
                setSelectedTeamOption([])

                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initialiseAsOpen={initialiseAsOpen}
        />
    )
}

export const AgentsFiltersWithState = connect((state: RootState) => ({
    value: getPageStatsFiltersWithLogicalOperators(state)[FilterKey.Agents],
}))(AgentsFilter)
