import React, {useCallback, useMemo} from 'react'
import {connect} from 'react-redux'
import {useParams} from 'react-router-dom'
import {RemovableFilter} from 'pages/stats/common/filters/types'
import {
    getPageStatsFiltersWithLogicalOperators,
    getStatsMessagingAndAppIntegrations,
    getStoreIntegrationsStatsFilter,
} from 'state/stats/selectors'
import {emptyFilter} from 'pages/stats/common/filters/helpers'

import {mergeStatsFiltersWithLogicalOperator} from 'state/stats/statsSlice'
import useAppDispatch from 'hooks/useAppDispatch'
import {FilterKey, StatsFiltersWithLogicalOperator} from 'models/stat/types'

import Filter from 'pages/stats/common/components/Filter'
import {DropdownOption} from 'pages/stats/types'
import {RootState} from 'state/types'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {campaignsFilterLogicalOperators} from 'pages/stats/common/filters/constants'
import {useGetCampaignsForStore} from 'pages/stats/convert/hooks/useGetCampaignsForStore'
import {CONVERT_ROUTE_PARAM_NAME} from 'pages/convert/common/constants'
import {ConvertRouteParams} from 'pages/convert/common/types'
import useAppSelector from 'hooks/useAppSelector'
import {getIntegrationById} from 'state/integrations/selectors'

export const CAMPAIGNS_FILTER_NAME = 'Campaigns'

type Props = {
    value: StatsFiltersWithLogicalOperator['campaigns']
} & RemovableFilter

export default function CampaignsFilter({
    value = emptyFilter,
    initialiseAsOpen = false,
    onRemove,
}: Props) {
    const dispatch = useAppDispatch()

    const selectedStoreIntegrations = useAppSelector(
        getStoreIntegrationsStatsFilter
    )

    const {[CONVERT_ROUTE_PARAM_NAME]: chatIntegrationId} =
        useParams<ConvertRouteParams>()

    const chatIntegration = useAppSelector(
        getIntegrationById(parseInt(chatIntegrationId))
    )

    const storeIntegrationId = useMemo(
        () =>
            parseInt(
                chatIntegration.getIn(['meta', 'shop_integration_id']) ?? 0
            ),
        [chatIntegration]
    )

    const selectedIntegrations = useMemo(() => {
        if (storeIntegrationId) return [storeIntegrationId]

        return selectedStoreIntegrations
    }, [storeIntegrationId, selectedStoreIntegrations])

    const {campaigns} = useGetCampaignsForStore(
        selectedIntegrations,
        chatIntegration.getIn(['meta', 'app_id']),
        true
    )

    const getSelectedCampaigns = useMemo(() => {
        return campaigns
            .filter((campaign) => value.values.includes(campaign.id))
            .map((campaign) => ({
                label: campaign.name,
                value: campaign.id,
            }))
    }, [value, campaigns])

    const campaignsOptionGroups = useMemo(() => {
        return [
            {
                options: campaigns.map((campaign) => ({
                    label: campaign.name,
                    value: campaign.id,
                })),
            },
        ]
    }, [campaigns])

    const handleFilterValuesChange = useCallback(
        (values: string[]) => {
            dispatch(
                mergeStatsFiltersWithLogicalOperator({
                    campaigns: {
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
                    campaigns: {
                        values: value.values,
                        operator: operator,
                    },
                })
            )
        },
        [dispatch, value.values]
    )

    const onOptionChange = (opt: DropdownOption) => {
        const id = opt.value
        if (value.values.includes(id)) {
            handleFilterValuesChange(
                value.values.filter((campaign) => campaign !== id)
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
            filterName={CAMPAIGNS_FILTER_NAME}
            selectedOptions={getSelectedCampaigns}
            selectedLogicalOperator={value.operator}
            logicalOperators={campaignsFilterLogicalOperators}
            filterOptionGroups={campaignsOptionGroups}
            onChangeOption={onOptionChange}
            onSelectAll={() => {
                handleFilterValuesChange(
                    campaigns.map((campaign) => campaign.id)
                )
            }}
            onRemoveAll={() => {
                handleFilterValuesChange([])
            }}
            onRemove={() => {
                dispatch(
                    mergeStatsFiltersWithLogicalOperator({
                        campaigns: emptyFilter,
                    })
                )
                onRemove?.()
            }}
            onChangeLogicalOperator={handleFilterOperatorChange}
            onDropdownOpen={handleDropdownOpen}
            onDropdownClosed={handleDropdownClosed}
            initialiseAsOpen={initialiseAsOpen}
        />
    )
}

export const CampaignsFilterWithState = connect((state: RootState) => ({
    value: getPageStatsFiltersWithLogicalOperators(state)[FilterKey.Campaigns],
    integrations: getStatsMessagingAndAppIntegrations(state),
}))(CampaignsFilter)
