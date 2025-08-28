import { useCallback, useMemo } from 'react'

import noop from 'lodash/noop'
import { connect } from 'react-redux'

import { useClientSideFilterSearch } from 'domains/reporting/hooks/filters/useClientSideFilterSearch'
import {
    FilterKey,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import Filter from 'domains/reporting/pages/common/components/Filter'
import {
    LogicalOperatorEnum,
    LogicalOperatorLabel,
} from 'domains/reporting/pages/common/components/Filter/constants'
import {
    FilterLabels,
    integrationsFilterLogicalOperators,
} from 'domains/reporting/pages/common/filters/constants'
import { getIntegrationIcon } from 'domains/reporting/pages/common/filters/DEPRECATED_IntegrationsStatsFilter'
import {
    emptyFilter,
    logSegmentEvent,
} from 'domains/reporting/pages/common/filters/helpers'
import {
    OptionalFilterProps,
    RemovableFilter,
} from 'domains/reporting/pages/common/filters/types'
import { DropdownOption } from 'domains/reporting/pages/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getSavedFiltersWithLogicalOperators,
    getStatsMessagingAndAppIntegrations,
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
import { Integration } from 'models/integration/types'
import { getPhoneIntegrations } from 'state/integrations/selectors'
import { RootState } from 'state/types'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Integrations]
    integrations: Integration[]
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

export function IntegrationsFilter({
    value = emptyFilter,
    integrations,
    initializeAsOpen = false,
    onRemove,
    dispatchUpdate,
    dispatchRemove,
    dispatchStatFiltersDirty = noop,
    dispatchStatFiltersClean = noop,
    warningType,
    isDisabled,
}: Props) {
    const getSelectedIntegrations = useCallback(() => {
        return integrations
            .filter((integration) => value.values.includes(integration.id))
            .map((integration) => ({
                label: integration.name,
                value: `${integration.id}`,
                icon: getIntegrationIcon(integration),
            }))
    }, [value, integrations])

    const integrationOptionGroups = useMemo(() => {
        return [
            {
                options: integrations.map((integration) => ({
                    label: integration.name,
                    value: `${integration.id}`,
                    icon: getIntegrationIcon(integration),
                })),
            },
        ]
    }, [integrations])

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
                value.values.filter((integrationId) => integrationId !== id),
            )
        } else {
            handleFilterValuesChange([...value.values, id])
        }
    }

    const clientSideFilter = useClientSideFilterSearch(integrationOptionGroups)

    const handleDropdownOpen = () => {
        dispatchStatFiltersDirty()
    }
    const handleDropdownClosed = () => {
        logSegmentEvent(
            FilterKey.Integrations,
            LogicalOperatorLabel[value.operator],
        )
        dispatchStatFiltersClean()
        clientSideFilter.onClear()
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Integrations]}
            filterErrors={{ warningType }}
            selectedOptions={getSelectedIntegrations()}
            selectedLogicalOperator={value.operator}
            logicalOperators={integrationsFilterLogicalOperators}
            filterOptionGroups={clientSideFilter.result}
            search={clientSideFilter.value}
            onSearch={clientSideFilter.onSearch}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    clientSideFilter.result[0].options.map((option) =>
                        Number(option.value),
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

export const IntegrationsFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.Integrations
        ],
        integrations: getStatsMessagingAndAppIntegrations(state),
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                integrations: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                integrations: emptyFilter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(IntegrationsFilter)

export const PhoneIntegrationsFilterWithState = connect(
    (state: RootState) => ({
        value: getPageStatsFiltersWithLogicalOperators(state)[
            FilterKey.Integrations
        ],
        integrations: getPhoneIntegrations(state),
    }),
    {
        dispatchUpdate: (filter: Props['value']) =>
            mergeStatsFiltersWithLogicalOperator({
                integrations: filter,
            }),
        dispatchRemove: () =>
            mergeStatsFiltersWithLogicalOperator({
                integrations: emptyFilter,
            }),
        dispatchStatFiltersDirty: statFiltersDirty,
        dispatchStatFiltersClean: statFiltersClean,
    },
)(IntegrationsFilter)

export const IntegrationsFilterWithSavedState = connect(
    (state: RootState) => ({
        value: getSavedFiltersWithLogicalOperators(state)[
            FilterKey.Integrations
        ],
        integrations: getStatsMessagingAndAppIntegrations(state),
    }),
    {
        dispatchUpdate: (filter: Exclude<Props['value'], undefined>) =>
            upsertSavedFilterFilter({
                member: FilterKey.Integrations,
                operator: filter.operator,
                values: filter.values.map(String),
            }),
        dispatchRemove: () =>
            removeFilterFromSavedFilterDraft({
                filterKey: FilterKey.Integrations,
            }),
    },
)(IntegrationsFilter)
