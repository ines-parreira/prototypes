import { useMemo } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useTagResultsSelection } from 'hooks/useResultsSelection'
import { getEntitiesTags } from 'state/entities/tags/selectors'
import { getTagsOrder } from 'state/ui/stats/tagsReportSlice'

export const useTagsReportContext = () => {
    const tagsTableOrder = useAppSelector(getTagsOrder)
    const tags = useAppSelector(getEntitiesTags)
    const [tagResultsSelection] = useTagResultsSelection()

    const isReportingFilteringAndCalculationsTagsReportEnabled = useFlag(
        FeatureFlagKey.ReportingFilteringAndCalculationsTagsReport,
        false,
    )

    return useMemo(
        () => ({
            tags,
            tagsTableOrder,
            isExtendedReportingEnabled:
                isReportingFilteringAndCalculationsTagsReportEnabled,
            tagResultsSelection,
        }),
        [
            tags,
            tagsTableOrder,
            isReportingFilteringAndCalculationsTagsReportEnabled,
            tagResultsSelection,
        ],
    )
}
