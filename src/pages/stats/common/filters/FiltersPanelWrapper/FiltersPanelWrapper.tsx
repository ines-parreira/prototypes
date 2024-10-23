import React, {ReactElement} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {SavedFiltersActions} from 'pages/stats/common/filters/SavedFiltersActions/SavedFiltersActions'
import css from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper.less'
import {FeatureFlagKey} from 'config/featureFlags'
import {
    FiltersPanel,
    FiltersPanelProps,
} from 'pages/stats/common/filters/FiltersPanel'

export const FiltersPanelWrapper = ({
    optionalFilters,
    filterSettingsOverrides,
    persistentFilters,
}: FiltersPanelProps): ReactElement => {
    const isAnalyticsSavedFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsSavedFilters]

    return (
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
    )
}

export default FiltersPanelWrapper
