import { useCallback } from 'react'

import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { useVoiceQueueSearch } from 'domains/reporting/hooks/common/useVoiceQueueSearch'
import type { StatsFiltersWithLogicalOperator } from 'domains/reporting/models/stat/types'
import { FilterKey } from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import type { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { LogicalOperatorLabel } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    FilterLabels,
    integrationsFilterLogicalOperators,
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
import type { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Integrations]
    dispatchUpdate: (
        value: Exclude<
            StatsFiltersWithLogicalOperator[FilterKey.Integrations],
            undefined
        >,
    ) => void
    dispatchRemove: () => void
    dispatchStatFiltersDirty?: () => void
    dispatchStatFiltersClean?: () => void
} & RemovableFilter &
    OptionalFilterProps

export function VoiceQueuesFilter({
    value = emptyFilter,
    initializeAsOpen = false,
    onRemove,
    dispatchUpdate,
    dispatchRemove,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    warningType,
    isDisabled,
}: Props) {
    const { handleVoiceQueueSearch, onLoad, voiceQueues, shouldLoadMore } =
        useVoiceQueueSearch()

    const getSelectedVoiceQueues = useCallback(() => {
        return voiceQueues
            .filter((voiceQueue) => value.values.includes(voiceQueue.id))
            .map((voiceQueue) => ({
                label: voiceQueue.name?.toString() ?? `Queue #${voiceQueue.id}`,
                value: `${voiceQueue.id}`,
            }))
    }, [value, voiceQueues])

    const voiceQueueOptionGroups = () => {
        return [
            {
                options: voiceQueues.map((voiceQueue) => ({
                    label:
                        voiceQueue.name?.toString() ??
                        `Queue #${voiceQueue.id}`,
                    value: `${voiceQueue.id}`,
                })),
            },
        ]
    }

    const handleFilterValuesChange = useCallback(
        (values: number[]) => {
            dispatchUpdate({
                values,
                operator: value.operator,
            })
        },
        [dispatchUpdate, value.operator],
    )

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatchUpdate({
                values: value.values,
                operator: operator,
            })
        },
        [dispatchUpdate, value.values],
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = Number(opt.value)
        if (value.values.includes(id)) {
            handleFilterValuesChange(
                value.values.filter((voiceQueueId) => voiceQueueId !== id),
            )
        } else {
            handleFilterValuesChange([...value.values, id])
        }
    }

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.VoiceQueues,
            LogicalOperatorLabel[value.operator],
        )
        handleVoiceQueueSearch('')
        dispatchStatFiltersClean()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.VoiceQueues]}
            filterErrors={{ warningType }}
            selectedOptions={getSelectedVoiceQueues()}
            selectedLogicalOperator={value.operator}
            logicalOperators={integrationsFilterLogicalOperators}
            filterOptionGroups={voiceQueueOptionGroups()}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    voiceQueues.map((voiceQueue) => voiceQueue.id),
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
            infiniteScroll={{
                onLoad,
                shouldLoadMore,
            }}
            onSearch={handleVoiceQueueSearch}
            initializeAsOpen={initializeAsOpen}
            isDisabled={isDisabled}
        />
    )
}

export const VoiceQueuesFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.VoiceQueues
        ],
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                voiceQueues: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                voiceQueues: emptyFilter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(VoiceQueuesFilter)

export const VoiceQueuesFilterWithSavedState = connect(
    (state: RootState) => ({
        value: getSavedFiltersWithLogicalOperators(state)[
            FilterKey.VoiceQueues
        ],
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            upsertSavedFilterFilter({
                member: FilterKey.VoiceQueues,
                operator: filter.operator,
                values: filter.values.map(String),
            }),
        dispatchRemove: () =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.VoiceQueues,
            }),
    },
)(VoiceQueuesFilter)
