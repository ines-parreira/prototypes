import type { ReactElement } from 'react'

import type { FiltersPanelProps } from 'domains/reporting/pages/common/filters/FiltersPanel'
import { FiltersPanel } from 'domains/reporting/pages/common/filters/FiltersPanel'
import css from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper.less'
import type { SavedFiltersActionsProps } from 'domains/reporting/pages/common/filters/SavedFiltersActions/SavedFiltersActions'
import { SavedFiltersActions } from 'domains/reporting/pages/common/filters/SavedFiltersActions/SavedFiltersActions'
import { SavedFiltersPanel } from 'domains/reporting/pages/common/filters/SavedFiltersPanel'
import { getHideFiltersPanelOptionalFilters } from 'domains/reporting/state/ui/stats/filtersSlice'
import useAppSelector from 'hooks/useAppSelector'

export type FiltersPanelWrapperProps = Omit<
    FiltersPanelProps,
    'cleanStatsFilters' | 'filterComponentMap'
> & {
    withSavedFilters?: boolean
    pinnedFilter?: SavedFiltersActionsProps['pinnedFilter']
    compact?: boolean
}

export const FiltersPanelWrapper = ({
    optionalFilters = [],
    filterSettingsOverrides,
    persistentFilters,
    withSavedFilters = true,
    pinnedFilter,
    compact = false,
}: FiltersPanelWrapperProps): ReactElement => {
    const shouldHideFilters = useAppSelector(getHideFiltersPanelOptionalFilters)

    return (
        <div className={css.outerWrapper}>
            <div className={compact ? css.wrapperCompact : css.wrapper}>
                <FiltersPanel
                    filterSettingsOverrides={filterSettingsOverrides}
                    optionalFilters={optionalFilters}
                    persistentFilters={persistentFilters}
                    applicableFilters={[
                        ...(persistentFilters || []),
                        ...optionalFilters,
                    ]}
                    shouldHideFilters={shouldHideFilters}
                    compact={compact}
                />
                {withSavedFilters && (
                    <SavedFiltersActions
                        optionalFilters={optionalFilters}
                        shouldHideFilters={shouldHideFilters}
                        pinnedFilter={pinnedFilter}
                    />
                )}
            </div>
            {withSavedFilters && (
                <SavedFiltersPanel
                    persistentFilters={persistentFilters}
                    optionalFilters={optionalFilters}
                    pinnedFilter={pinnedFilter}
                />
            )}
        </div>
    )
}

export default FiltersPanelWrapper
