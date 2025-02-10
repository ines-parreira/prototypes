import {UserRole} from 'config/types/user'
import {ReportsIDs} from 'pages/stats/custom-reports/config'

export const testAccountId = 6069 // account id of artemisathletix as a temporary test customer

export enum RestrictedComponentType {
    Report = 'report',
    Chart = 'chart',
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
    [accountId: number]: (ChartRestriction | ReportRestriction)[]
}

export const RBAC_RESTRICTIONS: RestrictionsPerCustomer = {
    [testAccountId]: [
        {
            ids: [ReportsIDs.SupportPerformanceAgentsReportConfig],
            type: RestrictedComponentType.Report,
            role: UserRole.Agent,
        },
    ],
}
