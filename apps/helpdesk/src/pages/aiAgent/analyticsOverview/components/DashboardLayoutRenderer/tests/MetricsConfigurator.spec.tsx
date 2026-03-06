import { ConfigureMetricsModal } from '@repo/reporting'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useUpdateManagedDashboard } from 'domains/reporting/hooks/managed-dashboards/useUpdateManagedDashboard'
import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { MetricsConfigurator } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/MetricsConfigurator'

jest.mock('@repo/reporting', () => ({
    ConfigureMetricsModal: jest.fn(() => null),
}))

jest.mock(
    'domains/reporting/hooks/managed-dashboards/useUpdateManagedDashboard',
    () => ({
        useUpdateManagedDashboard: jest.fn(() => ({
            updateSection: jest.fn(),
            isLoading: false,
            mutate: jest.fn(),
        })),
    }),
)

type MockedHookReturn = ReturnType<typeof useUpdateManagedDashboard>

function mockHookReturn(updateSection = jest.fn()): MockedHookReturn {
    return {
        updateSection,
        isLoading: false,
    } as unknown as MockedHookReturn
}

const mockedConfigureMetricsModal = jest.mocked(ConfigureMetricsModal)
const mockedUseUpdateManagedDashboard = jest.mocked(useUpdateManagedDashboard)

describe('MetricsConfigurator', () => {
    const mockMetrics = [
        {
            id: AnalyticsOverviewChart.AutomationRateCard,
            label: 'Metric 1',
            visibility: true,
        },
        {
            id: AnalyticsOverviewChart.AutomatedInteractionsCard,
            label: 'Metric 2',
            visibility: true,
        },
        {
            id: AnalyticsOverviewChart.TimeSavedCard,
            label: 'Metric 3',
            visibility: false,
        },
    ]

    const mockLayoutConfig = {
        sections: [
            {
                id: 'section_kpis',
                type: ChartType.Card,
                items: [
                    {
                        chartId: AnalyticsOverviewChart.AutomationRateCard,
                        gridSize: 3 as const,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsOverviewChart.AutomatedInteractionsCard,
                        gridSize: 3 as const,
                        visibility: true,
                    },
                    {
                        chartId: AnalyticsOverviewChart.TimeSavedCard,
                        gridSize: 3 as const,
                        visibility: false,
                    },
                ],
            },
        ],
    }

    beforeEach(() => {
        mockedConfigureMetricsModal.mockClear()
        mockedUseUpdateManagedDashboard.mockReset()
        mockedUseUpdateManagedDashboard.mockReturnValue(mockHookReturn())
    })

    it('should render edit metrics button', () => {
        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
            />,
        )

        expect(
            screen.getByRole('button', { name: /edit metrics/i }),
        ).toBeInTheDocument()
    })

    it('should pass correct props to ConfigureMetricsModal when closed', () => {
        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
            />,
        )

        expect(mockedConfigureMetricsModal).toHaveBeenCalledWith(
            expect.objectContaining({
                isOpen: false,
                metrics: mockMetrics,
                onClose: expect.any(Function),
                onSave: expect.any(Function),
                isLoading: false,
            }),
            expect.anything(),
        )
    })

    it('should pass isOpen true to ConfigureMetricsModal when button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
            />,
        )

        const editButton = screen.getByRole('button', { name: /edit metrics/i })
        await user.click(editButton)

        expect(mockedConfigureMetricsModal).toHaveBeenCalledWith(
            expect.objectContaining({
                isOpen: true,
                metrics: mockMetrics,
            }),
            expect.anything(),
        )
    })

    it('should toggle modal state from closed to open to closed', async () => {
        const user = userEvent.setup()
        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
            />,
        )

        expect(mockedConfigureMetricsModal).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: false }),
            expect.anything(),
        )

        const editButton = screen.getByRole('button', { name: /edit metrics/i })
        await user.click(editButton)

        expect(mockedConfigureMetricsModal).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: true }),
            expect.anything(),
        )

        const lastCall =
            mockedConfigureMetricsModal.mock.calls[
                mockedConfigureMetricsModal.mock.calls.length - 1
            ]
        const onCloseCallback = lastCall[0].onClose

        act(() => {
            onCloseCallback()
        })

        expect(mockedConfigureMetricsModal).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: false }),
            expect.anything(),
        )
    })

    it('should call updateSection with correct section when saving', async () => {
        const mockUpdateSection = jest.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
            />,
        )

        const onSave =
            mockedConfigureMetricsModal.mock.calls[
                mockedConfigureMetricsModal.mock.calls.length - 1
            ][0].onSave

        act(() => {
            onSave(mockMetrics)
        })

        expect(mockUpdateSection).toHaveBeenCalledWith(
            'ai-agent-overview',
            mockLayoutConfig,
            'section_kpis',
            expect.any(Function),
            expect.any(Function),
        )
    })

    it('should use fallback section id when no kpis section found', () => {
        const mockUpdateSection = jest.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        const layoutWithNoKpis = {
            sections: [
                {
                    id: 'section_charts',
                    type: ChartType.Graph,
                    items: [],
                },
            ],
        }

        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={layoutWithNoKpis}
            />,
        )

        const onSave =
            mockedConfigureMetricsModal.mock.calls[
                mockedConfigureMetricsModal.mock.calls.length - 1
            ][0].onSave

        act(() => {
            onSave(mockMetrics)
        })

        expect(mockUpdateSection).toHaveBeenCalledWith(
            'ai-agent-overview',
            layoutWithNoKpis,
            'section_kpis',
            expect.any(Function),
            expect.any(Function),
        )
    })

    it('should transform metrics correctly when section updater callback is invoked', () => {
        const mockUpdateSection = jest.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
            />,
        )

        const onSave =
            mockedConfigureMetricsModal.mock.calls[
                mockedConfigureMetricsModal.mock.calls.length - 1
            ][0].onSave

        act(() => {
            onSave(mockMetrics)
        })

        const sectionUpdater = mockUpdateSection.mock.calls[0][3]
        const currentSection = mockLayoutConfig.sections[0]
        const result = sectionUpdater(currentSection)

        expect(result.items).toHaveLength(3)
        expect(result.items[0]).toEqual({
            chartId: AnalyticsOverviewChart.AutomationRateCard,
            gridSize: 3,
            visibility: true,
            requiresFeatureFlag: false,
        })
        expect(result.items[2]).toEqual({
            chartId: AnalyticsOverviewChart.TimeSavedCard,
            gridSize: 3,
            visibility: false,
            requiresFeatureFlag: false,
        })
    })

    it('should preserve requiresFeatureFlag from existing section items', () => {
        const mockUpdateSection = jest.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        const layoutWithFeatureFlag = {
            sections: [
                {
                    id: 'section_kpis',
                    type: ChartType.Card,
                    items: [
                        {
                            chartId: AnalyticsOverviewChart.AutomationRateCard,
                            gridSize: 3 as const,
                            visibility: true,
                            requiresFeatureFlag: true,
                        },
                        {
                            chartId:
                                AnalyticsOverviewChart.AutomatedInteractionsCard,
                            gridSize: 3 as const,
                            visibility: true,
                        },
                    ],
                },
            ],
        }

        render(
            <MetricsConfigurator
                metrics={mockMetrics.slice(0, 2)}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={layoutWithFeatureFlag}
            />,
        )

        const onSave =
            mockedConfigureMetricsModal.mock.calls[
                mockedConfigureMetricsModal.mock.calls.length - 1
            ][0].onSave

        act(() => {
            onSave(mockMetrics.slice(0, 2))
        })

        const sectionUpdater = mockUpdateSection.mock.calls[0][3]
        const result = sectionUpdater(layoutWithFeatureFlag.sections[0])

        expect(result.items[0].requiresFeatureFlag).toBe(true)
        expect(result.items[1].requiresFeatureFlag).toBe(false)
    })

    it('should use default gridSize 3 for metrics not found in current section items', () => {
        const mockUpdateSection = jest.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
            />,
        )

        const onSave =
            mockedConfigureMetricsModal.mock.calls[
                mockedConfigureMetricsModal.mock.calls.length - 1
            ][0].onSave

        const metricsWithNewItem = [
            ...mockMetrics,
            {
                id: AnalyticsOverviewChart.CostSavedCard,
                label: 'Metric 4',
                visibility: true,
            },
        ]

        act(() => {
            onSave(metricsWithNewItem)
        })

        const sectionUpdater = mockUpdateSection.mock.calls[0][3]
        const currentSection = mockLayoutConfig.sections[0]
        const result = sectionUpdater(currentSection)

        const newItem = result.items.find(
            (item: { chartId: string }) =>
                item.chartId === AnalyticsOverviewChart.CostSavedCard,
        )
        expect(newItem).toEqual({
            chartId: AnalyticsOverviewChart.CostSavedCard,
            gridSize: 3,
            visibility: true,
            requiresFeatureFlag: false,
        })
    })

    it('should close modal when onSuccess callback is invoked', async () => {
        const mockUpdateSection = jest.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        const user = userEvent.setup()

        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
            />,
        )

        await user.click(screen.getByRole('button', { name: /edit metrics/i }))

        expect(mockedConfigureMetricsModal).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: true }),
            expect.anything(),
        )

        const onSave =
            mockedConfigureMetricsModal.mock.calls[
                mockedConfigureMetricsModal.mock.calls.length - 1
            ][0].onSave

        act(() => {
            onSave(mockMetrics)
        })

        const onSuccess = mockUpdateSection.mock.calls[0][4]

        act(() => {
            onSuccess()
        })

        expect(mockedConfigureMetricsModal).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: false }),
            expect.anything(),
        )
    })
})
