import { useMemo } from 'react'

import { getSortByName } from '@repo/utils'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { useHelpCenterStatsFilters } from 'domains/reporting/pages/help-center/hooks/useHelpCenterStatsFilters'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import { getHelpCenterDomain } from 'pages/settings/helpCenter/utils/helpCenter.utils'

export const useSelectedHelpCenter = () => {
    const { cleanStatsFilters } = useStatsFilters()
    const { helpCenters, isLoading } = useHelpCenterList({
        per_page: HELP_CENTER_MAX_CREATION,
        type: 'faq',
    })

    const sortedHelpCenters = useMemo(
        () => helpCenters.sort(getSortByName),
        [helpCenters],
    )

    const defaultHelpCenterId = useMemo(
        () =>
            cleanStatsFilters?.helpCenters?.values?.[0] ||
            sortedHelpCenters?.[0]?.id,
        [cleanStatsFilters?.helpCenters, sortedHelpCenters],
    )

    const defaultLocaleCodesIds = useMemo(
        () =>
            cleanStatsFilters?.localeCodes?.values ||
            sortedHelpCenters?.[0]?.supported_locales,
        [cleanStatsFilters?.localeCodes, sortedHelpCenters],
    )

    const defaultLocaleCodesOperator = useMemo(
        () => cleanStatsFilters?.localeCodes?.operator,
        [cleanStatsFilters?.localeCodes],
    )

    const statsFiltersInitState = useMemo(
        () => ({
            helpCenters: withDefaultLogicalOperator(
                defaultHelpCenterId ? [defaultHelpCenterId] : [],
            ),
            localeCodes: withDefaultLogicalOperator(
                defaultLocaleCodesIds || [],
                defaultLocaleCodesOperator,
            ),
        }),
        [
            defaultLocaleCodesIds,
            defaultLocaleCodesOperator,
            defaultHelpCenterId,
        ],
    )
    const [statsFilters] = useHelpCenterStatsFilters(statsFiltersInitState)

    const activeHelpCenters = useMemo(
        () =>
            helpCenters.filter(
                (helpCenter) => helpCenter.deactivated_datetime === null,
            ),
        [helpCenters],
    )
    const selectedHelpCenter =
        helpCenters.find((helpCenter) =>
            statsFilters.helpCenters?.values?.includes(helpCenter.id),
        ) ?? helpCenters[0]

    const selectedHelpCenterDomain = selectedHelpCenter
        ? getHelpCenterDomain(selectedHelpCenter)
        : undefined

    return {
        isLoading,
        selectedHelpCenter,
        selectedHelpCenterDomain,
        statsFilters,
        activeHelpCenters,
        sortedHelpCenters,
        helpCenters,
        helpCenterId: selectedHelpCenter?.id,
    }
}
