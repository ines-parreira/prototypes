export enum CustomReportChildType {
    Row = 'row',
    Section = 'section',
    Chart = 'chart',
}

export type CustomReportRowSchema = {
    type: CustomReportChildType.Row
    children: CustomReportChartSchema[]
}

export type CustomReportSectionSchema = {
    type: CustomReportChildType.Section
    children: (CustomReportRowSchema | CustomReportChartSchema)[]
}

export type CustomReportChartSchema = {
    type: CustomReportChildType.Chart
    config_id: string
}

export type CustomReportChild =
    | CustomReportRowSchema
    | CustomReportSectionSchema
    | CustomReportChartSchema

export type CustomReportSchema = {
    id: number
    name: string
    analytics_filter_id: number | null
    children: CustomReportChild[]
    emoji: string | null | undefined
}
