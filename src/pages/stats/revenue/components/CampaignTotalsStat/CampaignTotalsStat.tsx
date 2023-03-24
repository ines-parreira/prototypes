import React, {useEffect, useState} from 'react'
import {fromJS} from 'immutable'
import {useAsyncFn} from 'react-use'
import KeyMetricStatWrapper from 'pages/stats/KeyMetricStatWrapper'
import KeyMetricStat from 'pages/stats/common/components/charts/KeyMetricStat'
import {CAMPAIGN_OVERVIEW, stats as statsConfig} from 'config/stats'
import {useCampaignStatsFilters} from 'pages/stats/revenue/hooks/useCampaignStatsFilters'
import {CampaignsTotals} from 'pages/stats/revenue/services/types'
import {getTotals} from 'pages/stats/revenue/services/CampaignPerformanceService'
import {useGetCurrencyForStore} from 'pages/stats/revenue/hooks/useGetCurrencyForStore'
import {useGetNamespacedShopNameForStore} from 'pages/stats/revenue/hooks/useGetNamespacedShopNameForStore'

type Props = {
    onError: (error: Error) => void
}

export const CampaignTotalsStat = ({onError}: Props) => {
    const [totals, setTotals] = useState<CampaignsTotals>([])

    const {selectedIntegrations, selectedCampaigns, selectedPeriod} =
        useCampaignStatsFilters()
    const currency = useGetCurrencyForStore(selectedIntegrations)
    const namespacedShopName =
        useGetNamespacedShopNameForStore(selectedIntegrations)

    const [{loading}, fetchTotals] = useAsyncFn(async () => {
        try {
            const data = await getTotals(
                namespacedShopName,
                selectedCampaigns,
                currency,
                selectedPeriod.start_datetime,
                selectedPeriod.end_datetime
            )
            setTotals(data)
        } catch (error) {
            onError(error)
        }
    }, [namespacedShopName, selectedCampaigns, selectedPeriod, currency])

    useEffect(() => void fetchTotals(), [fetchTotals])

    return (
        <KeyMetricStatWrapper>
            <KeyMetricStat
                data={fromJS(totals)}
                meta={fromJS({})}
                loading={loading}
                config={statsConfig.get(CAMPAIGN_OVERVIEW)}
            />
        </KeyMetricStatWrapper>
    )
}
