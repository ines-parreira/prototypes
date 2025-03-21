import { ReactElement } from 'react'

import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'

export const ProtectedRoute = ({
    children,
    path,
}: {
    children: ReactElement<any, any>
    path: string | string[]
}) => {
    const { isRouteRestrictedToCurrentUser, isModuleRestrictedToCurrentUser } =
        useReportChartRestrictions()

    if (
        path &&
        typeof path === 'string' &&
        (isRouteRestrictedToCurrentUser(path) ||
            isModuleRestrictedToCurrentUser(path))
    ) {
        return null
    }

    return children
}
