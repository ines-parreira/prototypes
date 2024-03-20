import React from 'react'

import PeriodStatsFilter from 'pages/stats/PeriodStatsFilter'

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
        selectedIntegrations,
        selectedPeriod,
        onChangeCampaigns,
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
                <PeriodStatsFilter
                    initialSettings={{
                        maxSpan: 365,
                    }}
                    value={selectedPeriod}
                    variant="ghost"
                />
            </div>
        </div>
    )
}
