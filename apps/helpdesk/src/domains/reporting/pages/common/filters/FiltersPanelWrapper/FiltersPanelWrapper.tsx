import type { ReactElement } from 'react'

import { usePermittedFilters } from 'domains/reporting/hooks/filters/usePermittedFilters'
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
}

export const FiltersPanelWrapper = ({
    optionalFilters = [],
    filterSettingsOverrides,
    persistentFilters,
    withSavedFilters = true,
    pinnedFilter,
}: FiltersPanelWrapperProps): ReactElement => {
    const shouldHideFilters = useAppSelector(getHideFiltersPanelOptionalFilters)
    const permittedFilters = usePermittedFilters(optionalFilters)

    return (
        <div className={css.outerWrapper}>
            <div className={css.wrapper}>
                <FiltersPanel
                    filterSettingsOverrides={filterSettingsOverrides}
                    optionalFilters={permittedFilters}
                    persistentFilters={persistentFilters}
                    applicableFilters={[
                        ...(persistentFilters || []),
                        ...permittedFilters,
                    ]}
                    shouldHideFilters={shouldHideFilters}
                />
                {withSavedFilters && (
                    <SavedFiltersActions
                        optionalFilters={permittedFilters}
                        shouldHideFilters={shouldHideFilters}
                        pinnedFilter={pinnedFilter}
                    />
                )}
            </div>
            {withSavedFilters && (
                <SavedFiltersPanel
                    persistentFilters={persistentFilters}
                    optionalFilters={permittedFilters}
                    pinnedFilter={pinnedFilter}
                />
            )}
        </div>
    )
}

export default FiltersPanelWrapper
