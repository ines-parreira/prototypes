import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSaveTableColumnVisibility } from '../../hooks/useSaveTableColumnVisibility'
import type {
    MetricColumnConfig,
    MetricLoadingStates,
} from './ReportingMetricBreakdownTable'
import { ReportingMetricBreakdownTable } from './ReportingMetricBreakdownTable'

vi.mock('../../hooks/useSaveTableColumnVisibility')

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

const mockOnSaveVisibleColumns = vi.fn()

beforeEach(() => {
    vi.mocked(useSaveTableColumnVisibility).mockReturnValue({
        onSaveVisibleColumns: mockOnSaveVisibleColumns,
        defaultVisibleColumns: undefined,
        isLoaded: true,
        tabId: 'overview',
    })
    mockOnSaveVisibleColumns.mockClear()
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

    describe('column visibility persistence', () => {
        it('passes chartId to useSaveTableColumnVisibility', () => {
            render(
                <ReportingMetricBreakdownTable
                    data={[]}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId="performance_breakdown_table"
                />,
            )

            expect(useSaveTableColumnVisibility).toHaveBeenCalledWith(
                'performance_breakdown_table',
            )
        })

        it('calls onSaveVisibleColumns when Save is clicked', async () => {
            const user = userEvent.setup()

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId="performance_breakdown_table"
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit metrics/i }),
            )
            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(mockOnSaveVisibleColumns).toHaveBeenCalledTimes(1)
        })

        it('initializes saved columns from defaultVisibleColumns', async () => {
            const user = userEvent.setup()
            vi.mocked(useSaveTableColumnVisibility).mockReturnValue({
                onSaveVisibleColumns: mockOnSaveVisibleColumns,
                defaultVisibleColumns: ['value'],
                isLoaded: true,
                tabId: 'overview',
            })

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId="performance_breakdown_table"
                />,
            )

            await user.click(
                screen.getByRole('button', { name: /edit metrics/i }),
            )
            await user.click(screen.getByRole('button', { name: /save/i }))

            expect(mockOnSaveVisibleColumns).toHaveBeenCalledWith(['value'])
        })

        it('does not render rows while the dashboard context is loading', () => {
            vi.mocked(useSaveTableColumnVisibility).mockReturnValue({
                onSaveVisibleColumns: mockOnSaveVisibleColumns,
                defaultVisibleColumns: undefined,
                isLoaded: false,
                tabId: 'overview',
            })

            render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={metricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId="performance_breakdown_table"
                />,
            )

            expect(screen.queryByText('AI Agent')).not.toBeInTheDocument()
            expect(screen.queryByText('Flows')).not.toBeInTheDocument()
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

            vi.mocked(useSaveTableColumnVisibility).mockReturnValue({
                onSaveVisibleColumns: mockOnSaveVisibleColumns,
                defaultVisibleColumns: undefined,
                isLoaded: false,
                tabId: 'overview',
            })

            const { rerender } = render(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={twoMetricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId="performance_breakdown_table"
                />,
            )

            vi.mocked(useSaveTableColumnVisibility).mockReturnValue({
                onSaveVisibleColumns: mockOnSaveVisibleColumns,
                defaultVisibleColumns: ['value'],
                isLoaded: true,
                tabId: 'overview',
            })

            rerender(
                <ReportingMetricBreakdownTable
                    data={sampleData}
                    metricColumns={twoMetricColumns}
                    loadingStates={defaultLoadingStates}
                    DownloadButton={null}
                    nameColumns={nameColumns}
                    chartId="performance_breakdown_table"
                />,
            )

            expect(screen.getByText('Value')).toBeInTheDocument()
            expect(screen.queryByText('Value 2')).not.toBeInTheDocument()
        })
    })
})
