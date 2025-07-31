import { ReactElement } from 'react'

import { usePermittedFilters } from 'domains/reporting/hooks/filters/usePermittedFilters'
import {
    FiltersPanel,
    FiltersPanelProps,
} from 'domains/reporting/pages/common/filters/FiltersPanel'
import css from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper.less'
import {
    SavedFiltersActions,
    SavedFiltersActionsProps,
} from 'domains/reporting/pages/common/filters/SavedFiltersActions/SavedFiltersActions'
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
    const permittedOptionalFilters = usePermittedFilters(optionalFilters)

    return (
        <div className={css.outerWrapper}>
            <div className={css.wrapper}>
                <FiltersPanel
                    filterSettingsOverrides={filterSettingsOverrides}
                    optionalFilters={permittedOptionalFilters}
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
