import {FunctionComponent, ReactNode} from 'react'

export type ReportConfig<T extends string> = {
    reportName: string
    reportPath: string
    charts: Record<
        T,
        {
            chartComponent: FunctionComponent
            label: ReactNode
        }
    >
}
