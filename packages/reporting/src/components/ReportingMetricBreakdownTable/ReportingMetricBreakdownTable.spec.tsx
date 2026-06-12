import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ColumnConfig } from '@gorgias/helpdesk-types'
import { useDashboardContext } from '../../contexts/DashboardContext'
import type { DashboardContextValue } from '../../contexts/DashboardContext'
import { useSaveTableColumnVisibility } from '../ManagedDashboards/hooks/useSaveTableColumnVisibility'
import { ChartType } from '../ManagedDashboards/types'

import type {
    MetricColumnConfig,
    MetricLoadingStates,
} from './ReportingMetricBreakdownTable'
import { ReportingMetricBreakdownTable } from './ReportingMetricBreakdownTable'

vi.mock('../../contexts/DashboardContext', () => ({
    useDashboardContext: vi.fn(),
}))

vi.mock('../ManagedDashboards/hooks/useSaveTableColumnVisibility', () => ({
    useSaveTableColumnVisibility: vi.fn(),
}))

const CHART_ID = 'performance_breakdown_table'

const baseContext: DashboardContextValue = {
    dashboardId: 'ai-agent-overview',
    tabId: 'overview',
    tabName: 'Overview',
    isLoaded: true,
    layoutConfig: { sections: [] },
}

const contextWithSavedColumns = (
    visibleColumns: string[] | null,
): DashboardContextValue => ({
    ...baseContext,
    layoutConfig: {
        sections: [
            {
                id: 'section_tables',
                type: ChartType.Table,
                items: [
                    {
                        chartId: CHART_ID,
                        gridSize: 12,
                        visibility: true,
                        visibleColumns,
                    },
                ],
            },
        ],
    },
})

const contextWithSiblingTables = (
    siblingChartIds: string[],
): DashboardContextValue => ({
    ...baseContext,
    layoutConfig: {
        sections: [
            {
                id: 'section_tables',
                type: ChartType.Table,
                items: [
                    {
                        chartId: CHART_ID,
                        gridSize: 12,
                        visibility: true,
                        visibleColumns: null,
                    },
                    ...siblingChartIds.map((id) => ({
                        chartId: id,
                        gridSize: 12 as const,
                        visibility: true,
                        visibleColumns: null,
                    })),
                ],
            },
        ],
    },
})

type Row = { name: string; value: number }

const nameColumns = [{ accessor: 'name', label: 'Name' }]

const metricColumns: MetricColumnConfig[] = [
    {
        accessorKey: 'value',
        label: 'Value',
        tooltipTitle: 'Value',
        tooltipCaption: 'The value.',
        metricFormat: 'decimal',
        loadingStateKeys: ['automatedInteractions'],
    },
]

const defaultLoadingStates: MetricLoadingStates = {
    automationRate: false,
    automatedInteractions: false,
    handovers: false,
    timeSaved: false,
    costSaved: false,
}

const sampleData: Row[] = [
    { name: 'AI Agent', value: 42 },
    { name: 'Flows', value: 18 },
]

const mockSaveVisibleColumns = vi.fn()

beforeEach(() => {
    vi.mocked(useDashboardContext).mockReturnValue(baseContext)
    vi.mocked(useSaveTableColumnVisibility).mockReturnValue({
        saveVisibleColumns: mockSaveVisibleColumns,
    })
    mockSaveVisibleColumns.mockClear()
})

describe('ReportingMetricBreakdownTable', () => {
    it('renders the download button', () => {
        render(
            <ReportingMetricBreakdownTable
                data={[] as Row[]}
                metricColumns={metricColumns}
                loadingStates={defaultLoadingStates}
                DownloadButton={<button>Download</button>}
                nameColumns={nameColumns}
            />,
        )

        expect(
            screen.getByRole('button', { name: /download/i }),
        ).toBeInTheDocument()
    })

    it('shows empty state when there is no data and not loading', () => {
        render(
            <ReportingMetricBreakdownTable
                data={[] as Row[]}
                metricColumns={metricColumns}
                loadingStates={defaultLoadingStates}
                DownloadButton={null}
                nameColumns={nameColumns}
            />,
        )

        expect(screen.getByText('No data found')).toBeInTheDocument()
        expect(
            screen.getByText('Try to adjust your report filters.'),
        ).toBeInTheDocument()
    })

    it('does not show empty state while loading', () => {
        render(
            <ReportingMetricBreakdownTable
                data={[] as Row[]}
                metricColumns={metricColumns}
                loadingStates={{
                    ...defaultLoadingStates,
                    automatedInteractions: true,
                }}
                DownloadButton={null}
                nameColumns={nameColumns}
            />,
        )

        expect(screen.queryByText('No data found')).not.toBeInTheDocument()
    })

    it('renders table rows using the name accessor value', () => {
        render(
            <ReportingMetricBreakdownTable
                data={sampleData}
                metricColumns={metricColumns}
                loadingStates={defaultLoadingStates}
                DownloadButton={null}
                nameColumns={nameColumns}
            />,
        )

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('Flows')).toBeInTheDocument()
    })

    it('renders display names from displayNames map when provided', () => {
        const displayNames = {
            'AI Agent': 'AI Agent (mapped)',
            Flows: 'Flows (mapped)',
        }

        render(
            <ReportingMetricBreakdownTable
                data={sampleData}
                metricColumns={metricColumns}
                loadingStates={defaultLoadingStates}
                DownloadButton={null}
                nameColumns={[{ ...nameColumns[0], displayNames }]}
            />,
        )

        expect(screen.getByText('AI Agent (mapped)')).toBeInTheDocument()
        expect(screen.getByText('Flows (mapped)')).toBeInTheDocument()
    })

    it('does not show empty state when data is provided', () => {
        render(
            <ReportingMetricBreakdownTable
                data={sampleData}
                metricColumns={metricColumns}
                loadingStates={defaultLoadingStates}
                DownloadButton={null}
                nameColumns={nameColumns}
            />,
        )

        expect(screen.queryByText('No data found')).not.toBeInTheDocument()
    })

    describe('search bar padding', () => {
        it('reserves top padding when search is enabled and the section shows tabs', () => {
            vi.mocked(useDashboardContext).mockReturnValue(
                contextWithSiblingTables(['other_table']),
            )

            const { container } = render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                    enableSearch
                />,
            )

            expect(container.firstChild).toHaveStyle({ paddingTop: '42px' })
        })

        it('does not reserve padding for a single-table section (no tabs)', () => {
            vi.mocked(useDashboardContext).mockReturnValue(
                contextWithSiblingTables([]),
            )

            const { container } = render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                    enableSearch
                />,
            )

            expect(container.firstChild).not.toHaveStyle({
                paddingTop: '42px',
            })
        })

        it('does not reserve padding when search is disabled', () => {
            vi.mocked(useDashboardContext).mockReturnValue(
                contextWithSiblingTables(['other_table']),
            )

            const { container } = render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                />,
            )

            expect(container.firstChild).not.toHaveStyle({
                paddingTop: '42px',
            })
        })

        it('does not reserve padding on a custom dashboard even with tabs', () => {
            vi.mocked(useDashboardContext).mockReturnValue(
                contextWithSiblingTables(['other_table']),
            )

            const { container } = render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                    enableSearch
                    customDashboardChartSchema={{}}
                />,
            )

            expect(container.firstChild).not.toHaveStyle({
                paddingTop: '42px',
            })
        })
    })

    describe('actionMenu', () => {
        it('renders the actionMenu when provided', () => {
            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    actionMenu={<button>Add to dashboard</button>}
                />,
            )

            expect(
                screen.getByRole('button', { name: /add to dashboard/i }),
            ).toBeInTheDocument()
        })

        it('does not render an actionMenu when not provided', () => {
            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /add to dashboard/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('column editing', () => {
        it('renders the Edit metrics button', () => {
            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                />,
            )

            expect(
                screen.getByRole('button', { name: /edit metrics/i }),
            ).toBeInTheDocument()
        })

        it('opens the column editing panel when Edit metrics is clicked', async () => {
            const user = userEvent.setup()

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit metrics/i }),
            )

            expect(
                screen.getByRole('button', { name: /save/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /cancel/i }),
            ).toBeInTheDocument()
        })
    })

    describe('customDashboardChartSchema', () => {
        it('renders "Performance breakdown by {name}" label when customDashboardChartSchema and name are provided', () => {
            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    customDashboardChartSchema={{}}
                    name="Channel"
                />,
            )

            expect(
                screen.getByText('Performance breakdown by Channel'),
            ).toBeInTheDocument()
        })

        it('does not render the label when customDashboardChartSchema is not provided', () => {
            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    name="Channel"
                />,
            )

            expect(
                screen.queryByText(/Performance breakdown by/),
            ).not.toBeInTheDocument()
        })

        it('does not render the label when name is not provided', () => {
            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    customDashboardChartSchema={{}}
                />,
            )

            expect(
                screen.queryByText(/Performance breakdown by/),
            ).not.toBeInTheDocument()
        })

        it('renders the actionMenu in the header when customDashboardChartSchema and name are provided', () => {
            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    actionMenu={<button>Remove from dashboard</button>}
                    customDashboardChartSchema={{}}
                    name="Channel"
                />,
            )

            expect(
                screen.getByRole('button', { name: /remove from dashboard/i }),
            ).toBeInTheDocument()
        })

        it('renders actionMenu even when customDashboardChartSchema is provided but name is absent', () => {
            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    actionMenu={<button>Remove from dashboard</button>}
                    customDashboardChartSchema={{}}
                />,
            )

            expect(
                screen.getByRole('button', { name: /remove from dashboard/i }),
            ).toBeInTheDocument()
        })
    })

    describe('column visibility persistence', () => {
        it('saves visible columns with the chartId when Save is clicked', async () => {
            const user = userEvent.setup()

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit metrics/i }),
            )
            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(mockSaveVisibleColumns).toHaveBeenCalledTimes(1)
            expect(mockSaveVisibleColumns).toHaveBeenCalledWith(
                CHART_ID,
                expect.any(Array),
            )
        })

        it('initializes saved columns from the context layoutConfig', async () => {
            const user = userEvent.setup()
            vi.mocked(useDashboardContext).mockReturnValue(
                contextWithSavedColumns(['value']),
            )

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit metrics/i }),
            )
            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(mockSaveVisibleColumns).toHaveBeenCalledWith(CHART_ID, [
                'value',
            ])
        })

        it('does not render rows while the dashboard context is loading', () => {
            vi.mocked(useDashboardContext).mockReturnValue({
                ...baseContext,
                isLoaded: false,
            })

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                />,
            )

            expect(screen.queryByText('AI Agent')).not.toBeInTheDocument()
            expect(screen.queryByText('Flows')).not.toBeInTheDocument()
        })

        it('initializes visible columns from schema preferences', async () => {
            const user = userEvent.setup()
            const twoMetricColumns: MetricColumnConfig[] = [
                { ...metricColumns[0] },
                {
                    accessorKey: 'value2',
                    label: 'Value 2',
                    tooltipTitle: 'Value 2',
                    tooltipCaption: 'The second value.',
                    metricFormat: 'decimal',
                    loadingStateKeys: ['automatedInteractions'],
                },
            ]

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={twoMetricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                    customDashboardChartSchema={{
                        metadata: {
                            preferences: {
                                columns: [
                                    { column_id: 'value', visible: true },
                                ],
                            },
                        },
                    }}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit metrics/i }),
            )
            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(mockSaveVisibleColumns).toHaveBeenCalledWith(CHART_ID, [
                'value',
            ])
        })

        it('preserves column order from schema preferences when saving via onSaveColumns', async () => {
            const user = userEvent.setup()
            const onSaveColumns = vi.fn()
            const twoMetricColumns: MetricColumnConfig[] = [
                { ...metricColumns[0] },
                {
                    accessorKey: 'value2',
                    label: 'Value 2',
                    tooltipTitle: 'Value 2',
                    tooltipCaption: 'The second value.',
                    metricFormat: 'decimal',
                    loadingStateKeys: ['automatedInteractions'],
                },
            ]

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={twoMetricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                    onSaveColumns={onSaveColumns}
                    customDashboardChartSchema={{
                        metadata: {
                            preferences: {
                                columns: [
                                    { column_id: 'value2', visible: true },
                                    { column_id: 'value', visible: true },
                                ],
                            },
                        },
                    }}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit metrics/i }),
            )
            await user.click(screen.getByRole('button', { name: /save/i }))

            const savedColumns: ColumnConfig[] = onSaveColumns.mock.calls[0][0]
            const visibleSavedColumns = savedColumns
                .filter((c) => c.visible)
                .map((c) => c.column_id)
            expect(visibleSavedColumns).toEqual(['value2', 'value'])
        })

        it('passes hidden columns with visible: false to onSaveColumns', async () => {
            const user = userEvent.setup()
            const onSaveColumns = vi.fn()
            const twoMetricColumns: MetricColumnConfig[] = [
                { ...metricColumns[0] },
                {
                    accessorKey: 'value2',
                    label: 'Value 2',
                    tooltipTitle: 'Value 2',
                    tooltipCaption: 'The second value.',
                    metricFormat: 'decimal',
                    loadingStateKeys: ['automatedInteractions'],
                },
            ]

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={twoMetricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                    onSaveColumns={onSaveColumns}
                    customDashboardChartSchema={{
                        metadata: {
                            preferences: {
                                columns: [
                                    { column_id: 'value', visible: true },
                                    { column_id: 'value2', visible: false },
                                ],
                            },
                        },
                    }}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit metrics/i }),
            )
            await user.click(screen.getByRole('button', { name: /save/i }))

            const saved: ColumnConfig[] = onSaveColumns.mock.calls[0][0]
            expect(saved.find((c) => c.column_id === 'value2')).toEqual({
                column_id: 'value2',
                visible: false,
            })
        })

        it('excludes columns with visible: false from schema preferences', async () => {
            const user = userEvent.setup()
            const twoMetricColumns: MetricColumnConfig[] = [
                { ...metricColumns[0] },
                {
                    accessorKey: 'value2',
                    label: 'Value 2',
                    tooltipTitle: 'Value 2',
                    tooltipCaption: 'The second value.',
                    metricFormat: 'decimal',
                    loadingStateKeys: ['automatedInteractions'],
                },
            ]

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={twoMetricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                    customDashboardChartSchema={{
                        metadata: {
                            preferences: {
                                columns: [
                                    { column_id: 'value', visible: true },
                                    { column_id: 'value2', visible: false },
                                ],
                            },
                        },
                    }}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit metrics/i }),
            )
            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(mockSaveVisibleColumns).toHaveBeenCalledWith(CHART_ID, [
                'value',
            ])
        })

        it('schema preferences take priority over managed dashboard savedItem columns', async () => {
            const user = userEvent.setup()
            const twoMetricColumns: MetricColumnConfig[] = [
                { ...metricColumns[0] },
                {
                    accessorKey: 'value2',
                    label: 'Value 2',
                    tooltipTitle: 'Value 2',
                    tooltipCaption: 'The second value.',
                    metricFormat: 'decimal',
                    loadingStateKeys: ['automatedInteractions'],
                },
            ]
            vi.mocked(useDashboardContext).mockReturnValue(
                contextWithSavedColumns(['value2']),
            )

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={twoMetricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                    customDashboardChartSchema={{
                        metadata: {
                            preferences: {
                                columns: [
                                    { column_id: 'value', visible: true },
                                ],
                            },
                        },
                    }}
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit metrics/i }),
            )
            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(mockSaveVisibleColumns).toHaveBeenCalledWith(CHART_ID, [
                'value',
            ])
        })

        it('applies saved column visibility after the context finishes loading', async () => {
            const twoMetricColumns: MetricColumnConfig[] = [
                { ...metricColumns[0] },
                {
                    accessorKey: 'value2',
                    label: 'Value 2',
                    tooltipTitle: 'Value 2',
                    tooltipCaption: 'The second value.',
                    metricFormat: 'decimal',
                    loadingStateKeys: ['automatedInteractions'],
                },
            ]

            vi.mocked(useDashboardContext).mockReturnValue({
                ...baseContext,
                isLoaded: false,
            })

            const { rerender } = render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={twoMetricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                />,
            )

            vi.mocked(useDashboardContext).mockReturnValue(
                contextWithSavedColumns(['value']),
            )

            rerender(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={twoMetricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId={CHART_ID}
                />,
            )

            expect(screen.getByText('Value')).toBeInTheDocument()
            expect(screen.queryByText('Value 2')).not.toBeInTheDocument()
        })
    })
})
