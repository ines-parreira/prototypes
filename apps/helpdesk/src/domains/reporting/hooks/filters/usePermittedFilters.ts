import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { OptionalFilter } from 'domains/reporting/pages/common/filters/FiltersPanel'

export const usePermittedFilters = (optionalFilters: OptionalFilter[]) => {
    const isMultiStoreFilterEnabled = useFlag(
        FeatureFlagKey.ReportingMultiStoreFilter,
    )

    if (!isMultiStoreFilterEnabled) {
        return optionalFilters.filter(
            (filter: OptionalFilter) => filter !== FilterKey.Stores,
        )
    }

    return optionalFilters
}
