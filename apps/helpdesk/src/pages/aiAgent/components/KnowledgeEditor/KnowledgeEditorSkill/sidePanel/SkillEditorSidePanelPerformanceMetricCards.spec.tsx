import { render, screen } from '@testing-library/react'

import { SkillEditorSidePanelPerformanceMetricCards } from './SkillEditorSidePanelPerformanceMetricCards'

jest.mock(
    'pages/aiAgent/skills/components/SharedTableComponents/MetricCells',
    () => ({
        MetricCell: ({ displayValue }: { displayValue: string }) => (
            <span>{displayValue}</span>
        ),
    }),
)

const baseProps = {
    metrics: null,
    isLoading: false,
    resourceSourceId: 1,
    shopIntegrationId: 999,
    dateRange: { start_datetime: '2024-01-01', end_datetime: '2024-01-28' },
    totalAiAgentTickets: 100,
}

describe('SkillEditorSidePanelPerformanceMetricCards', () => {
    describe('Ticket volume card', () => {
        it('shows "--" when tickets is null', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards {...baseProps} />,
            )

            expect(screen.getAllByRole('heading')[0]).toHaveTextContent('--')
        })

        it('shows percentage via MetricCell when tickets has a value', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    metrics={{
                        tickets: 50,
                        handoverTickets: null,
                        csat: null,
                        resourceSourceSetId: 0,
                    }}
                    totalAiAgentTickets={100}
                />,
            )

            expect(screen.getAllByText('50%').length).toBeGreaterThanOrEqual(1)
        })

        it('does not show percentage when tickets is null', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards {...baseProps} />,
            )

            expect(screen.queryByText(/%/)).not.toBeInTheDocument()
        })

        it('shows skeleton while loading', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    isLoading
                />,
            )

            expect(screen.queryAllByRole('heading')).toHaveLength(0)
        })
    })

    describe('Handover tickets card', () => {
        it('shows "--" when handoverTickets is null', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards {...baseProps} />,
            )

            expect(screen.getAllByRole('heading')[1]).toHaveTextContent('--')
        })

        it('shows count via MetricCell when handoverTickets has a value', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    metrics={{
                        tickets: null,
                        handoverTickets: 7,
                        csat: null,
                        resourceSourceSetId: 0,
                    }}
                />,
            )

            expect(screen.getByText('7')).toBeInTheDocument()
        })

        it('shows heading with count when dateRange is undefined', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    metrics={{
                        tickets: null,
                        handoverTickets: 7,
                        csat: null,
                        resourceSourceSetId: 0,
                    }}
                    dateRange={undefined}
                />,
            )

            expect(
                screen.getByRole('heading', { name: '7' }),
            ).toBeInTheDocument()
        })

        it('shows skeleton while loading', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    isLoading
                />,
            )

            expect(screen.queryAllByRole('heading')).toHaveLength(0)
        })
    })

    describe('Average CSAT card', () => {
        it('shows "--" when csat is null', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards {...baseProps} />,
            )

            expect(screen.getAllByRole('heading')[2]).toHaveTextContent('--')
        })

        it('shows formatted integer via MetricCell when csat is an integer', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    metrics={{
                        tickets: null,
                        handoverTickets: null,
                        csat: 4,
                        resourceSourceSetId: 0,
                    }}
                />,
            )

            expect(screen.getByText('4')).toBeInTheDocument()
        })

        it('shows one decimal place via MetricCell when csat is a float', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    metrics={{
                        tickets: null,
                        handoverTickets: null,
                        csat: 4.5,
                        resourceSourceSetId: 0,
                    }}
                />,
            )

            expect(screen.getByText('4.5')).toBeInTheDocument()
        })

        it('shows heading with value when dateRange is undefined', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    metrics={{
                        tickets: null,
                        handoverTickets: null,
                        csat: 4.5,
                        resourceSourceSetId: 0,
                    }}
                    dateRange={undefined}
                />,
            )

            expect(
                screen.getByRole('heading', { name: '4.5' }),
            ).toBeInTheDocument()
        })

        it('shows skeleton while loading', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    isLoading
                />,
            )

            expect(screen.queryAllByRole('heading')).toHaveLength(0)
        })
    })

    describe('Percentage calculation', () => {
        it('displays "50%" when tickets=50 and totalAiAgentTickets=100', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    metrics={{
                        tickets: 50,
                        handoverTickets: null,
                        csat: null,
                        resourceSourceSetId: 0,
                    }}
                    totalAiAgentTickets={100}
                />,
            )

            expect(screen.getAllByText('50%').length).toBeGreaterThanOrEqual(1)
        })

        it('displays "0%" when totalAiAgentTickets is 0', () => {
            render(
                <SkillEditorSidePanelPerformanceMetricCards
                    {...baseProps}
                    metrics={{
                        tickets: 50,
                        handoverTickets: null,
                        csat: null,
                        resourceSourceSetId: 0,
                    }}
                    totalAiAgentTickets={0}
                />,
            )

            expect(screen.getAllByText('0%').length).toBeGreaterThanOrEqual(1)
        })
    })
})
