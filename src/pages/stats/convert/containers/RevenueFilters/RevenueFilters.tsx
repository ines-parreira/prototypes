import React from 'react'

import {DEPRECATED_CampaignStatusMultiSelect} from 'pages/stats/convert/components/DEPRECATED_CampaignStatusMultiSelect'
import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'

import {useCampaignStatsFilters} from 'pages/stats/convert/hooks/useCampaignStatsFilters'

import {CampaignMultiSelect} from 'pages/stats/convert/components/CampaignMultiSelect'
import {IntegrationMultiSelect} from 'pages/stats/convert/components/IntegrationMultiSelect'

import css from './RevenueFilters.less'

export const RevenueFilters = () => {
    const {
        campaigns,
        integrations,
        isStorePreSelected,
        selectedCampaigns,
        selectedCampaignStatuses,
        selectedIntegrations,
        selectedPeriod,
        onChangeCampaigns,
        onChangeCampaignsByStatus,
        onChangeIntegration,
    } = useCampaignStatsFilters()

    return (
        <div className={css.container}>
            {!isStorePreSelected && (
                <div className={css.filterItem}>
                    <IntegrationMultiSelect
                        integrations={integrations}
                        selected={selectedIntegrations}
                        isRequired
                        onChangeItem={onChangeIntegration}
                    />
                </div>
            )}

            <div className={css.filterItem}>
                <CampaignMultiSelect
                    campaigns={campaigns}
                    selected={selectedCampaigns}
                    onChangeItem={onChangeCampaigns}
                />
            </div>

            <div className={css.filterItem}>
                <DEPRECATED_CampaignStatusMultiSelect
                    selected={selectedCampaignStatuses}
                    onChangeItem={onChangeCampaignsByStatus}
                />
            </div>

            <div className={css.filterItem}>
                <PeriodStatsFilter
                    initialSettings={{
                        maxSpan: 90,
                    }}
                    value={selectedPeriod}
                    variant="ghost"
                />
            </div>
        </div>
    )
}
