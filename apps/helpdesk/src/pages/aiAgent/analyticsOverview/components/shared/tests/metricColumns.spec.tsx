import {
    buildMetricColumnDefs,
    NOT_AVAILABLE_PLACEHOLDER,
} from '@repo/reporting'
import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import { STANDARD_METRIC_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/shared/metricColumns'

jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
}))

jest.mock('@gorgias/axiom', () => ({
    Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Icon: () => null,
    Skeleton: () => <div data-testid="skeleton" />,
    Text: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
    Tooltip: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    TooltipContent: () => null,
}))

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

describe('STANDARD_METRIC_COLUMNS', () => {
    it('has 5 entries', () => {
        expect(STANDARD_METRIC_COLUMNS).toHaveLength(5)
    })

    it('has the correct accessorKeys in order', () => {
        expect(STANDARD_METRIC_COLUMNS.map((col) => col.accessorKey)).toEqual([
            'automationRate',
            'automatedInteractions',
            'handoverInteractions',
            'costSaved',
            'timeSaved',
        ])
    })

    it('has non-empty labels for all columns', () => {
        STANDARD_METRIC_COLUMNS.forEach((col) => {
            expect(col.label.length).toBeGreaterThan(0)
        })
    })

    it('sets showNotAvailable only on costSaved', () => {
        const withFlag = STANDARD_METRIC_COLUMNS.filter(
            (col) => col.showNotAvailable,
        )
        expect(withFlag).toHaveLength(1)
        expect(withFlag[0].accessorKey).toBe('costSaved')
    })

    it('sets skeletonWidth only on timeSaved', () => {
        const withSkeleton = STANDARD_METRIC_COLUMNS.filter(
            (col) => col.skeletonWidth,
        )
        expect(withSkeleton).toHaveLength(1)
        expect(withSkeleton[0].accessorKey).toBe('timeSaved')
    })

    it('timeSaved uses both automatedInteractions and timeSaved as loadingStateKeys', () => {
        const timeSaved = STANDARD_METRIC_COLUMNS.find(
            (col) => col.accessorKey === 'timeSaved',
        )
        expect(timeSaved?.loadingStateKeys).toEqual([
            'automatedInteractions',
            'timeSaved',
        ])
    })
})

describe('buildMetricColumnDefs', () => {
    describe('cell renderer', () => {
        it('returns NOT_AVAILABLE_PLACEHOLDER when showNotAvailable is true and value is NaN', () => {
            const [column] = buildMetricColumnDefs(
                [{ ...baseConfig, showNotAvailable: true }],
                defaultLoadingStates,
                (row: { feature: string }) => row.feature,
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
            )
            const cellFn = column.cell as (
                info: ReturnType<typeof makeInfo>,
            ) => React.ReactNode
            expect(cellFn(makeInfo(NaN))).not.toBe(NOT_AVAILABLE_PLACEHOLDER)
        })

        it('shows a skeleton when a loading state is active and value is null', () => {
            const [column] = buildMetricColumnDefs(
                [baseConfig],
                { ...defaultLoadingStates, costSaved: true },
                (row: { feature: string }) => row.feature,
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
            )
            const cellFn = column.cell as (
                info: ReturnType<typeof makeInfo>,
            ) => React.ReactNode
            expect(cellFn(makeInfo(42))).not.toBe(NOT_AVAILABLE_PLACEHOLDER)
        })
    })
})
