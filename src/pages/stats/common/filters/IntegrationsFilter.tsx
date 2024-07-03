import React, {useCallback, useState} from 'react'

import {mergeStatsFilters} from 'state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import {Integration} from 'models/integration/types'
import {StatsFilters} from 'models/stat/types'

import Filter from 'pages/stats/common/components/Filter'
import {DropdownOption} from 'pages/stats/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {integrationFilterLogicalOperators} from 'pages/stats/common/filters/constants'

export const INTEGRATIONS_FILTER_NAME = 'Integrations'

type Props = {
    value: StatsFilters['integrations']
    integrations: Integration[]
}

export default function IntegrationsFilter({value, integrations}: Props) {
    const dispatch = useAppDispatch()
    const [selectedLogicalOperator, setSelectedLogicalOperator] =
        useState<LogicalOperatorEnum>(LogicalOperatorEnum['ONE_OF'])

    const getSelectedIntegrations = useCallback(() => {
        return integrations
            .filter((integration) => value?.includes(integration.id))
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

    const handleFilterChange = useCallback(
        (values: number[]) => {
            dispatch(statFiltersDirty())
            dispatch(
                mergeStatsFilters({
                    integrations: values,
                })
            )
        },
        [dispatch]
    )

    const onOptionChange = (opt: DropdownOption) => {
        const integration = integrations.find(
            (integration) => integration.id === Number(opt.value)
        )

        if (integration && value?.includes(integration.id)) {
            handleFilterChange(
                value?.filter(
                    (integrationId) => integrationId !== integration?.id
                )
            )
        } else if (integration && !value?.includes(integration.id)) {
            handleFilterChange([...(value || []), integration.id])
        }
    }

    const handleDropdownClosed = () => {
        dispatch(statFiltersClean())
    }

    return (
        <Filter
            filterName={INTEGRATIONS_FILTER_NAME}
            selectedOptions={getSelectedIntegrations()}
            selectedLogicalOperator={selectedLogicalOperator}
            logicalOperators={integrationFilterLogicalOperators}
            filterOptionGroups={integrationOptionGroups()}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterChange(
                    integrations.map((integration) => integration.id)
                )
            }}
            onRemoveAll={() => {
                handleFilterChange([])
            }}
            onRemove={() => {
                dispatch(mergeStatsFilters({integrations: []}))
            }}
            onChangeLogicalOperator={(operator) =>
                setSelectedLogicalOperator(operator)
            }
            onDropdownClosed={handleDropdownClosed}
        />
    )
}
