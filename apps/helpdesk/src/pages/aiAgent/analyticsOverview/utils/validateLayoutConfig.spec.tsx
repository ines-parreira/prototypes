import { ChartType } from 'domains/reporting/pages/dashboards/types'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'

import { AnalyticsOverviewChart } from '../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../config/defaultLayoutConfig'
import type { DashboardLayoutConfig } from '../types/layoutConfig'
import { validateLayoutConfig } from './validateLayoutConfig'

describe('validateLayoutConfig', () => {
    const reportConfigMock = {
        charts: {
            ['chart']: {
                chartComponent: () => <div>Chart 1</div>,
                label: 'Chart 1 Label',
                csvProducer: null,
                description: 'Description for chart 1',
                chartType: ChartType.Card,
            },
        },
    } as unknown as ReportConfig<string>

    it('should return the config when it is valid', () => {
        const validConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'kpis',
                    type: 'kpis',
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

        const result = validateLayoutConfig(
            validConfig,
            reportConfigMock,
            validConfig,
        )

        expect(result).toEqual(validConfig)
    })

    it('should return default config when input is null', () => {
        const result = validateLayoutConfig(
            null as unknown as DashboardLayoutConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should return default config when input is undefined', () => {
        const result = validateLayoutConfig(
            undefined as unknown as DashboardLayoutConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should return default config when input is not an object', () => {
        const result = validateLayoutConfig(
            'invalid' as unknown as DashboardLayoutConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should return default config when sections is not an array', () => {
        const invalidConfig = {
            sections: 'not an array',
        } as unknown as DashboardLayoutConfig

        const result = validateLayoutConfig(
            invalidConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should return default config when section has invalid id', () => {
        const invalidConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: '',
                    type: 'kpis',
                    items: [],
                },
            ],
        }

        const result = validateLayoutConfig(
            invalidConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should return default config when section has invalid type', () => {
        const invalidConfig = {
            sections: [
                {
                    id: 'test',
                    type: 'invalid-type',
                    items: [],
                },
            ],
        } as unknown as DashboardLayoutConfig

        const result = validateLayoutConfig(
            invalidConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should return default config when section items is not an array', () => {
        const invalidConfig = {
            sections: [
                {
                    id: 'test',
                    type: 'kpis',
                    items: 'not an array',
                },
            ],
        } as unknown as DashboardLayoutConfig

        const result = validateLayoutConfig(
            invalidConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should return default config when item has missing chartId', () => {
        const invalidConfig = {
            sections: [
                {
                    id: 'test',
                    type: 'kpis',
                    items: [
                        {
                            gridSize: 3,
                        },
                    ],
                },
            ],
        } as unknown as DashboardLayoutConfig

        const result = validateLayoutConfig(
            invalidConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should return default config when item has non-string chartId', () => {
        const invalidConfig = {
            sections: [
                {
                    id: 'test',
                    type: 'kpis',
                    items: [
                        {
                            chartId: 123,
                            gridSize: 3,
                        },
                    ],
                },
            ],
        } as unknown as DashboardLayoutConfig

        const result = validateLayoutConfig(
            invalidConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should return default config when item has invalid chartId', () => {
        const invalidConfig = {
            sections: [
                {
                    id: 'test',
                    type: 'kpis',
                    items: [
                        {
                            chartId: 'non-existent-chart',
                            gridSize: 3,
                        },
                    ],
                },
            ],
        } as unknown as DashboardLayoutConfig

        const result = validateLayoutConfig(
            invalidConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should return default config when item has invalid gridSize', () => {
        const invalidConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'test',
                    type: 'kpis',
                    items: [
                        {
                            chartId: AnalyticsOverviewChart.AutomationRateCard,
                            gridSize: 5 as 3,
                            visibility: true,
                        },
                    ],
                },
            ],
        }

        const result = validateLayoutConfig(
            invalidConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })

    it('should validate gridSize 3 as valid', () => {
        const validConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'test',
                    type: 'kpis',
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

        const result = validateLayoutConfig(
            validConfig,
            reportConfigMock,
            validConfig,
        )

        expect(result).toEqual(validConfig)
    })

    it('should validate gridSize 6 as valid', () => {
        const validConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'test',
                    type: 'charts',
                    items: [
                        {
                            chartId: AnalyticsOverviewChart.AutomationLineChart,
                            gridSize: 6,
                            visibility: true,
                        },
                    ],
                },
            ],
        }

        const result = validateLayoutConfig(
            validConfig,
            reportConfigMock,
            validConfig,
        )

        expect(result).toEqual(validConfig)
    })

    it('should validate gridSize 12 as valid', () => {
        const validConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'test',
                    type: 'table',
                    items: [
                        {
                            chartId: AnalyticsOverviewChart.PerformanceTable,
                            gridSize: 12,
                            visibility: true,
                        },
                    ],
                },
            ],
        }

        const result = validateLayoutConfig(
            validConfig,
            reportConfigMock,
            validConfig,
        )

        expect(result).toEqual(validConfig)
    })

    it('should validate multiple sections with multiple items', () => {
        const validConfig: DashboardLayoutConfig = {
            sections: [
                {
                    id: 'kpis',
                    type: 'kpis',
                    items: [
                        {
                            chartId: AnalyticsOverviewChart.AutomationRateCard,
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
                {
                    id: 'charts',
                    type: 'charts',
                    items: [
                        {
                            chartId: AnalyticsOverviewChart.AutomationLineChart,
                            gridSize: 6,
                            visibility: true,
                        },
                        {
                            chartId:
                                AnalyticsOverviewChart.AutomationRateComboChart,
                            gridSize: 6,
                            visibility: true,
                        },
                    ],
                },
            ],
        }

        const result = validateLayoutConfig(
            validConfig,
            reportConfigMock,
            validConfig,
        )

        expect(result).toEqual(validConfig)
    })

    it('should return default config when one section is invalid', () => {
        const invalidConfig = {
            sections: [
                {
                    id: 'kpis',
                    type: 'kpis',
                    items: [
                        {
                            chartId: AnalyticsOverviewChart.AutomationRateCard,
                            gridSize: 3,
                        },
                    ],
                },
                {
                    id: 'invalid',
                    type: 'kpis',
                    items: [
                        {
                            chartId: 'non-existent-chart',
                            gridSize: 3,
                        },
                    ],
                },
            ],
        } as unknown as DashboardLayoutConfig

        const result = validateLayoutConfig(
            invalidConfig,
            reportConfigMock,
            DEFAULT_ANALYTICS_OVERVIEW_LAYOUT,
        )

        expect(result).toEqual(DEFAULT_ANALYTICS_OVERVIEW_LAYOUT)
    })
})
