import { render } from '@repo/testing/vitest'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConfigureMetricsModal } from '../../ConfigureMetricsModal'
import { useUpdateManagedDashboard } from '../hooks/useUpdateManagedDashboard'
import { MetricsConfigurator } from '../MetricsConfigurator'
import { ChartType } from '../types'

const AUTOMATION_RATE_CARD = 'revamp-ai_agent_overview-automation_rate_card'
const AUTOMATED_INTERACTIONS_CARD =
    'revamp-ai_agent_overview-automated_interactions_card'
const TIME_SAVED_CARD = 'revamp-ai_agent_overview-time_saved_card'
const COST_SAVED_CARD = 'revamp-ai_agent_overview-cost_saved_card'

const TAB_OVERVIEW = 'overview'
const TAB_ALL_AGENTS = 'all-agents'

vi.mock('../../ConfigureMetricsModal', () => ({
    ConfigureMetricsModal: vi.fn(() => null),
}))

vi.mock('../hooks/useUpdateManagedDashboard', () => ({
    useUpdateManagedDashboard: vi.fn(() => ({
        updateSection: vi.fn(),
        isLoading: false,
    })),
}))

type MockedHookReturn = ReturnType<typeof useUpdateManagedDashboard>

function mockHookReturn(updateSection = vi.fn()): MockedHookReturn {
    return {
        updateSection,
        isLoading: false,
    } as unknown as MockedHookReturn
}

const mockedConfigureMetricsModal = vi.mocked(ConfigureMetricsModal)
const mockedUseUpdateManagedDashboard = vi.mocked(useUpdateManagedDashboard)

describe('MetricsConfigurator', () => {
    const mockMetrics = [
        {
            id: AUTOMATION_RATE_CARD,
            label: 'Metric 1',
            visibility: true,
        },
        {
            id: AUTOMATED_INTERACTIONS_CARD,
            label: 'Metric 2',
            visibility: true,
        },
        {
            id: TIME_SAVED_CARD,
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
                        chartId: AUTOMATION_RATE_CARD,
                        gridSize: 3 as const,
                        visibility: true,
                    },
                    {
                        chartId: AUTOMATED_INTERACTIONS_CARD,
                        gridSize: 3 as const,
                        visibility: true,
                    },
                    {
                        chartId: TIME_SAVED_CARD,
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
                tabId={TAB_OVERVIEW}
                tabName="Main"
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
                tabId={TAB_OVERVIEW}
                tabName="Main"
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
                tabId={TAB_OVERVIEW}
                tabName="Main"
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
                tabId={TAB_OVERVIEW}
                tabName="Main"
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

    it('should call updateSection with correct args when saving', async () => {
        const mockUpdateSection = vi.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
                tabId={TAB_OVERVIEW}
                tabName="Main"
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
            TAB_OVERVIEW,
            'Main',
            mockLayoutConfig,
            'section_kpis',
            expect.any(Function),
            expect.any(Function),
        )
    })

    it('should call updateSection with ai-agent tab params when provided', async () => {
        const mockUpdateSection = vi.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-analytics"
                currentLayoutConfig={mockLayoutConfig}
                tabId={TAB_ALL_AGENTS}
                tabName="All Agents"
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
            'ai-agent-analytics',
            TAB_ALL_AGENTS,
            'All Agents',
            mockLayoutConfig,
            'section_kpis',
            expect.any(Function),
            expect.any(Function),
        )
    })

    it('should use fallback section id when no kpis section found', () => {
        const mockUpdateSection = vi.fn()
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
                tabId={TAB_OVERVIEW}
                tabName="Main"
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
            TAB_OVERVIEW,
            'Main',
            layoutWithNoKpis,
            'section_kpis',
            expect.any(Function),
            expect.any(Function),
        )
    })

    it('should transform metrics correctly when section updater callback is invoked', () => {
        const mockUpdateSection = vi.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
                tabId={TAB_OVERVIEW}
                tabName="Main"
            />,
        )

        const onSave =
            mockedConfigureMetricsModal.mock.calls[
                mockedConfigureMetricsModal.mock.calls.length - 1
            ][0].onSave

        act(() => {
            onSave(mockMetrics)
        })

        const sectionUpdater = mockUpdateSection.mock.calls[0][5]
        const currentSection = mockLayoutConfig.sections[0]
        const result = sectionUpdater(currentSection)

        expect(result.items).toHaveLength(3)
        expect(result.items[0]).toEqual({
            chartId: AUTOMATION_RATE_CARD,
            gridSize: 3,
            visibility: true,
            requiresFeatureFlag: false,
        })
        expect(result.items[2]).toEqual({
            chartId: TIME_SAVED_CARD,
            gridSize: 3,
            visibility: false,
            requiresFeatureFlag: false,
        })
    })

    it('should preserve requiresFeatureFlag from existing section items', () => {
        const mockUpdateSection = vi.fn()
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
                            chartId: AUTOMATION_RATE_CARD,
                            gridSize: 3 as const,
                            visibility: true,
                            requiresFeatureFlag: true,
                        },
                        {
                            chartId: AUTOMATED_INTERACTIONS_CARD,
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
                tabId={TAB_OVERVIEW}
                tabName="Main"
            />,
        )

        const onSave =
            mockedConfigureMetricsModal.mock.calls[
                mockedConfigureMetricsModal.mock.calls.length - 1
            ][0].onSave

        act(() => {
            onSave(mockMetrics.slice(0, 2))
        })

        const sectionUpdater = mockUpdateSection.mock.calls[0][5]
        const result = sectionUpdater(layoutWithFeatureFlag.sections[0])

        expect(result.items[0].requiresFeatureFlag).toBe(true)
        expect(result.items[1].requiresFeatureFlag).toBe(false)
    })

    it('should use default gridSize 3 for metrics not found in current section items', () => {
        const mockUpdateSection = vi.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
                tabId={TAB_OVERVIEW}
                tabName="Main"
            />,
        )

        const onSave =
            mockedConfigureMetricsModal.mock.calls[
                mockedConfigureMetricsModal.mock.calls.length - 1
            ][0].onSave

        const metricsWithNewItem = [
            ...mockMetrics,
            {
                id: COST_SAVED_CARD,
                label: 'Metric 4',
                visibility: true,
            },
        ]

        act(() => {
            onSave(metricsWithNewItem)
        })

        const sectionUpdater = mockUpdateSection.mock.calls[0][5]
        const currentSection = mockLayoutConfig.sections[0]
        const result = sectionUpdater(currentSection)

        const newItem = result.items.find(
            (item: { chartId: string }) => item.chartId === COST_SAVED_CARD,
        )
        expect(newItem).toEqual({
            chartId: COST_SAVED_CARD,
            gridSize: 3,
            visibility: true,
            requiresFeatureFlag: false,
        })
    })

    it('should close modal when onSuccess callback is invoked', async () => {
        const mockUpdateSection = vi.fn()
        mockedUseUpdateManagedDashboard.mockReturnValue(
            mockHookReturn(mockUpdateSection),
        )

        const user = userEvent.setup()

        render(
            <MetricsConfigurator
                metrics={mockMetrics}
                dashboardId="ai-agent-overview"
                currentLayoutConfig={mockLayoutConfig}
                tabId={TAB_OVERVIEW}
                tabName="Main"
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

        const onSuccess = mockUpdateSection.mock.calls[0][6]

        act(() => {
            onSuccess()
        })

        expect(mockedConfigureMetricsModal).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: false }),
            expect.anything(),
        )
    })
})
