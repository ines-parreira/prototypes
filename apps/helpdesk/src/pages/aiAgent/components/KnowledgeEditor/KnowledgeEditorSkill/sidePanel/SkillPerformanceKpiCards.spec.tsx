import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useSkillPerformanceDataContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import type { SkillMetrics } from 'pages/aiAgent/skills/types'

import { SkillPerformanceKpiCards } from './SkillPerformanceKpiCards'

type MockTrendBadgeProps = {
    value: number | null
    prevValue: number | null
    interpretAs?: string
    metricFormat?: string
}

const mockTrendBadge = jest.fn((props: MockTrendBadgeProps) => (
    <span
        data-testid="trend-badge"
        data-value={props.value === null ? 'null' : String(props.value)}
        data-prev-value={
            props.prevValue === null ? 'null' : String(props.prevValue)
        }
        data-interpret-as={props.interpretAs ?? ''}
        data-metric-format={props.metricFormat ?? ''}
    />
))

jest.mock('@repo/reporting', () => ({
    TrendBadge: (props: MockTrendBadgeProps) => mockTrendBadge(props),
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext',
    () => ({
        useSkillPerformanceDataContext: jest.fn(),
    }),
)

const mockUseSkillPerformanceDataContext =
    useSkillPerformanceDataContext as jest.Mock

type BaseSkillMetrics = {
    metrics: SkillMetrics
    isLoading: boolean
}

const baseSkillMetrics: BaseSkillMetrics = {
    metrics: {
        tickets: 50,
        prevTickets: 40,
        handoverTickets: 8,
        prevHandoverTickets: 10,
        csat: 4.6,
        prevCsat: 4.3,
        resourceSourceSetId: 100,
    },
    isLoading: false,
}

const setSkillMetrics = (overrides: Partial<BaseSkillMetrics> = {}) => {
    mockUseSkillPerformanceDataContext.mockReturnValue({
        skillMetrics: { ...baseSkillMetrics, ...overrides },
    })
}

describe('SkillPerformanceKpiCards', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setSkillMetrics()
    })

    it('renders four cards in the M3 design order: Success rate, Tickets, Handover tickets, Average CSAT', () => {
        render(<SkillPerformanceKpiCards />)

        const labels = screen
            .getAllByText(
                /^(Success rate|Tickets|Handover tickets|Average CSAT)$/,
            )
            .map((node) => node.textContent)

        expect(labels).toEqual([
            'Success rate',
            'Tickets',
            'Handover tickets',
            'Average CSAT',
        ])
    })

    it('shows the integer ticket count', () => {
        render(<SkillPerformanceKpiCards />)

        expect(screen.getByRole('heading', { name: '50' })).toBeInTheDocument()
    })

    it('shows the integer handover ticket count', () => {
        render(<SkillPerformanceKpiCards />)

        expect(screen.getByRole('heading', { name: '8' })).toBeInTheDocument()
    })

    it('formats CSAT with one decimal place via formatCsat', () => {
        render(<SkillPerformanceKpiCards />)

        expect(screen.getByRole('heading', { name: '4.6' })).toBeInTheDocument()
    })

    it('always shows the placeholder for Success rate until M4 wires real data', () => {
        render(<SkillPerformanceKpiCards />)

        const placeholderHeadings = screen
            .getAllByRole('heading')
            .filter((node) => node.textContent === '--')
        expect(placeholderHeadings).toHaveLength(1)
    })

    it('shows the placeholder when individual metric values are null', () => {
        setSkillMetrics({
            metrics: {
                tickets: null,
                prevTickets: null,
                handoverTickets: null,
                prevHandoverTickets: null,
                csat: null,
                prevCsat: null,
                resourceSourceSetId: 0,
            },
        })

        render(<SkillPerformanceKpiCards />)

        // Success rate + 3 null metric cards.
        const placeholderHeadings = screen
            .getAllByRole('heading')
            .filter((node) => node.textContent === '--')
        expect(placeholderHeadings).toHaveLength(4)
    })

    it('shows a skeleton on Tickets/Handover/CSAT while loading but always renders Success rate', () => {
        setSkillMetrics({ isLoading: true })

        render(<SkillPerformanceKpiCards />)

        // Success rate card never goes into loading state (no real data yet).
        expect(screen.getByRole('heading', { name: '--' })).toBeInTheDocument()
        // Other three cards skip their heading while loading.
        expect(
            screen.queryByRole('heading', { name: '50' }),
        ).not.toBeInTheDocument()
    })

    it('passes real value/prevValue and the correct format to each trend badge', () => {
        render(<SkillPerformanceKpiCards />)

        const badges = mockTrendBadge.mock.calls.map(([props]) => props)

        // Success rate is the placeholder card — null value/prev, decimal-to-percent format.
        expect(badges[0]).toMatchObject({
            value: null,
            prevValue: null,
            metricFormat: 'decimal-to-percent',
        })
        // Tickets
        expect(badges[1]).toMatchObject({
            value: 50,
            prevValue: 40,
            metricFormat: 'decimal',
        })
        // Handover tickets
        expect(badges[2]).toMatchObject({
            value: 8,
            prevValue: 10,
            metricFormat: 'decimal',
        })
        // Average CSAT
        expect(badges[3]).toMatchObject({
            value: 4.6,
            prevValue: 4.3,
            metricFormat: 'decimal-precision-1',
        })
    })

    it('marks Handover tickets as less-is-better so a drop renders as a positive trend', () => {
        render(<SkillPerformanceKpiCards />)

        const badges = mockTrendBadge.mock.calls.map(([props]) => props)
        expect(badges[2]?.interpretAs).toBe('less-is-better')
    })

    it('defaults Tickets and Average CSAT to more-is-better', () => {
        render(<SkillPerformanceKpiCards />)

        const badges = mockTrendBadge.mock.calls.map(([props]) => props)
        expect(badges[1]?.interpretAs ?? 'more-is-better').toBe(
            'more-is-better',
        )
        expect(badges[3]?.interpretAs ?? 'more-is-better').toBe(
            'more-is-better',
        )
    })
})
