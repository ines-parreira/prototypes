import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import moment from 'moment-timezone'

import { useSkillPerformanceFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import { useSkillPerformanceTrendExport } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceTrendExport'

import { SkillPerformanceTrendModal } from './SkillPerformanceTrendModal'

Element.prototype.getAnimations = jest.fn(() => [])

const mockSkillPerformanceChart = jest.fn(() => (
    <div data-testid="skill-performance-chart">chart</div>
))

jest.mock('./SkillPerformanceChart', () => ({
    SkillPerformanceChart: () => mockSkillPerformanceChart(),
}))

const mockSkillPerformanceKpiCards = jest.fn(() => (
    <div data-testid="skill-performance-kpi-cards">kpi cards</div>
))

jest.mock('./SkillPerformanceKpiCards', () => ({
    SkillPerformanceKpiCards: () => mockSkillPerformanceKpiCards(),
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext',
    () => ({
        useSkillPerformanceFromContext: jest.fn(() => ({
            skillMetrics: {},
            recentTickets: undefined,
        })),
        SkillPerformanceDataProvider: ({
            children,
        }: {
            children: React.ReactNode
        }) => <>{children}</>,
    }),
)

type MockDashboardExportButtonProps = {
    useCsvExport: unknown
    pdfFileName?: string
    contentRef: { current: HTMLElement | null }
    size?: string
}

const mockDashboardExportButton = jest.fn(
    (__props: MockDashboardExportButtonProps) => (
        <div data-testid="dashboard-export-button">Export</div>
    ),
)

jest.mock('@repo/reporting', () => ({
    DashboardExportButton: (props: MockDashboardExportButtonProps) =>
        mockDashboardExportButton(props),
}))

describe('SkillPerformanceTrendModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the modal heading and chart when open', () => {
        render(
            <SkillPerformanceTrendModal
                isOpen={true}
                onOpenChange={jest.fn()}
            />,
        )

        expect(screen.getByText('Skill performance')).toBeInTheDocument()
        expect(
            screen.getByTestId('skill-performance-chart'),
        ).toBeInTheDocument()
    })

    it('does not render the chart when the modal is closed', () => {
        render(
            <SkillPerformanceTrendModal
                isOpen={false}
                onOpenChange={jest.fn()}
            />,
        )

        expect(screen.queryByText('Skill performance')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('skill-performance-chart'),
        ).not.toBeInTheDocument()
    })

    it('invokes onOpenChange when the modal close button is activated', async () => {
        const user = userEvent.setup()
        const onOpenChange = jest.fn()

        render(
            <SkillPerformanceTrendModal
                isOpen={true}
                onOpenChange={onOpenChange}
            />,
        )

        await act(async () => {
            await user.click(screen.getByRole('button', { name: /close/i }))
        })

        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('opens with the Last 28 days preset as the date picker label', () => {
        render(
            <SkillPerformanceTrendModal
                isOpen={true}
                onOpenChange={jest.fn()}
            />,
        )

        expect(screen.getByText('Last 28 days')).toBeInTheDocument()
    })

    it('passes a 28-day local-tz dateRangeOverride to useSkillPerformanceFromContext', () => {
        const mockUseSkillPerformanceFromContext =
            useSkillPerformanceFromContext as jest.Mock

        render(
            <SkillPerformanceTrendModal
                isOpen={true}
                onOpenChange={jest.fn()}
            />,
        )

        const call = mockUseSkillPerformanceFromContext.mock.calls.at(-1)
        const override = call?.[0]?.dateRangeOverride
        expect(override).toBeDefined()

        const expectedStart = moment()
            .subtract(28, 'days')
            .startOf('day')
            .format()
        const expectedEnd = moment().endOf('day').format()
        expect(override.start_datetime).toBe(expectedStart)
        expect(override.end_datetime).toBe(expectedEnd)
    })

    it('wires the DashboardExportButton with the trend CSV hook and a PDF filename', () => {
        render(
            <SkillPerformanceTrendModal
                isOpen={true}
                onOpenChange={jest.fn()}
            />,
        )

        const props = mockDashboardExportButton.mock.calls.at(-1)?.[0]
        expect(props).toBeDefined()
        expect(props?.useCsvExport).toBe(useSkillPerformanceTrendExport)
        expect(props?.pdfFileName).toBe('skill-performance-trend')
        expect(props?.contentRef).toBeDefined()
    })
})
