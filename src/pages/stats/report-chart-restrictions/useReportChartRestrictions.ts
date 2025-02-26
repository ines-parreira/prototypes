import { useCallback, useMemo } from 'react'

import { useReportRestrictions } from 'hooks/reporting/custom-reports/useReportRestrictions'
import useAppSelector from 'hooks/useAppSelector'
import { STATS_ROUTE_PREFIX } from 'pages/stats/common/components/constants'
import {
    getComponentConfig,
    getReportConfig,
} from 'pages/stats/custom-reports/config'
import {
    ChartRestriction,
    RBAC_RESTRICTIONS,
    ReportRestriction,
    RestrictedComponentType,
} from 'pages/stats/report-chart-restrictions/config'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export const getAccountRestrictions = (currentAccountId: number) => {
    const currentConfigurations = RBAC_RESTRICTIONS[currentAccountId]
    return currentConfigurations !== undefined ? currentConfigurations : []
}

export const getUserReportsRestrictions = (
    currentUser: Immutable.Map<any, any>,
    accountRestrictions: (ChartRestriction | ReportRestriction)[],
) => {
    return accountRestrictions.filter(
        (configuration) =>
            !hasRole(currentUser, configuration.role) &&
            configuration.type === RestrictedComponentType.Report,
    )
}

export const getUserChartsRestrictions = (
    currentUser: Immutable.Map<any, any>,
    accountRestrictions: (ChartRestriction | ReportRestriction)[],
) => {
    return accountRestrictions.filter(
        (configuration) =>
            !hasRole(currentUser, configuration.role) &&
            configuration.type === RestrictedComponentType.Chart,
    )
}

export const useReportChartRestrictions = () => {
    const currentAccountId = useAppSelector(getCurrentAccountId)
    const currentUser = useAppSelector(getCurrentUser)
    const { reportRestrictionsMap, chartRestrictionsMap } =
        useReportRestrictions()

    const accountRestrictions = useMemo(
        () => getAccountRestrictions(currentAccountId),
        [currentAccountId],
    )

    const userReportRestrictions = useMemo(
        () => getUserReportsRestrictions(currentUser, accountRestrictions),
        [accountRestrictions, currentUser],
    )

    const userChartRestrictions = useMemo(
        () => getUserChartsRestrictions(currentUser, accountRestrictions),
        [accountRestrictions, currentUser],
    )

    const isRouteRestrictedToCurrentUser = useCallback(
        (url: string, isPartialPath?: boolean): boolean => {
            return !!userReportRestrictions.find((restriction) =>
                restriction.ids.find((id) => {
                    const path = getReportConfig(id, true)?.reportPath
                    if (!path) {
                        return false
                    }

                    const isPathRestricted = !!reportRestrictionsMap[path]
                    const isReportRestrictedToCurrentUser = isPartialPath
                        ? url === path
                        : url === `${STATS_ROUTE_PREFIX}${path}`

                    return isPathRestricted || isReportRestrictedToCurrentUser
                }),
            )
        },
        [reportRestrictionsMap, userReportRestrictions],
    )

    const isChartRestrictedToCurrentUser = useCallback(
        (chartId: string): boolean => {
            const isChartStrictlyRestricted = !!userChartRestrictions.find(
                (restriction) =>
                    restriction.type === RestrictedComponentType.Chart &&
                    restriction.ids.includes(chartId),
            )

            const { reportConfig } = getComponentConfig(chartId, true)
            if (!reportConfig) {
                return false
            }
            const path = reportConfig.reportPath
            const isPathRestricted = !!reportRestrictionsMap[path]
            const isChartRestricted = !!chartRestrictionsMap[chartId]
            const isChartPartOfRestrictedReport =
                isRouteRestrictedToCurrentUser(path, true)
            return (
                isChartStrictlyRestricted ||
                isChartPartOfRestrictedReport ||
                isPathRestricted ||
                isChartRestricted
            )
        },
        [
            isRouteRestrictedToCurrentUser,
            reportRestrictionsMap,
            chartRestrictionsMap,
            userChartRestrictions,
        ],
    )

    return {
        isRouteRestrictedToCurrentUser,
        isChartRestrictedToCurrentUser,
    }
}
