import { useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useSkillSuccessRateMetric } from 'pages/aiAgent/skills/hooks/useSkillSuccessRateMetric'

import { SkillEditorSidePanelPerformanceMetricCards } from './SkillEditorSidePanelPerformanceMetricCards'

jest.mock('pages/aiAgent/skills/hooks/useSkillSuccessRateMetric', () => ({
    useSkillSuccessRateMetric: jest.fn(),
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock

type MockTrendCardProps = {
    trend: {
        isFetching: boolean
        isError: boolean
        data?: {
            label?: string
            value: number | null
            prevValue: number | null
        }
    }
    metricFormat?: string
    interpretAs?: string
    hint?: { title: string; caption?: string }
    timeSeriesView?: {
        useChartData?: () => {
            data: { date: string; value: number | null }[]
            isLoading: boolean
        }
    }
    drillDown?: { tooltipText: string; openDrillDownModal: () => void }
}

const mockTrendCard = jest.fn(
    ({
        trend,
        metricFormat,
        hint,
        timeSeriesView,
        drillDown,
    }: MockTrendCardProps) => (
        <div
            data-testid="trend-card"
            data-label={trend.data?.label}
            data-has-drilldown={drillDown ? 'true' : 'false'}
        >
            <span data-testid="label">{trend.data?.label}</span>
            <span data-testid="metric-format">{metricFormat}</span>
            <span data-testid="value">
                {trend.data?.value === null
                    ? 'null'
                    : String(trend.data?.value)}
            </span>
            <span data-testid="prev-value">
                {trend.data?.prevValue === null
                    ? 'null'
                    : String(trend.data?.prevValue)}
            </span>
            {hint && <span data-testid="hint">{hint.title}</span>}
            {timeSeriesView && (
                <div data-testid="time-series-view">sparkline</div>
            )}
            {drillDown && (
                <button
                    type="button"
                    data-testid="drilldown-trigger"
                    onClick={drillDown.openDrillDownModal}
                >
                    {drillDown.tooltipText}
                </button>
            )}
        </div>
    ),
)

jest.mock('@repo/reporting', () => ({
    TrendCard: (props: MockTrendCardProps) => mockTrendCard(props),
}))

const mockUseSkillSuccessRateMetric = useSkillSuccessRateMetric as jest.Mock

const baseProps = {
    metrics: null,
    isLoading: false,
    resourceSourceId: 1,
    resourceSourceSetId: 7,
    shopIntegrationId: 999,
    dateRange: { start_datetime: '2024-01-01', end_datetime: '2024-01-28' },
    totalAiAgentTickets: 100,
}

const buildMetrics = (
    overrides: Partial<{
        tickets: number | null
        prevTickets: number | null
        handoverTickets: number | null
        prevHandoverTickets: number | null
        csat: number | null
        prevCsat: number | null
    }> = {},
) => ({
    tickets: 1234,
    prevTickets: 1100,
    handoverTickets: 56,
    prevHandoverTickets: 52,
    csat: 4.5,
    prevCsat: 4.3,
    resourceSourceSetId: 0,
    ...overrides,
})

const getCardByLabel = (label: string): HTMLElement | undefined =>
    screen
        .getAllByTestId('trend-card')
        .find((node) => node.getAttribute('data-label') === label)

const fieldOf = (card: HTMLElement, testId: string): string | null =>
    card.querySelector(`[data-testid="${testId}"]`)?.textContent ?? null

beforeEach(() => {
    jest.clearAllMocks()
    mockUseFlag.mockReturnValue(true)
    mockUseSkillSuccessRateMetric.mockReturnValue({
        value: 0.85,
        prevValue: 0.83,
        sparklineData: [],
        isLoading: false,
    })
})

describe('SkillEditorSidePanelPerformanceMetricCards', () => {
    it('renders four TrendCards labelled Success rate, Tickets, Handovers, CSAT in that order', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                metrics={buildMetrics()}
            />,
        )

        const labels = screen
            .getAllByTestId('label')
            .map((node) => node.textContent)

        expect(labels).toEqual(['Success rate', 'Tickets', 'Handovers', 'CSAT'])
    })

    it('forwards the real previous-period values from the metrics prop (no derivation)', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                metrics={buildMetrics({
                    tickets: 1234,
                    prevTickets: 1100,
                    handoverTickets: 56,
                    prevHandoverTickets: 52,
                    csat: 4.5,
                    prevCsat: 4.3,
                })}
            />,
        )

        expect(fieldOf(getCardByLabel('Tickets')!, 'prev-value')).toBe('1100')
        expect(fieldOf(getCardByLabel('Handovers')!, 'prev-value')).toBe('52')
        expect(fieldOf(getCardByLabel('CSAT')!, 'prev-value')).toBe('4.3')
    })

    it('passes null prev values through once settled so the badge stays neutral instead of fabricating a 0 baseline', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                isLoading={false}
                metrics={buildMetrics({
                    prevTickets: null,
                    prevHandoverTickets: null,
                    prevCsat: null,
                })}
            />,
        )

        expect(fieldOf(getCardByLabel('Tickets')!, 'prev-value')).toBe('null')
        expect(fieldOf(getCardByLabel('Handovers')!, 'prev-value')).toBe('null')
        expect(fieldOf(getCardByLabel('CSAT')!, 'prev-value')).toBe('null')
    })

    it('keeps null prev values during loading so TrendCard can render its skeleton', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                isLoading={true}
                metrics={buildMetrics({
                    prevTickets: null,
                    prevHandoverTickets: null,
                    prevCsat: null,
                })}
            />,
        )

        expect(fieldOf(getCardByLabel('Tickets')!, 'prev-value')).toBe('null')
        expect(fieldOf(getCardByLabel('Handovers')!, 'prev-value')).toBe('null')
        expect(fieldOf(getCardByLabel('CSAT')!, 'prev-value')).toBe('null')
    })

    it('uses the decimal-to-percent format on the Success rate card and decimal/decimal-precision-1 on the others', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                metrics={buildMetrics()}
            />,
        )

        expect(fieldOf(getCardByLabel('Success rate')!, 'metric-format')).toBe(
            'decimal-to-percent',
        )
        expect(fieldOf(getCardByLabel('Tickets')!, 'metric-format')).toBe(
            'decimal',
        )
        expect(fieldOf(getCardByLabel('Handovers')!, 'metric-format')).toBe(
            'decimal',
        )
        expect(fieldOf(getCardByLabel('CSAT')!, 'metric-format')).toBe(
            'decimal-precision-1',
        )
    })

    it('always embeds the Success rate sparkline', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                metrics={buildMetrics()}
            />,
        )

        const card = getCardByLabel('Success rate')!
        expect(
            card.querySelector('[data-testid="time-series-view"]'),
        ).toBeInTheDocument()
    })

    it('hands the Success rate card the mock hook value, prev value, and an info hint', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                metrics={buildMetrics({
                    tickets: 0,
                    handoverTickets: 0,
                    csat: 0,
                })}
            />,
        )

        const card = getCardByLabel('Success rate')!
        expect(fieldOf(card, 'value')).toBe('0.85')
        expect(fieldOf(card, 'prev-value')).toBe('0.83')
        expect(fieldOf(card, 'hint')).toBe('Success rate')
    })

    it('forwards the active skillId and dateRange to useSkillSuccessRateMetric', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                resourceSourceId={42}
                resourceSourceSetId={7}
                dateRange={{
                    start_datetime: '2026-04-01T00:00:00.000Z',
                    end_datetime: '2026-04-28T23:59:59.999Z',
                }}
                metrics={buildMetrics()}
            />,
        )

        expect(mockUseSkillSuccessRateMetric).toHaveBeenCalledWith({
            skillId: 42,
            resourceSourceSetId: 7,
            shopIntegrationId: 999,
            dateRange: {
                start_datetime: '2026-04-01T00:00:00.000Z',
                end_datetime: '2026-04-28T23:59:59.999Z',
            },
        })
    })

    it('passes resourceSourceSetId to useSkillSuccessRateMetric even when metrics is still loading', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                resourceSourceId={42}
                resourceSourceSetId={7}
                metrics={null}
                isLoading={true}
            />,
        )

        expect(mockUseSkillSuccessRateMetric).toHaveBeenCalledWith(
            expect.objectContaining({
                skillId: 42,
                resourceSourceSetId: 7,
            }),
        )
    })

    it('flips the underlying trend isFetching flag while metrics are loading', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                metrics={buildMetrics()}
                isLoading={true}
            />,
        )

        const cardsExceptSuccessRate = mockTrendCard.mock.calls
            .map(([props]: [MockTrendCardProps]) => props)
            .filter((p) => p.trend.data?.label !== 'Success rate')

        expect(
            cardsExceptSuccessRate.every((p) => p.trend.isFetching === true),
        ).toBe(true)
    })

    it('wires a drilldown trigger for Tickets, Handovers, and CSAT but not for Success rate', () => {
        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                metrics={buildMetrics()}
            />,
        )

        const lookup = (label: string) =>
            getCardByLabel(label)?.getAttribute('data-has-drilldown')

        expect(lookup('Tickets')).toBe('true')
        expect(lookup('Handovers')).toBe('true')
        expect(lookup('CSAT')).toBe('true')
        expect(lookup('Success rate')).toBe('false')
    })

    it('hides the Success rate card when the M3 reporting flag is off', () => {
        mockUseFlag.mockReturnValue(false)

        render(
            <SkillEditorSidePanelPerformanceMetricCards
                {...baseProps}
                metrics={{
                    tickets: 10,
                    prevTickets: 8,
                    handoverTickets: 2,
                    prevHandoverTickets: 1,
                    csat: 4.5,
                    prevCsat: 4.4,
                    resourceSourceSetId: 5,
                }}
            />,
        )

        const labels = screen
            .getAllByTestId('trend-card')
            .map((card) => card.getAttribute('data-label'))

        expect(labels).toEqual(['Tickets', 'Handovers', 'CSAT'])
        expect(labels).not.toContain('Success rate')
    })
})
