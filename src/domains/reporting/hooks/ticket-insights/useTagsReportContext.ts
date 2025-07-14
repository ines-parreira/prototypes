import { useMemo } from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useTagResultsSelection } from 'domains/reporting/hooks/tags/useTagResultsSelection'
import {
    Entity,
    useTicketTimeReference,
} from 'domains/reporting/hooks/ticket-insights/useTicketTimeReference'
import { getTagsOrder } from 'domains/reporting/state/ui/stats/tagsReportSlice'
import useAppSelector from 'hooks/useAppSelector'
import { getEntitiesTags } from 'state/entities/tags/selectors'

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
