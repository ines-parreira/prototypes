import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type {
    MetricColumnConfig,
    MetricLoadingStates,
} from './ReportingMetricBreakdownTable'
import { ReportingMetricBreakdownTable } from './ReportingMetricBreakdownTable'

type Row = { name: string; value: number }

const nameColumn = { accessor: 'name' as const, label: 'Name' }

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

describe('ReportingMetricBreakdownTable', () => {
    it('renders the download button', () => {
        render(
            <ReportingMetricBreakdownTable
                data={[] as Row[]}
                metricColumns={metricColumns}
                loadingStates={defaultLoadingStates}
                getRowKey={(row) => row.name}
                DownloadButton={<button>Download</button>}
                nameColumn={nameColumn}
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
                getRowKey={(row) => row.name}
                DownloadButton={null}
                nameColumn={nameColumn}
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
                getRowKey={(row) => row.name}
                DownloadButton={null}
                nameColumn={nameColumn}
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
                getRowKey={(row) => row.name}
                DownloadButton={null}
                nameColumn={nameColumn}
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
                getRowKey={(row) => row.name}
                DownloadButton={null}
                nameColumn={{ ...nameColumn, displayNames }}
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
                getRowKey={(row) => row.name}
                DownloadButton={null}
                nameColumn={nameColumn}
            />,
        )

        expect(screen.queryByText('No data found')).not.toBeInTheDocument()
    })
})
