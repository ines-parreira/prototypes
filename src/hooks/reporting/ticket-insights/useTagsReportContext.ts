import { useMemo } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useTagResultsSelection } from 'hooks/reporting/tags/useTagResultsSelection'
import {
    Entity,
    useTicketTimeReference,
} from 'hooks/reporting/ticket-insights/useTicketTimeReference'
import useAppSelector from 'hooks/useAppSelector'
import { getEntitiesTags } from 'state/entities/tags/selectors'
import { getTagsOrder } from 'state/ui/stats/tagsReportSlice'

export const useTagsReportContext = () => {
    const tagsTableOrder = useAppSelector(getTagsOrder)
    const tags = useAppSelector(getEntitiesTags)
    const [tagResultsSelection] = useTagResultsSelection()
    const [tagTicketTimeReference] = useTicketTimeReference(Entity.Tag)

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
            tagTicketTimeReference,
        }),
        [
            tags,
            tagsTableOrder,
            isReportingFilteringAndCalculationsTagsReportEnabled,
            tagResultsSelection,
            tagTicketTimeReference,
        ],
    )
}
