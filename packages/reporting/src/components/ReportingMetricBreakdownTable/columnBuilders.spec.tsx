import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { formatMetricValue } from '../../utils/helpers'
import { buildMetricColumnDefs, buildNameColDef } from './columnBuilders'
import type { MetricColumnConfig, MetricLoadingStates } from './types'

vi.mock('../../constants', () => ({
    NOT_AVAILABLE_PLACEHOLDER: '-',
}))

vi.mock('../../utils/helpers', () => ({
    formatMetricValue: vi.fn(() => 'formatted-value'),
}))

vi.mock('./ReportingMetricBreakdownTable.less', () => ({
    default: { featureName: 'featureName' },
}))

beforeEach(() => {
    vi.clearAllMocks()
})

const defaultLoadingStates: MetricLoadingStates = {
    automationRate: false,
    automatedInteractions: false,
    handovers: false,
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

describe('buildNameColDef', () => {
    it('returns a column def with the correct accessorKey', () => {
        const col = buildNameColDef({
            accessor: 'feature' as const,
            label: 'Feature',
        })
        expect((col as any).accessorKey).toBe('feature')
    })

    it('returns a column def with enableHiding false', () => {
        const col = buildNameColDef({
            accessor: 'feature' as const,
            label: 'Feature',
        })
        expect(col.enableHiding).toBe(false)
    })

    it('cell renders the raw value when no displayNames provided', () => {
        const col = buildNameColDef({
            accessor: 'name' as const,
            label: 'Name',
        })
        const cellFn = col.cell as any
        render(
            <>
                {cellFn({ getValue: () => 'AI Agent', row: { original: {} } })}
            </>,
        )
        expect(screen.getByText('AI Agent')).toBeInTheDocument()
    })

    it('cell renders the mapped display name when displayNames provided', () => {
        const col = buildNameColDef({
            accessor: 'entity' as const,
            label: 'Entity',
            displayNames: { cancel_order: 'Cancel order' },
        })
        const cellFn = col.cell as any
        render(
            <>
                {cellFn({
                    getValue: () => 'cancel_order',
                    row: { original: {} },
                })}
            </>,
        )
        expect(screen.getByText('Cancel order')).toBeInTheDocument()
    })

    it('cell renders an icon link when getHref is provided', () => {
        const col = buildNameColDef({
            accessor: 'entity' as const,
            label: 'Article name',
            displayNames: {
                'https://example.com/article-1': 'How to return',
            },
            getHref: (value) => value,
        })
        const cellFn = col.cell as any
        render(
            <>
                {cellFn({
                    getValue: () => 'https://example.com/article-1',
                    row: { original: {} },
                })}
            </>,
        )
        expect(screen.getByText('How to return')).toBeInTheDocument()
        const link = screen.getByRole('link', { name: 'Open How to return' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://example.com/article-1')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('cell renders an icon link using the raw value when getHref is provided but no displayNames', () => {
        const col = buildNameColDef({
            accessor: 'entity' as const,
            label: 'Article name',
            getHref: (value) => value,
        })
        const cellFn = col.cell as any
        render(
            <>
                {cellFn({
                    getValue: () => 'https://example.com/article-1',
                    row: { original: {} },
                })}
            </>,
        )
        const link = screen.getByRole('link', {
            name: 'Open https://example.com/article-1',
        })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://example.com/article-1')
    })

    it('cell renders a plain name without a link when getHref is not provided', () => {
        const col = buildNameColDef({
            accessor: 'entity' as const,
            label: 'Feature name',
        })
        const cellFn = col.cell as any
        render(
            <>{cellFn({ getValue: () => 'skill_a', row: { original: {} } })}</>,
        )
        expect(screen.getByText('skill_a')).toBeInTheDocument()
        expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('cell renders an avatar when getAvatarProps is provided', () => {
        const col = buildNameColDef({
            accessor: 'entity' as const,
            label: 'Product name',
            getAvatarProps: (value) => ({
                name: `Product ${value}`,
                url: `https://example.com/img/${value}.jpg`,
            }),
        })
        const cellFn = col.cell as any
        render(<>{cellFn({ getValue: () => '42', row: { original: {} } })}</>)
        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    it('cell renders an avatar without image src when url is undefined', () => {
        const col = buildNameColDef({
            accessor: 'entity' as const,
            label: 'Product name',
            getAvatarProps: (value) => ({ name: `Product ${value}` }),
        })
        const cellFn = col.cell as any
        render(<>{cellFn({ getValue: () => '7', row: { original: {} } })}</>)
        expect(screen.getByText('P7')).toBeInTheDocument()
    })

    it('cell does not render an avatar when getAvatarProps is not provided', () => {
        const col = buildNameColDef({
            accessor: 'entity' as const,
            label: 'Feature name',
        })
        const cellFn = col.cell as any
        render(
            <>{cellFn({ getValue: () => 'skill_a', row: { original: {} } })}</>,
        )
        expect(screen.queryByRole('img')).not.toBeInTheDocument()
    })

    describe('sortingFn', () => {
        const makeRow = (value: string) => ({
            getValue: () => value,
        })

        it('sorts by raw value when no displayNames or formatName provided', () => {
            const col = buildNameColDef({
                accessor: 'entity' as const,
                label: 'Feature name',
            })
            const sortingFn = (col as any).sortingFn
            expect(
                sortingFn(makeRow('banana'), makeRow('apple'), 'Feature name'),
            ).toBeGreaterThan(0)
            expect(
                sortingFn(makeRow('apple'), makeRow('banana'), 'Feature name'),
            ).toBeLessThan(0)
            expect(
                sortingFn(makeRow('apple'), makeRow('apple'), 'Feature name'),
            ).toBe(0)
        })

        it('sorts by displayName when displayNames are provided', () => {
            const col = buildNameColDef({
                accessor: 'entity' as const,
                label: 'Entity',
                displayNames: {
                    cancel_order: 'Cancel order',
                    track_package: 'Track package',
                },
            })
            const sortingFn = (col as any).sortingFn
            expect(
                sortingFn(
                    makeRow('cancel_order'),
                    makeRow('track_package'),
                    'Entity',
                ),
            ).toBeLessThan(0)
            expect(
                sortingFn(
                    makeRow('track_package'),
                    makeRow('cancel_order'),
                    'Entity',
                ),
            ).toBeGreaterThan(0)
        })

        it('sorts by formatted name when formatName is provided', () => {
            const col = buildNameColDef({
                accessor: 'entity' as const,
                label: 'Entity',
                formatName: (value) => value.toUpperCase(),
            })
            const sortingFn = (col as any).sortingFn
            expect(
                sortingFn(makeRow('apple'), makeRow('banana'), 'Entity'),
            ).toBeLessThan(0)
        })
    })
})

describe('buildMetricColumnDefs', () => {
    it('returns one column def per entry in metricColumns', () => {
        const cols = buildMetricColumnDefs([baseConfig], defaultLoadingStates)
        expect(cols).toHaveLength(1)
    })

    it('returns columns with the correct accessorKeys', () => {
        const configs: MetricColumnConfig[] = [
            {
                ...baseConfig,
                accessorKey: 'automationRate',
                loadingStateKeys: ['automationRate'],
            },
            {
                ...baseConfig,
                accessorKey: 'handoverCount',
                loadingStateKeys: ['handovers'],
            },
        ]
        const cols = buildMetricColumnDefs(configs, defaultLoadingStates)
        expect(cols.map((c) => (c as any).accessorKey)).toEqual([
            'automationRate',
            'handoverCount',
        ])
    })

    it('returns columns with enableHiding true', () => {
        const cols = buildMetricColumnDefs([baseConfig], defaultLoadingStates)
        expect(cols[0].enableHiding).toBe(true)
    })

    it('cell shows a skeleton when loading state is active and value is null', () => {
        const [col] = buildMetricColumnDefs([baseConfig], {
            ...defaultLoadingStates,
            costSaved: true,
        })
        const cellFn = col.cell as any
        render(<>{cellFn(makeInfo(null))}</>)
        expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    it('cell shows not available placeholder when showNotAvailable is true and value is NaN', () => {
        const [col] = buildMetricColumnDefs(
            [{ ...baseConfig, showNotAvailable: true }],
            defaultLoadingStates,
        )
        const cellFn = col.cell as any
        render(<>{cellFn(makeInfo(NaN))}</>)
        expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('cell does not show not available placeholder when showNotAvailable is false and value is NaN', () => {
        const [col] = buildMetricColumnDefs(
            [{ ...baseConfig, showNotAvailable: false }],
            defaultLoadingStates,
        )
        const cellFn = col.cell as any
        render(<>{cellFn(makeInfo(NaN))}</>)
        expect(screen.queryByText('-')).not.toBeInTheDocument()
    })

    it('cell calls formatMetricValue for normal values', () => {
        const [col] = buildMetricColumnDefs([baseConfig], defaultLoadingStates)
        const cellFn = col.cell as any
        cellFn(makeInfo(42))
        expect(vi.mocked(formatMetricValue)).toHaveBeenCalledWith(
            42,
            baseConfig.metricFormat,
            'USD',
            true,
        )
    })
})
