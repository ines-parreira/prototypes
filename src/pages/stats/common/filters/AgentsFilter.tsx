import React, {useCallback, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import {getFilterTeamsJS} from 'state/teams/selectors'
import {getFilterAgentsJS} from 'state/agents/selectors'
import {StatsFilters} from 'models/stat/types'

import Filter from 'pages/stats/common/components/Filter'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {agentsFilterLogicalOperators} from 'pages/stats/common/filters/constants'
import {DropdownOption} from 'pages/stats/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'

type Props = {
    value: StatsFilters['agents']
}

export const AGENTS_FILTER_NAME = 'Agent'

export default function AgentsFilter({value = []}: Props) {
    const dispatch = useAppDispatch()
    const agents = useAppSelector(getFilterAgentsJS)
    const teams = useAppSelector(getFilterTeamsJS)
    const [selectedLogicalOperator, setSelectedLogicalOperator] =
        useState<LogicalOperatorEnum>(LogicalOperatorEnum['ONE_OF'])
    const [selectedTeamOption, setSelectedTeamOption] = useState<
        DropdownOption[]
    >([])
    const teamValuePrefix = 'team_'

    const handleFilterChange = useCallback(
        (values) => {
            dispatch(statFiltersDirty())
            dispatch(mergeStatsFilters({agents: values as number[]}))
        },
        [dispatch]
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
            agents.filter((agent) => value.includes(Number(agent.value)))

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
            handleFilterChange(
                value.filter((id) => !foundTeam.members.includes(id))
            )
            setSelectedTeamOption(
                selectedTeamOption.filter((team) => team.value !== opt.value)
            )
        } else {
            handleFilterChange([...value, ...foundTeam.members.map((id) => id)])
            setSelectedTeamOption([...selectedTeamOption, opt])
        }
    }

    const handleAgentOption = (opt: DropdownOption) => {
        const foundAgent = agents.find((agent) => agent.value === opt.value)

        const agentIsSelected = value.includes(Number(foundAgent?.value))

        if (agentIsSelected) {
            handleFilterChange(
                value.filter((id) => id !== Number(foundAgent?.value))
            )
        } else {
            handleFilterChange([...value, Number(foundAgent?.value)])
        }
    }

    const onOptionChange = (opt: DropdownOption) => {
        if (opt.value.startsWith(teamValuePrefix)) {
            handleTeamOption(opt)
        } else {
            handleAgentOption(opt)
        }
    }

    const handleDropdownClosed = () => {
        dispatch(statFiltersClean())
    }

    return (
        <Filter
            filterName={AGENTS_FILTER_NAME}
            selectedOptions={getSelectedItems()}
            selectedLogicalOperator={selectedLogicalOperator}
            logicalOperators={agentsFilterLogicalOperators}
            filterOptionGroups={filterOptions}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterChange(agents.map((agent) => Number(agent.value)))
            }}
            onRemoveAll={() => {
                handleFilterChange([])
                setSelectedTeamOption([])
            }}
            onRemove={() => {
                dispatch(mergeStatsFilters({agents: []}))
                setSelectedTeamOption([])
            }}
            onChangeLogicalOperator={(operator) =>
                setSelectedLogicalOperator(operator)
            }
            onDropdownClosed={handleDropdownClosed}
        />
    )
}
