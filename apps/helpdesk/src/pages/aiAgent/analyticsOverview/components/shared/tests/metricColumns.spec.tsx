import { NOT_AVAILABLE_PLACEHOLDER } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import type { MetricColumnConfig, MetricLoadingStates } from '../metricColumns'
import { buildMetricColumnDefs } from '../metricColumns'

jest.mock('@repo/reporting', () => ({
    NOT_AVAILABLE_PLACEHOLDER: '-',
    formatMetricValue: jest.fn(() => 'formatted-value'),
}))

jest.mock('@gorgias/axiom', () => ({
    Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Icon: () => null,
    Skeleton: () => <div data-testid="skeleton" />,
    Text: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
}))

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/SortableHeaderCell',
    () => ({
        SortableHeaderCell: () => null,
    }),
)

const defaultLoadingStates: MetricLoadingStates = {
    automationRate: false,
    automatedInteractions: false,
    handoverInteractions: false,
    timeSaved: false,
    costSaved: false,
}

const baseConfig: MetricColumnConfig = {
    accessorKey: 'costSaved',
    label: 'Cost saved',
    tooltipTitle: 'Cost saved',
    tooltipCaption: 'Some caption',
    metricFormat: 'currency-precision-1',
    loadingStateKeys: ['costSaved'],
}

const makeInfo = (value: number | null) => ({
    getValue: () => value,
    row: { original: { feature: 'test-feature' } },
})

describe('buildMetricColumnDefs', () => {
    describe('cell renderer', () => {
        it('returns NOT_AVAILABLE_PLACEHOLDER when showNotAvailable is true and value is NaN', () => {
            const [column] = buildMetricColumnDefs(
                [{ ...baseConfig, showNotAvailable: true }],
                defaultLoadingStates,
                (row: { feature: string }) => row.feature,
                '',
            )
            const cellFn = column.cell as (
                info: ReturnType<typeof makeInfo>,
            ) => React.ReactNode
            expect(cellFn(makeInfo(NaN))).toBe(NOT_AVAILABLE_PLACEHOLDER)
        })

        it('does not return NOT_AVAILABLE_PLACEHOLDER when showNotAvailable is false and value is NaN', () => {
            const [column] = buildMetricColumnDefs(
                [{ ...baseConfig, showNotAvailable: false }],
                defaultLoadingStates,
                (row: { feature: string }) => row.feature,
                '',
            )
            const cellFn = column.cell as (
                info: ReturnType<typeof makeInfo>,
            ) => React.ReactNode
            expect(cellFn(makeInfo(NaN))).not.toBe(NOT_AVAILABLE_PLACEHOLDER)
        })

        it('falls through to formatMetricValue when showNotAvailable is true but value is null', () => {
            const { formatMetricValue } = jest.requireMock('@repo/reporting')
            const [column] = buildMetricColumnDefs(
                [{ ...baseConfig, showNotAvailable: true }],
                defaultLoadingStates,
                (row: { feature: string }) => row.feature,
                '',
            )
            const cellFn = column.cell as (
                info: ReturnType<typeof makeInfo>,
            ) => React.ReactNode
            cellFn(makeInfo(null))
            expect(formatMetricValue).toHaveBeenCalledWith(
                null,
                baseConfig.metricFormat,
                'USD',
                true,
            )
        })

        it('shows a skeleton when a loading state is active and value is null', () => {
            const [column] = buildMetricColumnDefs(
                [baseConfig],
                { ...defaultLoadingStates, costSaved: true },
                (row: { feature: string }) => row.feature,
                '',
            )
            const cellFn = column.cell as (
                info: ReturnType<typeof makeInfo>,
            ) => React.ReactNode
            render(<>{cellFn(makeInfo(null))}</>)
            expect(screen.getByTestId('skeleton')).toBeInTheDocument()
        })

        it('formats the value normally for valid numbers', () => {
            const [column] = buildMetricColumnDefs(
                [{ ...baseConfig, showNotAvailable: true }],
                defaultLoadingStates,
                (row: { feature: string }) => row.feature,
                '',
            )
            const cellFn = column.cell as (
                info: ReturnType<typeof makeInfo>,
            ) => React.ReactNode
            expect(cellFn(makeInfo(42))).not.toBe(NOT_AVAILABLE_PLACEHOLDER)
        })
    })
})
