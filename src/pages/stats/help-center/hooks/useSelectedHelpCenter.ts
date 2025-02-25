import { useMemo } from 'react'

import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import { useHelpCenterList } from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import { getHelpCenterDomain } from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { useStatsFilters } from 'pages/stats/help-center/hooks/useStatsFilters'
import { getSortByName } from 'utils/getSortByName'

export const useSelectedHelpCenter = () => {
    const { helpCenters, isLoading } = useHelpCenterList({
        per_page: HELP_CENTER_MAX_CREATION,
        type: 'faq',
    })
    const sortedHelpCenters = useMemo(
        () => helpCenters.sort(getSortByName),
        [helpCenters],
    )
    const statsFiltersInitState = useMemo(
        () => ({
            helpCenters: sortedHelpCenters[0] ? [sortedHelpCenters[0].id] : [],
            localeCodes: sortedHelpCenters[0]
                ? sortedHelpCenters[0].supported_locales
                : [],
        }),
        [sortedHelpCenters],
    )
    const [statsFilters, setStatsFilters] = useStatsFilters(
        statsFiltersInitState,
    )
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
        setStatsFilters,
        activeHelpCenters,
        sortedHelpCenters,
        helpCenters,
        helpCenterId: selectedHelpCenter?.id,
    }
}
