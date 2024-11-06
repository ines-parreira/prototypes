import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {ReactElement} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    FiltersPanel,
    FiltersPanelProps,
} from 'pages/stats/common/filters/FiltersPanel'
import css from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper.less'
import {SavedFiltersActions} from 'pages/stats/common/filters/SavedFiltersActions/SavedFiltersActions'
import {SavedFiltersPanel} from 'pages/stats/common/filters/SavedFiltersPanel'
import {CampaignStatsFilters} from 'pages/stats/convert/providers/CampaignStatsFilters'

export const FiltersPanelWrapper = ({
    optionalFilters,
    filterSettingsOverrides,
    persistentFilters,
}: Omit<
    FiltersPanelProps,
    'cleanStatsFilters' | 'filterComponentMap'
>): ReactElement => {
    const isAnalyticsSavedFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsSavedFilters]

    return (
        <>
            <div className={css.wrapper}>
                <FiltersPanel
                    filterSettingsOverrides={filterSettingsOverrides}
                    optionalFilters={optionalFilters}
                    persistentFilters={persistentFilters}
                />
                {isAnalyticsSavedFilters && (
                    <SavedFiltersActions
                        optionalFilters={optionalFilters}
                        savedFilters={[]}
                        onSaveFilters={() => {}}
                    />
                )}
            </div>
            {isAnalyticsSavedFilters && (
                <div>
                    <CampaignStatsFilters>
                        <SavedFiltersPanel />
                    </CampaignStatsFilters>
                </div>
            )}
        </>
    )
}

export default FiltersPanelWrapper
