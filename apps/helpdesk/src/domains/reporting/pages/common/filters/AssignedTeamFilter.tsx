import { useCallback } from 'react'

import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { useClientSideFilterSearch } from 'domains/reporting/hooks/filters/useClientSideFilterSearch'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { LogicalOperatorLabel } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    FilterLabels,
    teamsFilterLogicalOperators,
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
import { getFilterTeamsJS } from 'state/teams/selectors'
import type { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.AssignedTeam]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.AssignedTeam],
            undefined
        >,
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter &
    OptionalFilterProps

export default function AssignedTeamFilter({
    value = emptyFilter,
    warningType,
    dispatchUpdate,
    dispatchRemove,
    onRemove,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    initializeAsOpen = false,
    isDisabled = false,
}: Props) {
    const teams = useAppSelector(getFilterTeamsJS)

    const getSelectedTeams = () => {
        return teams
            .filter((team) => value.values.includes(Number(team.value)))
            .map((team) => ({
                label: team.label,
                value: team.value,
            }))
    }

    const filterOptions = [
        {
            options: teams.map((team) => ({
                label: team.label,
                value: team.value,
            })),
        },
    ]

    const clientSideFilter = useClientSideFilterSearch(filterOptions)

    const handleFilterValuesChange = useCallback(
        (values: number[]) => {
            dispatchUpdate({
                values,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value.operator],
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = Number(opt.value)

        if (value.values.includes(id)) {
            handleFilterValuesChange(
                value.values.filter((teamId) => teamId !== id),
            )
        } else {
            handleFilterValuesChange([...value.values, id])
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
        logSegmentEvent(
            FilterKey.AssignedTeam,
            LogicalOperatorLabel[value.operator],
        )
        dispatchStatFiltersClean()
        clientSideFilter.onClear()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.AssignedTeam]}
            filterErrors={{ warningType }}
            selectedOptions={getSelectedTeams()}
            selectedLogicalOperator={value.operator}
            logicalOperators={teamsFilterLogicalOperators}
            search={clientSideFilter.value}
            onSearch={clientSideFilter.onSearch}
            filterOptionGroups={clientSideFilter.result}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    clientSideFilter.result[0].options.map((team) =>
                        Number(team.value),
                    ),
                )
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                dispatchRemove()
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

export const AssignedTeamFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.AssignedTeam
        ],
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                teams: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                teams: emptyFilter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(AssignedTeamFilter)

export const AssignedTeamFilterWithSavedState = connect(
    (state: RootState) => ({
        value: getSavedFiltersWithLogicalOperators(state)[
            FilterKey.AssignedTeam
        ],
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            upsertSavedFilterFilter({
                member: FilterKey.AssignedTeam,
                operator: filter.operator,
                values: filter.values.map(String),
            }),
        dispatchRemove: () =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.AssignedTeam,
            }),
    },
)(AssignedTeamFilter)
