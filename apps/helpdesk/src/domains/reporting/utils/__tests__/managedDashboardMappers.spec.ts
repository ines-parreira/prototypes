import type {
    AnalyticsManagedDashboardConfig,
    ItemMetadata,
} from '@gorgias/helpdesk-types'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import {
    backendConfigToLayoutConfig,
    layoutConfigToBackendConfig,
    mergeWithDefaults,
} from 'domains/reporting/utils/managedDashboardMappers'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

describe('managedDashboardMappers', () => {
    describe('layoutConfigToBackendConfig', () => {
        it('should transform frontend layout to backend format', () => {
            const dashboardId = 'ai-agent-overview'
            const layoutConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'section_kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomatedInteractionsCard,
                                gridSize: 6,
                                visibility: false,
                            },
                        ],
                    },
                    {
                        id: 'section_charts',
                        type: ChartType.Graph,
                        items: [
                            {
                                chartId: AnalyticsOverviewChart.TimeSavedCard,
                                gridSize: 12,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const result = layoutConfigToBackendConfig(
                dashboardId,
                layoutConfig,
            )

            expect(result).toEqual({
                id: dashboardId,
                tabs: [
                    {
                        id: 'tab_main',
                        name: 'Main',
                        sections: [
                            {
                                section_id: 'section_kpis',
                                type: ChartType.Card,
                                items: [
                                    {
                                        chart_id:
                                            AnalyticsOverviewChart.AutomationRateCard,
                                        metadata: {
                                            visible: true,
                                            grid_size: 3,
                                        },
                                    },
                                    {
                                        chart_id:
                                            AnalyticsOverviewChart.AutomatedInteractionsCard,
                                        metadata: {
                                            visible: false,
                                            grid_size: 6,
                                        },
                                    },
                                ],
                            },
                            {
                                section_id: 'section_charts',
                                type: ChartType.Graph,
                                items: [
                                    {
                                        chart_id:
                                            AnalyticsOverviewChart.TimeSavedCard,
                                        metadata: {
                                            visible: true,
                                            grid_size: 12,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            })
        })

        it('should handle empty sections', () => {
            const dashboardId = 'ai-agent-overview'
            const layoutConfig: DashboardLayoutConfig = {
                sections: [],
            }

            const result = layoutConfigToBackendConfig(
                dashboardId,
                layoutConfig,
            )

            expect(result).toEqual({
                id: dashboardId,
                tabs: [
                    {
                        id: 'tab_main',
                        name: 'Main',
                        sections: [],
                    },
                ],
            })
        })

        it('should map section types correctly', () => {
            const layoutConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 's1',
                        type: ChartType.Card,
                        items: [],
                    },
                    {
                        id: 's2',
                        type: ChartType.Graph,
                        items: [],
                    },
                    {
                        id: 's3',
                        type: ChartType.Table,
                        items: [],
                    },
                ],
            }

            const result = layoutConfigToBackendConfig('test-id', layoutConfig)

            expect(result.tabs[0].sections[0].type).toBe(ChartType.Card)
            expect(result.tabs[0].sections[1].type).toBe(ChartType.Graph)
            expect(result.tabs[0].sections[2].type).toBe(ChartType.Table)
        })
    })

    describe('backendConfigToLayoutConfig', () => {
        it('should transform backend format to frontend layout', () => {
            const backendConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-overview',
                tabs: [
                    {
                        id: 'tab_main',
                        name: 'Main',
                        sections: [
                            {
                                section_id: 'section_kpis',
                                type: ChartType.Card,
                                items: [
                                    {
                                        chart_id: 'chart_1',
                                        metadata: {
                                            visible: true,
                                            grid_size: 3,
                                        },
                                    },
                                    {
                                        chart_id: 'chart_2',
                                        metadata: {
                                            visible: false,
                                            grid_size: 6,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [],
            }

            const result = backendConfigToLayoutConfig(
                backendConfig,
                defaultConfig,
            )

            expect(result).toEqual({
                sections: [
                    {
                        id: 'section_kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId: 'chart_1',
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId: 'chart_2',
                                gridSize: 6,
                                visibility: false,
                            },
                        ],
                    },
                ],
            })
        })

        it('should map backend section types to frontend types', () => {
            const backendConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-overview',
                tabs: [
                    {
                        id: 'tab_main',
                        name: 'Main',
                        sections: [
                            {
                                section_id: 's1',
                                type: ChartType.Card,
                                items: [],
                            },
                            {
                                section_id: 's2',
                                type: ChartType.Graph,
                                items: [],
                            },
                            {
                                section_id: 's3',
                                type: ChartType.Table,
                                items: [],
                            },
                        ],
                    },
                ],
            }

            const result = backendConfigToLayoutConfig(backendConfig, {
                sections: [],
            })

            expect(result.sections[0].type).toBe(ChartType.Card)
            expect(result.sections[1].type).toBe(ChartType.Graph)
            expect(result.sections[2].type).toBe(ChartType.Table)
        })

        it('should fallback to defaults when no tabs exist', () => {
            const backendConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-overview',
                tabs: [],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'default_section',
                        type: ChartType.Card,
                        items: [],
                    },
                ],
            }

            const result = backendConfigToLayoutConfig(
                backendConfig,
                defaultConfig,
            )

            expect(result).toEqual(defaultConfig)
        })

        it('should use default values for missing metadata', () => {
            const backendConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-overview',
                tabs: [
                    {
                        id: 'tab_main',
                        name: 'Main',
                        sections: [
                            {
                                section_id: 'section_kpis',
                                type: ChartType.Card,
                                items: [
                                    {
                                        chart_id: 'chart_1',
                                        metadata:
                                            null as unknown as ItemMetadata,
                                    },
                                    {
                                        chart_id: 'chart_2',
                                        metadata:
                                            null as unknown as ItemMetadata,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [],
            }

            const result = backendConfigToLayoutConfig(
                backendConfig,
                defaultConfig,
            )

            expect(result.sections[0].items[0]).toEqual({
                chartId: 'chart_1',
                gridSize: 3,
                visibility: true,
            })

            expect(result.sections[0].items[1]).toEqual({
                chartId: 'chart_2',
                gridSize: 3,
                visibility: true,
            })
        })
    })

    describe('mergeWithDefaults', () => {
        it('should merge saved config with defaults', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'saved_section',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 3,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'saved_section',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 3,
                                visibility: true,
                            },
                        ],
                    },
                    {
                        id: 'new_section',
                        type: ChartType.Graph,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomatedInteractionsCard,
                                gridSize: 6,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            expect(result.sections).toHaveLength(2)
            expect(result.sections[0].id).toBe('saved_section')
            expect(result.sections[1].id).toBe('new_section')
        })

        it('should not duplicate sections', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'section_1',
                        type: ChartType.Card,
                        items: [],
                    },
                    {
                        id: 'section_2',
                        type: ChartType.Graph,
                        items: [],
                    },
                ],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'section_1',
                        type: ChartType.Card,
                        items: [],
                    },
                    {
                        id: 'section_2',
                        type: ChartType.Graph,
                        items: [],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            expect(result.sections).toHaveLength(2)
        })

        it('should keep saved section as-is and append default section when saved section has no corresponding default', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'orphan_section',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 3,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'other_section',
                        type: ChartType.Graph,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomatedInteractionsCard,
                                gridSize: 6,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            expect(result.sections).toHaveLength(2)
            expect(result.sections[0]).toEqual(savedConfig.sections[0])
            expect(result.sections[1]).toEqual(defaultConfig.sections[0])
        })

        it('should handle empty saved config', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'default_section',
                        type: ChartType.Card,
                        items: [],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            expect(result.sections).toHaveLength(1)
            expect(result.sections[0].id).toBe('default_section')
        })
    })
})
