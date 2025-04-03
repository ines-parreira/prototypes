import { useCallback } from 'react'

import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { useVoiceQueueSearch } from 'hooks/reporting/common/useVoiceQueueSearch'
import { FilterKey, StatsFiltersWithLogicalOperator } from 'models/stat/types'
import Filter from 'pages/stats/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'pages/stats/common/components/Filter/constants'
import {
    FilterLabels,
    integrationsFilterLogicalOperators,
} from 'pages/stats/common/filters/constants'
import {
    emptyFilter,
    logSegmentEvent,
} from 'pages/stats/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'pages/stats/common/filters/types'
import { DropdownOption } from 'pages/stats/types'
import { getPageStatsFiltersWithLogicalOperators } from 'state/stats/selectors'
import { mergeStatsFiltersWithLogicalOperator } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import { statFiltersClean, statFiltersDirty } from 'state/ui/stats/actions'

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
