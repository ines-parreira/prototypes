import type {
    AnalyticsManagedDashboardConfig,
    ItemMetadata,
} from '@gorgias/helpdesk-types'

import { ChartType } from 'domains/reporting/pages/dashboards/types'
import {
    backendConfigToLayoutConfig,
    buildDashboardConfig,
    layoutConfigToBackendConfig,
    mergeWithDefaults,
} from 'domains/reporting/utils/managedDashboardMappers'
import { AnalyticsAiAgentAllAgentsChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

const dashboardId = ManagedDashboardId.AiAgentAnalytics
const tabId = ManagedDashboardsTabId.AllAgents

describe('managedDashboardMappers', () => {
    describe('layoutConfigToBackendConfig', () => {
        it('should transform frontend layout to backend format', () => {
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
                tabId,
                'tabName',
            )

            expect(result).toEqual({
                id: dashboardId,
                tabs: [
                    {
                        id: tabId,
                        name: 'tabName',
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
                tabId,
                'tabName',
            )

            expect(result).toEqual({
                id: dashboardId,
                tabs: [
                    {
                        id: tabId,
                        name: 'tabName',
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

            const result = layoutConfigToBackendConfig(
                'test-id',
                layoutConfig,
                ManagedDashboardsTabId.AllAgents,
                'TabName',
            )

            expect(result.tabs[0].sections[0].type).toBe(ChartType.Card)
            expect(result.tabs[0].sections[1].type).toBe(ChartType.Graph)
            expect(result.tabs[0].sections[2].type).toBe(ChartType.Table)
        })

        it('should include columns metadata when item.visibleColumns is defined', () => {
            const layoutConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                                visibleColumns: ['col_a', 'col_b'],
                            },
                        ],
                    },
                ],
            }

            const result = layoutConfigToBackendConfig(
                dashboardId,
                layoutConfig,
                tabId,
                'tabName',
            )

            expect(result.tabs[0].sections[0].items[0].metadata).toEqual({
                visible: true,
                grid_size: 12,
                columns: [
                    { column_id: 'col_a', visible: true },
                    { column_id: 'col_b', visible: true },
                ],
            })
        })

        it('should use provided tabId and tabName when given', () => {
            const layoutConfig: DashboardLayoutConfig = { sections: [] }

            const result = layoutConfigToBackendConfig(
                'ai-agent-analytics',
                layoutConfig,
                tabId,
                'All Agents',
            )

            expect(result.tabs[0].id).toBe(tabId)
            expect(result.tabs[0].name).toBe('All Agents')
        })
    })

    describe('buildDashboardConfig', () => {
        const layoutConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'section_kpis',
                    type: ChartType.Card,
                    items: [
                        {
                            chartId: AnalyticsOverviewChart.AutomationRateCard,
                            gridSize: 3,
                            visibility: true,
                        },
                    ],
                },
            ],
        }

        it('should create a new config when no existing config is provided', () => {
            const result = buildDashboardConfig(
                'ai-agent-analytics',
                tabId,
                'All Agents',
                layoutConfig,
            )

            expect(result).toEqual({
                id: 'ai-agent-analytics',
                tabs: [
                    {
                        id: tabId,
                        name: 'All Agents',
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
                                ],
                            },
                        ],
                    },
                ],
            })
        })

        it('should update an existing tab while preserving other tabs', () => {
            const existingConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-analytics',
                tabs: [
                    {
                        id: tabId,
                        name: 'All Agents',
                        sections: [
                            {
                                section_id: 'section_kpis',
                                type: ChartType.Card,
                                items: [],
                            },
                        ],
                    },
                    {
                        id: ManagedDashboardsTabId.SupportAgent,
                        name: 'Support Agent',
                        sections: [
                            {
                                section_id: 'section_kpis',
                                type: ChartType.Card,
                                items: [],
                            },
                        ],
                    },
                ],
            }

            const result = buildDashboardConfig(
                'ai-agent-analytics',
                tabId,
                'All Agents',
                layoutConfig,
                existingConfig,
            )

            expect(result.tabs).toHaveLength(2)
            expect(result.tabs[0].id).toBe(tabId)
            expect(result.tabs[0].sections[0].items).toHaveLength(1)
            expect(result.tabs[1].id).toBe(ManagedDashboardsTabId.SupportAgent)
            expect(result.tabs[1].sections[0].items).toHaveLength(0)
        })

        it('should append a new tab when the tabId does not exist in existing config', () => {
            const existingConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-analytics',
                tabs: [
                    {
                        id: tabId,
                        name: 'All Agents',
                        sections: [],
                    },
                ],
            }

            const result = buildDashboardConfig(
                'ai-agent-analytics',
                ManagedDashboardsTabId.SupportAgent,
                'Support Agent',
                layoutConfig,
                existingConfig,
            )

            expect(result.tabs).toHaveLength(2)
            expect(result.tabs[0].id).toBe(tabId)
            expect(result.tabs[1].id).toBe(ManagedDashboardsTabId.SupportAgent)
        })
    })

    describe('backendConfigToLayoutConfig', () => {
        it('should transform backend format to frontend layout', () => {
            const backendConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-overview',
                tabs: [
                    {
                        id: ManagedDashboardsTabId.AllAgents,
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
                ManagedDashboardsTabId.AllAgents,
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

        it('should map columns metadata into visibleColumns, keeping only visible ones', () => {
            const backendConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-overview',
                tabs: [
                    {
                        id: ManagedDashboardsTabId.AllAgents,
                        name: 'Main',
                        sections: [
                            {
                                section_id: 'breakdown',
                                type: ChartType.Table,
                                items: [
                                    {
                                        chart_id: 'chart_1',
                                        metadata: {
                                            visible: true,
                                            grid_size: 12,
                                            columns: [
                                                {
                                                    column_id: 'col_a',
                                                    visible: true,
                                                },
                                                {
                                                    column_id: 'col_b',
                                                    visible: false,
                                                },
                                                {
                                                    column_id: 'col_c',
                                                    visible: true,
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            }

            const result = backendConfigToLayoutConfig(
                backendConfig,
                { sections: [] },
                ManagedDashboardsTabId.AllAgents,
            )

            expect(result.sections[0].items[0].visibleColumns).toEqual([
                'col_a',
                'col_c',
            ])
        })

        it('should map backend section types to frontend types', () => {
            const backendConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-overview',
                tabs: [
                    {
                        id: ManagedDashboardsTabId.AllAgents,
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

            const result = backendConfigToLayoutConfig(
                backendConfig,
                {
                    sections: [],
                },
                ManagedDashboardsTabId.AllAgents,
            )

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
                ManagedDashboardsTabId.Overview,
            )

            expect(result).toEqual(defaultConfig)
        })

        it('should use default values for missing metadata', () => {
            const backendConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-overview',
                tabs: [
                    {
                        id: ManagedDashboardsTabId.AllAgents,
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
                ManagedDashboardsTabId.AllAgents,
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

        it('should find the correct tab by tabId when multiple tabs exist', () => {
            const backendConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-analytics',
                tabs: [
                    {
                        id: tabId,
                        name: 'All Agents',
                        sections: [
                            {
                                section_id: 'section_kpis',
                                type: ChartType.Card,
                                items: [
                                    {
                                        chart_id: 'all-agents-chart',
                                        metadata: {
                                            visible: true,
                                            grid_size: 3,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: ManagedDashboardsTabId.SupportAgent,
                        name: 'Support Agent',
                        sections: [
                            {
                                section_id: 'section_kpis',
                                type: ChartType.Card,
                                items: [
                                    {
                                        chart_id: 'support-agent-chart',
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

            const defaultConfig: DashboardLayoutConfig = { sections: [] }

            const allAgentsResult = backendConfigToLayoutConfig(
                backendConfig,
                defaultConfig,
                tabId,
            )

            expect(allAgentsResult.sections[0].items[0].chartId).toBe(
                'all-agents-chart',
            )
            expect(allAgentsResult.sections[0].items[0].visibility).toBe(true)

            const supportAgentResult = backendConfigToLayoutConfig(
                backendConfig,
                defaultConfig,
                ManagedDashboardsTabId.SupportAgent,
            )

            expect(supportAgentResult.sections[0].items[0].chartId).toBe(
                'support-agent-chart',
            )
            expect(supportAgentResult.sections[0].items[0].visibility).toBe(
                false,
            )
        })

        it('should return default config when tabId is provided but not found in saved tabs', () => {
            const backendConfig: AnalyticsManagedDashboardConfig = {
                id: 'ai-agent-analytics',
                tabs: [
                    {
                        id: tabId,
                        name: 'All Agents',
                        sections: [
                            {
                                section_id: 'section_kpis',
                                type: ChartType.Card,
                                items: [
                                    {
                                        chart_id: 'all-agents-chart',
                                        metadata: {
                                            visible: true,
                                            grid_size: 3,
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
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
                ManagedDashboardsTabId.SupportAgent,
            )

            expect(result).toEqual(defaultConfig)
        })
    })

    describe('mergeWithDefaults', () => {
        it('should append missing default sections after saved sections', () => {
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

        it('should not duplicate sections present in both saved and default', () => {
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

        it('should keep a saved section with no matching default as-is and still append the default section', () => {
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

        it('should use default item order for Table sections', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            expect(result.sections[0].items[0].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
            )
            expect(result.sections[0].items[1].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
            )
        })

        it('should use default item order for Graph sections', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'charts',
                        type: ChartType.Graph,
                        items: [
                            {
                                chartId: AnalyticsOverviewChart.TimeSavedCard,
                                gridSize: 6,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 6,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'charts',
                        type: ChartType.Graph,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 6,
                                visibility: true,
                            },
                            {
                                chartId: AnalyticsOverviewChart.TimeSavedCard,
                                gridSize: 6,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            expect(result.sections[0].items[0].chartId).toBe(
                AnalyticsOverviewChart.AutomationRateCard,
            )
            expect(result.sections[0].items[1].chartId).toBe(
                AnalyticsOverviewChart.TimeSavedCard,
            )
        })

        it('should carry over saved item properties when using default order', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
                                gridSize: 12,
                                visibility: false,
                                requiresFeatureFlag: true,
                            },
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
                                gridSize: 6,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                                requiresFeatureFlag: true,
                            },
                        ],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            const [channel, intent] = result.sections[0].items
            expect(channel.visibility).toBe(false)
            expect(channel.requiresFeatureFlag).toBeFalsy()
            expect(intent.gridSize).toBe(6)
            expect(intent.requiresFeatureFlag).toBe(true)
        })

        it('should drop stale chart IDs from non-Card sections that no longer exist in default', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.PerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            expect(result.sections[0].items).toHaveLength(2)
            expect(result.sections[0].items[0].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
            )
            expect(result.sections[0].items[1].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
            )
        })

        it('should insert new default items at their default position for non-Card sections', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsOverviewChart.ArticleRecommendationTable,
                                gridSize: 12,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            expect(result.sections[0].items).toHaveLength(3)
            expect(result.sections[0].items[0].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
            )
            expect(result.sections[0].items[1].chartId).toBe(
                AnalyticsOverviewChart.ArticleRecommendationTable,
            )
            expect(result.sections[0].items[2].chartId).toBe(
                AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
            )
        })

        it('should preserve saved item order for Card sections', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId: AnalyticsOverviewChart.TimeSavedCard,
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomatedInteractionsCard,
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
                        id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 3,
                                visibility: true,
                                requiresFeatureFlag: true,
                            },
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomatedInteractionsCard,
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId: AnalyticsOverviewChart.TimeSavedCard,
                                gridSize: 3,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            const [first, second, third] = result.sections[0].items
            expect(first.chartId).toBe(AnalyticsOverviewChart.TimeSavedCard)
            expect(first.requiresFeatureFlag).toBeFalsy()
            expect(second.chartId).toBe(
                AnalyticsOverviewChart.AutomationRateCard,
            )
            expect(second.requiresFeatureFlag).toBe(true)
            expect(third.chartId).toBe(
                AnalyticsOverviewChart.AutomatedInteractionsCard,
            )
            expect(third.requiresFeatureFlag).toBeFalsy()
        })

        it('should append new default items at the end for Card sections', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'kpis',
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
                        id: 'kpis',
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
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId: AnalyticsOverviewChart.TimeSavedCard,
                                gridSize: 3,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            expect(result.sections[0].items).toHaveLength(3)
            expect(result.sections[0].items[0].chartId).toBe(
                AnalyticsOverviewChart.AutomationRateCard,
            )
            expect(result.sections[0].items[1].chartId).toBe(
                AnalyticsOverviewChart.AutomatedInteractionsCard,
            )
            expect(result.sections[0].items[2].chartId).toBe(
                AnalyticsOverviewChart.TimeSavedCard,
            )
        })

        it('should drop stale chart IDs from Card sections that no longer exist in default', () => {
            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'kpis',
                        type: ChartType.Card,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.AutomationRateCard,
                                gridSize: 3,
                                visibility: true,
                            },
                            {
                                chartId: AnalyticsOverviewChart.CostSavedCard,
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
                        id: 'kpis',
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

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            expect(result.sections[0].items).toHaveLength(1)
            expect(result.sections[0].items[0].chartId).toBe(
                AnalyticsOverviewChart.AutomationRateCard,
            )
        })

        it('should preserve requiresFeatureFlag from default items onto saved items', () => {
            const defaultConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.PerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsOverviewChart.ArticleRecommendationTable,
                                gridSize: 12,
                                visibility: true,
                                requiresFeatureFlag: true,
                            },
                        ],
                    },
                ],
            }

            const savedConfig: DashboardLayoutConfig = {
                sections: [
                    {
                        id: 'breakdown',
                        type: ChartType.Table,
                        items: [
                            {
                                chartId:
                                    AnalyticsOverviewChart.PerformanceTable,
                                gridSize: 12,
                                visibility: true,
                            },
                            {
                                chartId:
                                    AnalyticsOverviewChart.ArticleRecommendationTable,
                                gridSize: 12,
                                visibility: true,
                            },
                        ],
                    },
                ],
            }

            const result = mergeWithDefaults(savedConfig, defaultConfig)

            const items = result.sections[0].items
            expect(items[0].requiresFeatureFlag).toBeFalsy()
            expect(items[1].requiresFeatureFlag).toBe(true)
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
