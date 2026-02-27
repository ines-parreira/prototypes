import { render, screen } from '@testing-library/react'

import {
    useArticleEngagementFromContext,
    useArticleImpactFromContext,
    useArticleRecentTicketsFromContext,
} from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks'

import { KnowledgeEditorSidePanelHelpCenterArticle } from './KnowledgeEditorSidePanelHelpCenterArticle'

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/context',
    () => ({
        useArticleContext: jest.fn(() => ({
            state: {
                article: {
                    id: 123,
                    translation: {
                        published_version_id: 789,
                        draft_version_id: 790,
                    },
                },
                currentLocale: 'en',
                articleMode: 'edit',
            },
            config: {
                helpCenter: { id: 456 },
            },
        })),
    }),
)

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorHelpCenterArticle/hooks',
    () => ({
        useArticleImpactFromContext: jest.fn(),
        useArticleEngagementFromContext: jest.fn(),
        useArticleRecentTicketsFromContext: jest.fn(),
    }),
)

jest.mock('../KnowledgeEditorSidePanel', () => ({
    KnowledgeEditorSidePanel: ({
        children,
        initialExpandedSections,
        footer,
    }: {
        children: React.ReactNode
        initialExpandedSections: string[]
        footer?: React.ReactNode
    }) => (
        <div data-testid="knowledge-editor-side-panel">
            <div data-testid="initial-expanded-sections">
                {initialExpandedSections.join(',')}
            </div>
            {children}
            {footer && <div data-testid="footer">{footer}</div>}
        </div>
    ),
}))

jest.mock('../KnowledgeEditorSidePanelSectionImpact', () => ({
    KnowledgeEditorSidePanelSectionImpact: ({
        sectionId,
    }: {
        sectionId: string
    }) => <div data-testid={`section-${sectionId}`}>Impact Section</div>,
}))

jest.mock('../KnowledgeEditorSidePanelSectionRecentTickets', () => ({
    KnowledgeEditorSidePanelSectionRecentTickets: ({
        sectionId,
    }: {
        sectionId: string
    }) => (
        <div data-testid={`section-${sectionId}`}>Recent Tickets Section</div>
    ),
}))

jest.mock('./KnowledgeEditorSidePanelSectionHelpCenterArticleDetails', () => ({
    KnowledgeEditorSidePanelSectionHelpCenterArticleDetails: ({
        sectionId,
    }: {
        sectionId: string
    }) => <div data-testid={`section-${sectionId}`}>Details Section</div>,
}))

jest.mock(
    './KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement',
    () => ({
        KnowledgeEditorSidePanelSectionHelpCenterArticleEngagement: ({
            sectionId,
        }: {
            sectionId: string
        }) => (
            <div data-testid={`section-${sectionId}`}>Engagement Section</div>
        ),
    }),
)

jest.mock('./KnowledgeEditorSidePanelSectionHelpCenterArticleSettings', () => ({
    KnowledgeEditorSidePanelSectionHelpCenterArticleSettings: ({
        sectionId,
    }: {
        sectionId: string
    }) => <div data-testid={`section-${sectionId}`}>Settings Section</div>,
}))

const mockUseArticleImpactFromContext =
    useArticleImpactFromContext as jest.MockedFunction<
        typeof useArticleImpactFromContext
    >
const mockUseArticleEngagementFromContext =
    useArticleEngagementFromContext as jest.MockedFunction<
        typeof useArticleEngagementFromContext
    >
const mockUseArticleRecentTicketsFromContext =
    useArticleRecentTicketsFromContext as jest.MockedFunction<
        typeof useArticleRecentTicketsFromContext
    >

describe('KnowledgeEditorSidePanelHelpCenterArticle', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseArticleImpactFromContext.mockReturnValue({
            tickets: undefined,
            handoverTickets: undefined,
            csat: undefined,
            intents: undefined,
            isLoading: false,
            subtitle: 'Last 28 days',
        })
        mockUseArticleEngagementFromContext.mockReturnValue({
            views: undefined,
            rating: undefined,
            reactions: undefined,
            isLoading: false,
            subtitle: 'Last 28 days',
        })
        mockUseArticleRecentTicketsFromContext.mockReturnValue(undefined)
    })

    it('renders all performance sections', () => {
        mockUseArticleImpactFromContext.mockReturnValue({
            tickets: { value: 10 },
            handoverTickets: { value: 2 },
            csat: { value: 0.8 },
            intents: ['intent1', 'intent2'],
            isLoading: false,
            subtitle: 'Last 28 days',
        })
        mockUseArticleEngagementFromContext.mockReturnValue({
            views: 100,
            rating: 0.9,
            reactions: { up: 90, down: 10 },
            isLoading: false,
            subtitle: 'Last 28 days',
        })
        mockUseArticleRecentTicketsFromContext.mockReturnValue({
            ticketCount: 10,
            latest3Tickets: [],
            resourceSourceId: 123,
            resourceSourceSetId: 456,
            dateRange: {
                start_datetime: '2024-01-01',
                end_datetime: '2024-01-28',
            },
            outcomeCustomFieldId: 789,
            intentCustomFieldId: 101112,
            isLoading: false,
        })

        render(<KnowledgeEditorSidePanelHelpCenterArticle />)

        expect(screen.getByTestId('section-details')).toBeInTheDocument()
        expect(screen.getByTestId('section-impact')).toBeInTheDocument()
        expect(screen.getByTestId('section-recentTickets')).toBeInTheDocument()
        expect(screen.getByTestId('section-engagement')).toBeInTheDocument()
        expect(screen.getByTestId('section-settings')).toBeInTheDocument()
    })

    it('sets all performance sections as initially expanded', () => {
        render(<KnowledgeEditorSidePanelHelpCenterArticle />)

        expect(
            screen.getByTestId('initial-expanded-sections'),
        ).toHaveTextContent('details,impact,engagement,recentTickets,settings')
    })

    it('renders performance sections even when hooks return undefined', () => {
        render(<KnowledgeEditorSidePanelHelpCenterArticle />)

        expect(screen.getByTestId('section-details')).toBeInTheDocument()
        expect(screen.getByTestId('section-impact')).toBeInTheDocument()
        expect(screen.getByTestId('section-recentTickets')).toBeInTheDocument()
        expect(screen.getByTestId('section-engagement')).toBeInTheDocument()
        expect(screen.getByTestId('section-settings')).toBeInTheDocument()
    })
})
