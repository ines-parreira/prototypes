import { useCallback, useState } from 'react'

import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { useClientSideFilterSearch } from 'domains/reporting/hooks/filters/useClientSideFilterSearch'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { LogicalOperatorLabel } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    agentsFilterLogicalOperators,
    FilterLabels,
} from 'domains/reporting/pages/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'domains/reporting/pages/common/filters/helpers'
import type {
    OptionalFilterProps,
    RemovableFilter,
} from 'domains/reporting/pages/common/filters/types'
import type { DropdownOption } from 'domains/reporting/pages/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
} from 'domains/reporting/state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'domains/reporting/state/stats/statsSlice'
import {
    statFiltersClean,
    statFiltersDirty,
} from 'domains/reporting/state/ui/stats/actions'
import {
    removeFilterFromSavedFilterDraft,
    upsertSavedFilterFilter,
} from 'domains/reporting/state/ui/stats/filtersSlice'
import useAppSelector from 'hooks/useAppSelector'
import { getFilterAgentsJS } from 'state/agents/selectors'
import { getFilterTeamsJS } from 'state/teams/selectors'
import type { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Agents]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.Agents],
            undefined
        >,
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter &
    OptionalFilterProps

const TEAMS_TITLE = 'Teams'
const USERS_TITLE = 'Users'

export default function AgentsFilter({
    value = emptyFilter,
    dispatchUpdate,
    dispatchRemove,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    initializeAsOpen = false,
    onRemove,
    warningType,
    isDisabled,
}: Props) {
    const agents = useAppSelector(getFilterAgentsJS)
    const teams = useAppSelector(getFilterTeamsJS)
    const [selectedTeamOption, setSelectedTeamOption] = useState<
        DropdownOption[]
    >([])
    const teamValuePrefix = 'team_'

    const handleFilterValuesChange = useCallback(
        (values: number[]) => {
            dispatchUpdate({
                values,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value.operator],
    )

    const filterOptions = [
        {
            title: TEAMS_TITLE,
            options: teams.map((team) => ({
                ...team,
                value: `${teamValuePrefix}${team.value}`,
            })),
        },
        { title: USERS_TITLE, options: agents },
    ]

    const clientSideFilter = useClientSideFilterSearch(filterOptions)

    const getSelectedItems = useCallback(() => {
        const agentsInValue = () =>
            agents.filter((agent) => value.values.includes(Number(agent.value)))

        const selectedAgents = agentsInValue().map(({ label, value }) => ({
            label,
            value,
        }))
        return [...selectedAgents, ...selectedTeamOption]
    }, [agents, selectedTeamOption, value])

    const handleTeamOption = (opt: DropdownOption) => {
        const foundTeam = teams.filter(
            (team) => team.value === opt.value.replace(teamValuePrefix, ''),
        )[0]
        const teamIsSelected = selectedTeamOption.find(
            (team) => team.value === opt.value,
        )
        if (teamIsSelected) {
            handleFilterValuesChange(
                value.values.filter((id) => !foundTeam.members.includes(id)),
            )
            setSelectedTeamOption(
                selectedTeamOption.filter((team) => team.value !== opt.value),
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
                value.values.filter((id) => id !== Number(foundAgent?.value)),
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
            dispatchUpdate({
                values: value.values,
                operator: operator,
            })
        },
        [dispatchUpdate, value.values],
    )

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(FilterKey.Agents, LogicalOperatorLabel[value.operator])
        dispatchStatFiltersClean()
        clientSideFilter.onClear()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Agents]}
            filterErrors={{ warningType }}
            selectedOptions={getSelectedItems()}
            selectedLogicalOperator={value.operator}
            logicalOperators={agentsFilterLogicalOperators}
            search={clientSideFilter.value}
            onSearch={clientSideFilter.onSearch}
            filterOptionGroups={clientSideFilter.result}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                const agentsGroup = clientSideFilter.result.find(
                    (group) => group.title === USERS_TITLE,
                )!

                handleFilterValuesChange(
                    agentsGroup.options.map((agent) => Number(agent.value)),
                )
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
                setSelectedTeamOption([])
            }}
            onRemove={() => {
                dispatchRemove()
                setSelectedTeamOption([])
                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
            isDisabled={isDisabled}
        />
    )
}

export const AgentsFiltersWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[FilterKey.Agents],
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                agents: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                agents: emptyFilter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(AgentsFilter)

export const AgentsFiltersWithSavedState = connect(
    (state: RootState) => ({
        value: getSavedFiltersWithLogicalOperators(state)[FilterKey.Agents],
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            upsertSavedFilterFilter({
                operator: filter.operator,
                values: filter.values.map(String),
                member: FilterKey.Agents,
            }),
        dispatchRemove: () =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.Agents,
            }),
    },
)(AgentsFilter)
