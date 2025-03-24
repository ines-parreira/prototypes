import { UserRole } from 'config/types/user'
import { ReportsIDs } from 'pages/stats/dashboards/constants'

const LOOPY_CASES_ACCOUNT_ID = 141994

export enum RestrictedComponentType {
    Module = 'module',
    Report = 'report',
    Chart = 'chart',
}

export type ModuleRestriction = {
    type: RestrictedComponentType.Module
    ids: string[]
    role: UserRole
}

export type ReportRestriction = {
    type: RestrictedComponentType.Report
    ids: ReportsIDs[]
    role: UserRole
}

export type ChartRestriction = {
    type: RestrictedComponentType.Chart
    ids: string[]
    role: UserRole
}

export type RestrictionsPerCustomer = {
    [accountId: number]: (
        | ChartRestriction
        | ReportRestriction
        | ModuleRestriction
    )[]
}

export const RBAC_RESTRICTIONS: RestrictionsPerCustomer = {
    [LOOPY_CASES_ACCOUNT_ID]: [
        {
            ids: [
                ReportsIDs.SupportPerformanceAgentsReportConfig,
                ReportsIDs.SupportPerformanceRevenueReportConfig,
            ],
            type: RestrictedComponentType.Report,
            role: UserRole.Agent,
        },
    ],
}
