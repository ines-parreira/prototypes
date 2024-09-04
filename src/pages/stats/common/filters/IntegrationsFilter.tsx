import React, {useCallback} from 'react'
import {connect} from 'react-redux'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {getPhoneIntegrations} from 'state/integrations/selectors'
import {
    getPageStatsFiltersWithLogicalOperators,
    getStatsMessagingAndAppIntegrations,
} from 'state/stats/selectors'
import {emptyFilter} from 'pages/stats/common/filters/helpers'

import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import {Integration} from 'models/integration/types'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'

import Filter from 'pages/stats/common/components/Filter'
import {DropdownOption} from 'pages/stats/types'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {
    integrationsFilterLogicalOperators,
    FilterLabels,
} from 'pages/stats/common/filters/constants'

type Props = {
    value: StatsFiltersWithLogicalOperator[FilterKey.Integrations]
    integrations: Integration[]
} & RemovableFilter

export function IntegrationsFilter({
    value = emptyFilter,
    integrations,
    initializeAsOpen = false,
    onRemove,
}: Props) {
    const dispatch = useAppDispatch()

    const getSelectedIntegrations = useCallback(() => {
        return integrations
            .filter((integration) => value.values.includes(integration.id))
            .map((integration) => ({
                label: integration.name,
                value: `${integration.id}`,
            }))
    }, [value, integrations])

    const integrationOptionGroups = () => {
        return [
            {
                options: integrations.map((integration) => ({
                    label: integration.name,
                    value: `${integration.id}`,
                })),
            },
        ]
    }

    const handleFilterValuesChange = useCallback(
        (values: number[]) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    integrations: {
                        values,
                        operator: value.operator,
                    },
                })
            )
        },
        [dispatch, value.operator]
    )

    const handleFilterOperatorChange = useCallback(
        (operator: LogicalOperatorEnum) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    integrations: {
                        values: value.values,
                        operator: operator,
                    },
                })
            )
        },
        [dispatch, value.values]
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = Number(opt.value)
        if (value.values.includes(id)) {
            handleFilterValuesChange(
                value.values.filter((integrationId) => integrationId !== id)
            )
        } else {
            handleFilterValuesChange([...value.values, id])
        }
    }

    const handleDropdownOpen = () => {
        dispatch(statFiltersDirty())
    }
    const handleDropdownClosed = () => {
        dispatch(statFiltersClean())
    }

    return (
        <Filter
            filterName={FilterLabels[FilterKey.Integrations]}
            selectedOptions={getSelectedIntegrations()}
            selectedLogicalOperator={value.operator}
            logicalOperators={integrationsFilterLogicalOperators}
            filterOptionGroups={integrationOptionGroups()}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    integrations.map((integration) => integration.id)
                )
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        integrations: emptyFilter,
                    })
                )
                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initializeAsOpen={initializeAsOpen}
        />
    )
}

export const IntegrationsFilterWithState = connect((state: RootState) => ({
    value: getPageStatsFiltersWithLogicalOperators(state)[
        FilterKey.Integrations
    ],
    integrations: getStatsMessagingAndAppIntegrations(state),
}))(IntegrationsFilter)

export const PhoneIntegrationsFilterWithState = connect((state: RootState) => ({
    value: getPageStatsFiltersWithLogicalOperators(state)[
        FilterKey.Integrations
    ],
    integrations: getPhoneIntegrations(state),
}))(IntegrationsFilter)
