import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import { useSkillPerformanceFromContext } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import { SkillEditorSidePanelRecentTicketsSection } from './SkillEditorSidePanelRecentTicketsSection'

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelSection',
    () => ({
        KnowledgeEditorSidePanelSection: ({
            children,
            header,
            bottomElement,
        }: {
            children: React.ReactNode
            header: { title: React.ReactNode }
            bottomElement?: React.ReactNode
        }) => (
            <div>
                <div>{header.title}</div>
                {children}
                {bottomElement}
            </div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/hooks/useSkillPerformanceFromContext',
    () => ({ useSkillPerformanceFromContext: jest.fn() }),
)

jest.mock('pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip', () => ({
    TruncatedTextWithTooltip: ({ children }: { children: React.ReactNode }) =>
        children,
}))

jest.mock('pages/common/components/RelativeTime', () => ({
    __esModule: true,
    default: () => <span>1 hour ago</span>,
}))

const mockUseSkillPerformanceFromContext =
    useSkillPerformanceFromContext as jest.Mock

const testDateRange = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-28T23:59:59Z',
}

const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

const baseTickets = [
    {
        id: 1,
        title: 'Order tracking issue',
        lastUpdatedDatetime: oneHourAgo,
        messageCount: 2,
        aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
    },
    {
        id: 2,
        title: 'Cancel my order',
        lastUpdatedDatetime: oneHourAgo,
        messageCount: 1,
        aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover,
    },
    {
        id: 3,
        title: 'Refund request',
        lastUpdatedDatetime: oneHourAgo,
        messageCount: 3,
        aiAgentOutcome: AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
    },
]

const baseRecentTickets = {
    ticketCount: 3,
    latest3Tickets: baseTickets,
    isLoading: false,
    resourceSourceId: 42,
    resourceSourceSetId: 100,
    shopIntegrationId: 999,
    dateRange: testDateRange,
}

const renderComponent = (
    recentTicketsOverrides: Partial<typeof baseRecentTickets> | null = {},
    isPreview = false,
) => {
    mockUseSkillPerformanceFromContext.mockReturnValue({
        recentTickets:
            recentTicketsOverrides === null
                ? undefined
                : { ...baseRecentTickets, ...recentTicketsOverrides },
        skillMetrics: { metrics: null, isLoading: false },
        isPreview,
    })
    return renderWithStoreAndQueryClientAndRouter(
        <SkillEditorSidePanelRecentTicketsSection sectionId="recent-tickets" />,
    )
}

describe('SkillEditorSidePanelRecentTicketsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when recentTickets is undefined', () => {
        it('renders nothing when recentTickets is not available', () => {
            const { container } = renderComponent(null)

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('empty state', () => {
        it('renders nothing when not loading and latest3Tickets is undefined', () => {
            const { container } = renderComponent({
                latest3Tickets: undefined,
                isLoading: false,
            })

            expect(container).toBeEmptyDOMElement()
        })

        it('renders nothing when not loading and latest3Tickets is empty', () => {
            const { container } = renderComponent({
                latest3Tickets: [],
                isLoading: false,
            })

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('loading state', () => {
        it('shows "Recent tickets" heading while loading', () => {
            renderComponent({ isLoading: true, latest3Tickets: undefined })

            expect(screen.getByText('Recent tickets')).toBeInTheDocument()
        })

        it('shows skeleton for ticket count while loading', () => {
            renderComponent({ isLoading: true, latest3Tickets: undefined })

            expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(
                0,
            )
        })

        it('shows 3 ticket card skeletons while loading', () => {
            renderComponent({ isLoading: true, latest3Tickets: undefined })

            expect(
                screen.getAllByLabelText('Loading').length,
            ).toBeGreaterThanOrEqual(3)
        })
    })

    describe('loaded state', () => {
        it('shows "Recent tickets" heading with ticket count', () => {
            renderComponent()

            expect(screen.getByText('Recent tickets')).toBeInTheDocument()
            expect(screen.getByText('3')).toBeInTheDocument()
        })

        it('renders all ticket titles', () => {
            renderComponent()

            expect(screen.getByText('Order tracking issue')).toBeInTheDocument()
            expect(screen.getByText('Cancel my order')).toBeInTheDocument()
            expect(screen.getByText('Refund request')).toBeInTheDocument()
        })

        it('shows Automated tag for automated tickets', () => {
            renderComponent()

            expect(
                screen.getAllByText(AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated)
                    .length,
            ).toBeGreaterThanOrEqual(1)
        })

        it('shows Handover tag for handover tickets', () => {
            renderComponent()

            expect(
                screen.getByText(AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover),
            ).toBeInTheDocument()
        })

        it('shows message count with correct label for singular', () => {
            renderComponent({
                latest3Tickets: [
                    {
                        ...baseTickets[0],
                        messageCount: 1,
                    },
                ],
                ticketCount: 1,
            })

            expect(screen.getByText('1 message')).toBeInTheDocument()
        })

        it('shows message count with correct label for plural', () => {
            renderComponent({
                latest3Tickets: [
                    {
                        ...baseTickets[0],
                        messageCount: 3,
                    },
                ],
                ticketCount: 1,
            })

            expect(screen.getByText('3 messages')).toBeInTheDocument()
        })
    })

    describe('View more button', () => {
        it('shows "View more" when ticketCount > 3 and all required props are present', () => {
            renderComponent({ ticketCount: 4 })

            expect(
                screen.getByRole('button', { name: 'View more' }),
            ).toBeInTheDocument()
        })

        it('does not show "View more" when ticketCount is exactly 3', () => {
            renderComponent({ ticketCount: 3 })

            expect(
                screen.queryByRole('button', { name: 'View more' }),
            ).not.toBeInTheDocument()
        })

        it('does not show "View more" when dateRange is undefined', () => {
            renderComponent({ ticketCount: 4, dateRange: undefined })

            expect(
                screen.queryByRole('button', { name: 'View more' }),
            ).not.toBeInTheDocument()
        })

        it('does not show "View more" when resourceSourceId is undefined', () => {
            renderComponent({ ticketCount: 4, resourceSourceId: undefined })

            expect(
                screen.queryByRole('button', { name: 'View more' }),
            ).not.toBeInTheDocument()
        })

        it('does not show "View more" when resourceSourceSetId is undefined', () => {
            renderComponent({ ticketCount: 4, resourceSourceSetId: undefined })

            expect(
                screen.queryByRole('button', { name: 'View more' }),
            ).not.toBeInTheDocument()
        })

        it('dispatches setMetricData when "View more" is clicked', async () => {
            const user = userEvent.setup()
            const { store } = renderComponent({ ticketCount: 4 })

            await user.click(screen.getByRole('button', { name: 'View more' }))

            const actions = store.getActions()
            expect(actions).toContainEqual(
                setMetricData({
                    metricName: KnowledgeMetric.Tickets,
                    title: 'Recent tickets',
                    resourceSourceId: 42,
                    resourceSourceSetId: 100,
                    shopIntegrationId: 999,
                    dateRange: testDateRange,
                    outcomeCustomFieldId: undefined,
                    intentCustomFieldId: undefined,
                }),
            )
        })
    })

    describe('ticket click', () => {
        it('opens ticket in a new tab when clicking a ticket card', async () => {
            const user = userEvent.setup()
            const openSpy = jest
                .spyOn(window, 'open')
                .mockImplementation(() => null)

            renderComponent()

            await user.click(screen.getByText('Order tracking issue'))

            expect(openSpy).toHaveBeenCalledWith(
                '/app/ticket/1',
                '_blank',
                'noopener,noreferrer',
            )

            openSpy.mockRestore()
        })
    })
})
