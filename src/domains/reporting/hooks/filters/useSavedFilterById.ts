import { useListAnalyticsFilters } from '@gorgias/helpdesk-queries'

import { SavedFilterAPI } from 'domains/reporting/models/stat/types'
import { fromApiFormatted } from 'domains/reporting/pages/common/filters/helpers'

export const useSavedFilterById = (savedFilterId: number) => {
    return useListAnalyticsFilters(undefined, {
        query: {
            select(response) {
                const savedFilter = response.data.data.find(
                    (filter) => filter.id === savedFilterId,
                )

                if (!savedFilter) return null
                return fromApiFormatted(savedFilter as SavedFilterAPI)
            },
        },
    })
}
