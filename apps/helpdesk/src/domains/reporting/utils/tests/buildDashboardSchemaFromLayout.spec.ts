import type { DashboardLayoutConfig } from '@repo/reporting'

import {
    ChartType,
    DashboardChildType,
} from 'domains/reporting/pages/dashboards/types'
import type {
    DashboardChartSchema,
    DashboardSectionSchema,
} from 'domains/reporting/pages/dashboards/types'
import { buildDashboardSchemaFromLayout } from 'domains/reporting/utils/buildDashboardSchemaFromLayout'

describe('buildDashboardSchemaFromLayout', () => {
    it('should return a DashboardSchema with default fields and the provided name', () => {
        const layout: DashboardLayoutConfig = { sections: [] }

        const result = buildDashboardSchemaFromLayout(layout, 'my-report')

        expect(result).toEqual({
            id: -1,
            name: 'my-report',
            analytics_filter_id: null,
            emoji: null,
            children: [],
        })
    })

    it('should map each layout section to a section child with chart children', () => {
        const layout: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'kpis',
                    type: ChartType.Card,
                    items: [
                        {
                            chartId: 'avg-csat',
                            gridSize: 3,
                            visibility: true,
                            measures: ['csat-measure'],
                            dimensions: ['csat-dimension'],
                        },
                    ],
                },
            ],
        }

        const result = buildDashboardSchemaFromLayout(layout, 'report')

        expect(result.children).toEqual([
            {
                type: DashboardChildType.Section,
                children: [
                    {
                        type: DashboardChildType.Chart,
                        config_id: 'avg-csat',
                        metadata: {
                            preferences: {
                                measures: ['csat-measure'],
                                dimensions: ['csat-dimension'],
                            },
                        },
                    },
                ],
            },
        ])
    })

    it('should filter out items whose visibility is false for non-table sections', () => {
        const layout: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'kpis',
                    type: ChartType.Card,
                    items: [
                        {
                            chartId: 'visible-chart',
                            gridSize: 3,
                            visibility: true,
                        },
                        {
                            chartId: 'hidden-chart',
                            gridSize: 3,
                            visibility: false,
                        },
                    ],
                },
            ],
        }

        const result = buildDashboardSchemaFromLayout(layout, 'report')

        const sectionChildren = (result.children[0] as DashboardSectionSchema)
            .children
        expect(sectionChildren).toHaveLength(1)
        expect(sectionChildren[0]).toMatchObject({ config_id: 'visible-chart' })
    })

    it('should keep all items for table sections regardless of visibility', () => {
        const layout: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'agents-table',
                    type: ChartType.Table,
                    items: [
                        {
                            chartId: 'visible-row',
                            gridSize: 12,
                            visibility: true,
                        },
                        {
                            chartId: 'hidden-row',
                            gridSize: 12,
                            visibility: false,
                        },
                    ],
                },
            ],
        }

        const result = buildDashboardSchemaFromLayout(layout, 'report')

        const sectionChildren = (result.children[0] as DashboardSectionSchema)
            .children as DashboardChartSchema[]
        expect(sectionChildren).toHaveLength(2)
        expect(sectionChildren.map((child) => child.config_id)).toEqual([
            'visible-row',
            'hidden-row',
        ])
    })

    it('should store all measures and dimensions as arrays', () => {
        const layout: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'graphs',
                    type: ChartType.Graph,
                    items: [
                        {
                            chartId: 'graph-1',
                            gridSize: 6,
                            visibility: true,
                            measures: ['first-measure', 'second-measure'],
                            dimensions: ['first-dimension', 'second-dimension'],
                        },
                    ],
                },
            ],
        }

        const result = buildDashboardSchemaFromLayout(layout, 'report')

        const firstChart = (result.children[0] as DashboardSectionSchema)
            .children[0] as DashboardChartSchema
        expect(firstChart.metadata).toEqual({
            preferences: {
                measures: ['first-measure', 'second-measure'],
                dimensions: ['first-dimension', 'second-dimension'],
            },
        })
    })

    it('should produce empty metadata when measures and dimensions are absent', () => {
        const layout: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'kpis',
                    type: ChartType.Card,
                    items: [
                        {
                            chartId: 'plain-card',
                            gridSize: 3,
                            visibility: true,
                        },
                    ],
                },
            ],
        }

        const result = buildDashboardSchemaFromLayout(layout, 'report')

        const firstChart = (result.children[0] as DashboardSectionSchema)
            .children[0] as DashboardChartSchema
        expect(firstChart.metadata).toEqual({})
    })
})
