import { ReactElement } from 'react'

import {
    FiltersPanel,
    FiltersPanelProps,
} from 'domains/reporting/pages/common/filters/FiltersPanel'
import css from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper.less'
import { SavedFiltersActions } from 'domains/reporting/pages/common/filters/SavedFiltersActions/SavedFiltersActions'
import { SavedFiltersPanel } from 'domains/reporting/pages/common/filters/SavedFiltersPanel'
import { getHideFiltersPanelOptionalFilters } from 'domains/reporting/state/ui/stats/filtersSlice'
import useAppSelector from 'hooks/useAppSelector'

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
    const shouldHideFilters = useAppSelector(getHideFiltersPanelOptionalFilters)

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
                    shouldHideFilters={shouldHideFilters}
                />
                {withSavedFilters && (
                    <SavedFiltersActions
                        optionalFilters={optionalFilters}
                        shouldHideFilters={shouldHideFilters}
                    />
                )}
            </div>
            {withSavedFilters && (
                <SavedFiltersPanel
                    persistentFilters={persistentFilters}
                    optionalFilters={optionalFilters}
                />
            )}
        </div>
    )
}

export default FiltersPanelWrapper
