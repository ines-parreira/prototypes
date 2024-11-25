import {FunctionComponent, ReactNode} from 'react'

export type DataExportHook = () => {
    files: Record<string, string>
    fileName: string
    isLoading: boolean
}

export type ReportConfig<T extends string> = {
    reportName: string
    reportPath: string
    charts: Record<
        T,
        {
            chartComponent: FunctionComponent
            label: ReactNode
            csvProducer: DataExportHook | null
        }
    >
}
