import {
    AnalyticsCustomReport,
    AnalyticsCustomReportChartSchema,
    AnalyticsCustomReportRowSchema,
    AnalyticsCustomReportRowSchemaChildrenItemType,
    AnalyticsCustomReportRowSchemaType,
    AnalyticsCustomReportSectionSchema,
    AnalyticsCustomReportSectionSchemaChildrenItem,
    AnalyticsCustomReportSectionSchemaType,
    AnalyticsCustomReportType,
} from '@gorgias/api-types'

import {
    CustomReportSchema,
    CustomReportChildType,
} from 'pages/stats/custom-reports/types'
import {customReportFromApi} from 'pages/stats/custom-reports/utils'

describe('customReportFromApi', () => {
    const apiReportWithoutChildren: AnalyticsCustomReport = {
        account_id: 0,
        analytics_filter_id: 0,
        children: [],
        created_by: 0,
        created_datetime: 'asd',
        id: 0,
        name: 'some name',
        type: AnalyticsCustomReportType.Custom,
        updated_by: 0,
        updated_datetime: '123',
    }
    const apiSection: AnalyticsCustomReportSectionSchema = {
        metadata: {},
        children: [],
        type: AnalyticsCustomReportSectionSchemaType.Section,
    }
    const apiRow: AnalyticsCustomReportRowSchema = {
        children: [],
        metadata: {},
        type: AnalyticsCustomReportRowSchemaType.Row,
    }
    const apiChart: AnalyticsCustomReportChartSchema = {
        config_id: 'someId',
        metadata: {},
        type: AnalyticsCustomReportRowSchemaChildrenItemType.Chart,
    }

    it('should create a CustomReport with subset of props', () => {
        const expectedReport: CustomReportSchema = {
            analytics_filter_id: apiReportWithoutChildren.analytics_filter_id,
            children: [],
            id: apiReportWithoutChildren.id,
            name: apiReportWithoutChildren.name,
            emoji: apiReportWithoutChildren.emoji,
        }
        const report = customReportFromApi(apiReportWithoutChildren)

        expect(report).toEqual(expectedReport)
    })

    it('should create a CustomReport with children', () => {
        const apiReportWithChildren = {
            ...apiReportWithoutChildren,
            children: [
                {
                    ...apiSection,
                    children: [
                        {...apiRow, children: [{...apiChart}]},
                        apiChart,
                    ],
                },
                apiRow,
                apiChart,
            ],
        }
        const expectedReport: CustomReportSchema = {
            id: apiReportWithoutChildren.id,
            name: apiReportWithoutChildren.name,
            emoji: undefined,
            analytics_filter_id: apiReportWithoutChildren.analytics_filter_id,
            children: [
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Row,
                            children: [
                                {
                                    config_id: apiChart.config_id,
                                    type: CustomReportChildType.Chart,
                                },
                            ],
                        },
                        {
                            config_id: apiChart.config_id,
                            type: CustomReportChildType.Chart,
                        },
                    ],
                },
                {
                    type: CustomReportChildType.Row,
                    children: [],
                },
                {
                    config_id: apiChart.config_id,
                    type: CustomReportChildType.Chart,
                },
            ],
        }
        const report = customReportFromApi(apiReportWithChildren)

        expect(report).toEqual(expectedReport)
    })

    it('should ignore unknown types', () => {
        const unknownElement = {
            type: 'unknown',
        } as unknown as AnalyticsCustomReportSectionSchemaChildrenItem
        const apiReportWithChildren = {
            ...apiReportWithoutChildren,
            children: [
                {
                    ...apiSection,
                    children: [
                        {
                            ...apiRow,
                            children: [
                                unknownElement as AnalyticsCustomReportChartSchema,
                            ],
                        },
                        unknownElement,
                    ],
                },
                unknownElement,
            ],
        }
        const expectedReport: CustomReportSchema = {
            id: apiReportWithoutChildren.id,
            name: apiReportWithoutChildren.name,
            emoji: apiReportWithoutChildren.emoji,
            analytics_filter_id: apiReportWithoutChildren.analytics_filter_id,
            children: [
                {
                    type: CustomReportChildType.Section,
                    children: [
                        {
                            type: CustomReportChildType.Row,
                            children: [],
                        },
                    ],
                },
            ],
        }

        const report = customReportFromApi(apiReportWithChildren)

        expect(report).toEqual(expectedReport)
    })
})
