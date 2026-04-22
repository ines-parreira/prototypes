import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useSkillEditorStore } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/context'
import { KnowledgeType } from 'pages/aiAgent/KnowledgeHub/types'
import { useKnowledgeDrillDownTrigger } from 'pages/aiAgent/skills/hooks/useKnowledgeDrillDownTrigger'

import type { TopSupportingKnowledge } from '../hooks/useSkillTopKnowledges'
import { SkillEditorSidePanelTopKnowledgeSection } from './SkillEditorSidePanelTopKnowledgeSection'

jest.mock('pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip', () => ({
    TruncatedTextWithTooltip: ({ children }: { children: React.ReactNode }) =>
        children,
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/context',
    () => ({ useSkillEditorStore: jest.fn() }),
)

jest.mock('pages/aiAgent/skills/hooks/useKnowledgeDrillDownTrigger', () => ({
    useKnowledgeDrillDownTrigger: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            knowledgeArticle: (type: string, id: number) =>
                `/knowledge/${type}/${id}`,
        },
    })),
}))

jest.mock('@repo/reporting', () => ({
    DrillDownModalTrigger: ({
        children,
        tooltipText,
        openDrillDownModal,
        enabled,
    }: {
        children: React.ReactNode
        tooltipText: React.ReactNode
        openDrillDownModal: () => void
        enabled: boolean
    }) => (
        <div>
            <span>{tooltipText}</span>
            <span onClick={enabled ? openDrillDownModal : undefined}>
                {children}
            </span>
        </div>
    ),
}))

const mockUseSkillEditorStore = useSkillEditorStore as jest.Mock
const mockUseKnowledgeDrillDownTrigger =
    useKnowledgeDrillDownTrigger as jest.Mock
const mockOpenDrillDownModal = jest.fn()

const defaultDateRange = {
    start_datetime: '2024-01-01T00:00:00Z',
    end_datetime: '2024-01-28T23:59:59Z',
}

const makeKnowledge = (
    overrides: Partial<TopSupportingKnowledge> = {},
): TopSupportingKnowledge => ({
    id: '1',
    type: KnowledgeType.FAQ,
    title: 'How to track my order',
    lastUpdatedAt: '2024-01-01T00:00:00Z',
    tickets: 5,
    resourceSourceSetId: 11,
    coUsedTicketIds: ['T1', 'T2'],
    ...overrides,
})

const baseKnowledges: TopSupportingKnowledge[] = [
    makeKnowledge({ id: '1', title: 'How to track my order', tickets: 10 }),
    makeKnowledge({ id: '2', title: 'Cancel my order', tickets: 7 }),
    makeKnowledge({ id: '3', title: 'Refund policy', tickets: 3 }),
]

describe('SkillEditorSidePanelTopKnowledgeSection', () => {
    beforeEach(() => {
        mockUseSkillEditorStore.mockImplementation((selector: any) =>
            selector({
                config: {
                    shopName: 'my-shop',
                    helpCenter: { shop_integration_id: 999 },
                },
            }),
        )
        mockUseKnowledgeDrillDownTrigger.mockReturnValue({
            openDrillDownModal: mockOpenDrillDownModal,
        })
    })

    afterEach(() => jest.clearAllMocks())

    describe('heading', () => {
        it('renders "Top knowledge used" heading', () => {
            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={baseKnowledges}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            expect(screen.getByText('Top knowledge used')).toBeInTheDocument()
        })

        it('renders "Last 28 days" subtitle', () => {
            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={baseKnowledges}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            expect(screen.getByText('Last 28 days')).toBeInTheDocument()
        })
    })

    describe('loading state', () => {
        it('shows 3 skeleton cards while loading', () => {
            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={[]}
                    isLoading={true}
                    dateRange={defaultDateRange}
                />,
            )

            expect(
                screen.getAllByLabelText('Loading').length,
            ).toBeGreaterThanOrEqual(3)
        })

        it('does not render knowledge titles while loading', () => {
            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={[]}
                    isLoading={true}
                    dateRange={defaultDateRange}
                />,
            )

            expect(
                screen.queryByText('How to track my order'),
            ).not.toBeInTheDocument()
        })
    })

    describe('loaded state', () => {
        it('renders all knowledge titles', () => {
            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={baseKnowledges}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            expect(
                screen.getByText('How to track my order'),
            ).toBeInTheDocument()
            expect(screen.getByText('Cancel my order')).toBeInTheDocument()
            expect(screen.getByText('Refund policy')).toBeInTheDocument()
        })

        it('renders ticket counts for each knowledge card', () => {
            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={baseKnowledges}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            expect(screen.getByText('10')).toBeInTheDocument()
            expect(screen.getByText('7')).toBeInTheDocument()
            expect(screen.getByText('3')).toBeInTheDocument()
        })

        it('renders an empty list when topKnowledges is empty', () => {
            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={[]}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            expect(
                screen.queryByText('How to track my order'),
            ).not.toBeInTheDocument()
            expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument()
        })

        it('uses singular "ticket" in tooltip for count of 1', () => {
            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={[makeKnowledge({ tickets: 1 })]}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            expect(screen.getByText('1 ticket')).toBeInTheDocument()
        })

        it('uses plural "tickets" in tooltip for count > 1', () => {
            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={[makeKnowledge({ tickets: 5 })]}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            expect(screen.getByText('5 tickets')).toBeInTheDocument()
        })
    })

    describe('navigation', () => {
        it('opens a new tab to the knowledge article when title is clicked', async () => {
            const user = userEvent.setup()
            const openSpy = jest
                .spyOn(window, 'open')
                .mockImplementation(() => null)

            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={[
                        makeKnowledge({ id: '42', type: KnowledgeType.FAQ }),
                    ]}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            await user.click(screen.getByText('How to track my order'))

            expect(openSpy).toHaveBeenCalledWith(
                '/knowledge/faq/42',
                '_blank',
                'noopener,noreferrer',
            )

            openSpy.mockRestore()
        })
    })

    describe('drill-down modal', () => {
        it('calls openDrillDownModal when ticket count is clicked', async () => {
            const user = userEvent.setup()

            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={[makeKnowledge({ tickets: 5 })]}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            await user.click(screen.getByText('5'))

            expect(mockOpenDrillDownModal).toHaveBeenCalled()
        })

        it('does not call openDrillDownModal when ticket count is 0', async () => {
            const user = userEvent.setup()

            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={[makeKnowledge({ tickets: 0 })]}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            await user.click(screen.getByText('0'))

            expect(mockOpenDrillDownModal).not.toHaveBeenCalled()
        })

        it('passes coUsedTicketIds to useKnowledgeDrillDownTrigger', () => {
            render(
                <SkillEditorSidePanelTopKnowledgeSection
                    topKnowledges={[
                        makeKnowledge({
                            id: '1',
                            coUsedTicketIds: ['T10', 'T20'],
                        }),
                    ]}
                    isLoading={false}
                    dateRange={defaultDateRange}
                />,
            )

            expect(mockUseKnowledgeDrillDownTrigger).toHaveBeenCalledWith(
                expect.objectContaining({ ticketIds: ['T10', 'T20'] }),
            )
        })
    })
})
