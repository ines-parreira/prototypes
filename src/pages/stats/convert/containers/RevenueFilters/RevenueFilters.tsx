import React from 'react'

import PeriodStatsFilter from 'pages/stats/common/filters/DEPRECATED_PeriodStatsFilter'

import {CampaignStatusMultiSelect} from 'pages/stats/convert/components/CampaignStatusMultiSelect'
import {useCampaignStatsFilters} from '../../hooks/useCampaignStatsFilters'

import {CampaignMultiSelect} from '../../components/CampaignMultiSelect'
import {IntegrationMultiSelect} from '../../components/IntegrationMultiSelect'

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
                <CampaignStatusMultiSelect
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
