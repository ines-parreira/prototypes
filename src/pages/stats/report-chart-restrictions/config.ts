import { UserRole } from 'config/types/user'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import { BASE_STATS_PATH } from 'routes/constants'

const LOOPY_CASES_ACCOUNT_ID = 141994
const DOSSIER_CASES_ACCOUNT_ID = 12945

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
    [DOSSIER_CASES_ACCOUNT_ID]: [
        {
            ids: [BASE_STATS_PATH],
            type: RestrictedComponentType.Module,
            role: UserRole.Admin,
        },
    ],
}
