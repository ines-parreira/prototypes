import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { formatMetricValue } from '../../utils/helpers'
import { buildMetricColumnDefs, buildNameColDef } from './columnBuilders'
import type { MetricColumnConfig, MetricLoadingStates } from './types'

vi.mock('../../constants', () => ({
    NOT_AVAILABLE_PLACEHOLDER: '-',
}))

vi.mock('../../utils/helpers', () => ({
    formatMetricValue: vi.fn(() => 'formatted-value'),
}))

vi.mock('@gorgias/axiom', () => ({
    Avatar: ({ name, url }: { name: string; url?: string; size?: string }) => (
        <img alt={name} src={url} />
    ),
    Box: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Icon: () => null,
    Link: ({
        children,
        href,
        target,
        rel,
    }: {
        children: React.ReactNode
        href: string
        target?: string
        rel?: string
    }) => (
        <a href={href} target={target} rel={rel}>
            {children}
        </a>
    ),
    Skeleton: () => <div data-testid="skeleton" />,
    Text: ({ children }: { children: React.ReactNode }) => (
        <span>{children}</span>
    ),
    Tooltip: ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
    ),
    TooltipContent: () => null,
}))

vi.mock('./ReportingMetricBreakdownTable.less', () => ({
    default: { featureName: 'featureName' },
}))

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

    it('cell renders the display name as a link when getHref is provided', () => {
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
        const link = screen.getByRole('link', { name: 'How to return' })
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', 'https://example.com/article-1')
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('cell renders the raw value as a link when getHref is provided but no displayNames', () => {
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
            name: 'https://example.com/article-1',
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
        const avatar = screen.getByRole('img', { name: 'Product 42' })
        expect(avatar).toBeInTheDocument()
        expect(avatar).toHaveAttribute('src', 'https://example.com/img/42.jpg')
    })

    it('cell renders an avatar without image src when url is undefined', () => {
        const col = buildNameColDef({
            accessor: 'entity' as const,
            label: 'Product name',
            getAvatarProps: (value) => ({ name: `Product ${value}` }),
        })
        const cellFn = col.cell as any
        render(<>{cellFn({ getValue: () => '7', row: { original: {} } })}</>)
        expect(
            screen.getByRole('img', { name: 'Product 7' }),
        ).toBeInTheDocument()
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
})

describe('buildMetricColumnDefs', () => {
    it('returns one column def per entry in metricColumns', () => {
        const cols = buildMetricColumnDefs(
            [baseConfig],
            defaultLoadingStates,
            (row: any) => row.feature,
        )
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
        const cols = buildMetricColumnDefs(
            configs,
            defaultLoadingStates,
            (row: any) => row.feature,
        )
        expect(cols.map((c) => (c as any).accessorKey)).toEqual([
            'automationRate',
            'handoverCount',
        ])
    })

    it('returns columns with enableHiding true', () => {
        const cols = buildMetricColumnDefs(
            [baseConfig],
            defaultLoadingStates,
            (row: any) => row.feature,
        )
        expect(cols[0].enableHiding).toBe(true)
    })

    it('cell shows a skeleton when loading state is active and value is null', () => {
        const [col] = buildMetricColumnDefs(
            [baseConfig],
            { ...defaultLoadingStates, costSaved: true },
            (row: any) => row.feature,
        )
        const cellFn = col.cell as any
        render(<>{cellFn(makeInfo(null))}</>)
        expect(screen.getByTestId('skeleton')).toBeInTheDocument()
    })

    it('cell returns NOT_AVAILABLE_PLACEHOLDER when showNotAvailable is true and value is NaN', () => {
        const [col] = buildMetricColumnDefs(
            [{ ...baseConfig, showNotAvailable: true }],
            defaultLoadingStates,
            (row: any) => row.feature,
        )
        const cellFn = col.cell as any
        expect(cellFn(makeInfo(NaN))).toBe('-')
    })

    it('cell does not return NOT_AVAILABLE_PLACEHOLDER when showNotAvailable is false and value is NaN', () => {
        const [col] = buildMetricColumnDefs(
            [{ ...baseConfig, showNotAvailable: false }],
            defaultLoadingStates,
            (row: any) => row.feature,
        )
        const cellFn = col.cell as any
        expect(cellFn(makeInfo(NaN))).not.toBe('-')
    })

    it('cell calls formatMetricValue for normal values', () => {
        const [col] = buildMetricColumnDefs(
            [baseConfig],
            defaultLoadingStates,
            (row: any) => row.feature,
        )
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
