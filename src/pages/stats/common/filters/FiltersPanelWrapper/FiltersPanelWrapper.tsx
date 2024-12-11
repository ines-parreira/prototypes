import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {ReactElement} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {
    FiltersPanel,
    FiltersPanelProps,
} from 'pages/stats/common/filters/FiltersPanel'
import css from 'pages/stats/common/filters/FiltersPanelWrapper/FiltersPanelWrapper.less'
import {SavedFiltersActions} from 'pages/stats/common/filters/SavedFiltersActions/SavedFiltersActions'
import {SavedFiltersPanel} from 'pages/stats/common/filters/SavedFiltersPanel'
import {getShouldDisableFiltersPanelActions} from 'state/ui/stats/filtersSlice'

type Props = Omit<
    FiltersPanelProps,
    'cleanStatsFilters' | 'filterComponentMap'
> & {
    withSavedFilters?: boolean
}

export const FiltersPanelWrapper = ({
    optionalFilters = [],
    filterSettingsOverrides,
    persistentFilters,
    withSavedFilters = true,
}: Props): ReactElement => {
    const isAnalyticsSavedFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsSavedFilters]

    const isDisabled = useAppSelector(getShouldDisableFiltersPanelActions)

    return (
        <div className={css.outerWrapper}>
            <div className={css.wrapper}>
                <FiltersPanel
                    filterSettingsOverrides={filterSettingsOverrides}
                    optionalFilters={optionalFilters}
                    persistentFilters={persistentFilters}
                    applicableFilters={[
                        ...(persistentFilters || []),
                        ...optionalFilters,
                    ]}
                    isDisabled={isDisabled}
                />
                {isAnalyticsSavedFilters && withSavedFilters && (
                    <SavedFiltersActions
                        optionalFilters={optionalFilters}
                        isDisabled={isDisabled}
                    />
                )}
            </div>
            {isAnalyticsSavedFilters && withSavedFilters && (
                <SavedFiltersPanel
                    persistentFilters={persistentFilters}
                    optionalFilters={optionalFilters}
                />
            )}
        </div>
    )
}

export default FiltersPanelWrapper
