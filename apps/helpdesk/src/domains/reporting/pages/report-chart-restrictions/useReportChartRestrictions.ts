import { useCallback, useMemo } from 'react'

import type { Map as ImmutableMap } from 'immutable'

import { useReportRestrictions } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import {
    getComponentConfig,
    getReportConfig,
    getReportConfigFromPath,
} from 'domains/reporting/pages/dashboards/config'
import type { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type {
    ChartRestriction,
    ModuleRestriction,
    ReportRestriction,
} from 'domains/reporting/pages/report-chart-restrictions/config'
import {
    RBAC_RESTRICTIONS,
    RestrictedComponentType,
} from 'domains/reporting/pages/report-chart-restrictions/config'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { hasRole } from 'utils'

export const getAccountRestrictions = (currentAccountId: number) => {
    const currentConfigurations = RBAC_RESTRICTIONS[currentAccountId]
    return currentConfigurations !== undefined ? currentConfigurations : []
}

export const getUserModuleRestrictions = (
    currentUser: ImmutableMap<any, any>,
    accountRestrictions: (
        | ChartRestriction
        | ReportRestriction
        | ModuleRestriction
    )[],
) => {
    return accountRestrictions.filter(
        (configuration) =>
            !hasRole(currentUser, configuration.role) &&
            configuration.type === RestrictedComponentType.Module,
    )
}

export const getUserReportsRestrictions = (
    currentUser: ImmutableMap<any, any>,
    accountRestrictions: (
        | ChartRestriction
        | ReportRestriction
        | ModuleRestriction
    )[],
) => {
    return accountRestrictions.filter(
        (configuration) =>
            !hasRole(currentUser, configuration.role) &&
            configuration.type === RestrictedComponentType.Report,
    )
}

export const getUserChartsRestrictions = (
    currentUser: ImmutableMap<any, any>,
    accountRestrictions: (
        | ChartRestriction
        | ReportRestriction
        | ModuleRestriction
    )[],
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
    const { reportRestrictionsMap, moduleRestrictionsMap } =
        useReportRestrictions()

    const accountRestrictions = useMemo(
        () => getAccountRestrictions(currentAccountId),
        [currentAccountId],
    )

    const moduleRestrictions = useMemo(
        () => getUserModuleRestrictions(currentUser, accountRestrictions),
        [accountRestrictions, currentUser],
    )

    const userReportRestrictions = useMemo(
        () => getUserReportsRestrictions(currentUser, accountRestrictions),
        [accountRestrictions, currentUser],
    )

    const userChartRestrictions = useMemo(
        () => getUserChartsRestrictions(currentUser, accountRestrictions),
        [accountRestrictions, currentUser],
    )

    const isModuleRestrictedToCurrentUser = useCallback(
        (url: string): boolean => {
            const globallyRestricted = !!moduleRestrictionsMap[url]
            return (
                globallyRestricted ||
                !!moduleRestrictions.find((restriction) =>
                    restriction.ids.find(
                        (restrictionUrl) => restrictionUrl === url,
                    ),
                )
            )
        },
        [moduleRestrictions, moduleRestrictionsMap],
    )

    const isRouteRestrictedToCurrentUser = useCallback(
        (url: string): boolean => {
            const config = getReportConfigFromPath(url)
            if (!config) {
                return false
            }
            const isReportRestricted = !!reportRestrictionsMap[config.id]

            return (
                isReportRestricted ||
                !!userReportRestrictions.find((restriction) =>
                    restriction.ids.find((id) => id === config.id),
                )
            )
        },
        [reportRestrictionsMap, userReportRestrictions],
    )

    const isReportRestrictedToCurrentUser = useCallback(
        (reportId: ReportsIDs): boolean => {
            const config = getReportConfig(reportId)
            if (!config) {
                return false
            }
            const isReportRestricted = !!reportRestrictionsMap[config.id]

            return (
                isReportRestricted ||
                !!userReportRestrictions.find((restriction) =>
                    restriction.ids.find((id) => id === config.id),
                )
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
            const path = `${STATS_ROUTE_PREFIX}${reportConfig.reportPath}`
            const isPathRestricted = !!reportRestrictionsMap[path]
            const isChartPartOfRestrictedReport =
                isRouteRestrictedToCurrentUser(path)
            return (
                isChartStrictlyRestricted ||
                isChartPartOfRestrictedReport ||
                isPathRestricted
            )
        },
        [
            isRouteRestrictedToCurrentUser,
            reportRestrictionsMap,
            userChartRestrictions,
        ],
    )

    return {
        isRouteRestrictedToCurrentUser,
        isReportRestrictedToCurrentUser,
        isChartRestrictedToCurrentUser,
        isModuleRestrictedToCurrentUser,
    }
}
