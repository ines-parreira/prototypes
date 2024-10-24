import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {ReactElement} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {
    FiltersPanel,
    FiltersPanelProps,
} from 'pages/stats/common/filters/FiltersPanel'
import css from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper.less'
import {SavedFiltersActions} from 'pages/stats/common/filters/SavedFiltersActions/SavedFiltersActions'

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
