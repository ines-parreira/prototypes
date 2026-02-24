import { FeatureFlagKey } from '@repo/feature-flags'
import { screen } from '@testing-library/react'

import { AI_AGENT_OUTCOME_DISPLAY_LABELS } from 'domains/reporting/hooks/automate/types'
import type { GuidanceImpactData } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks'
import { KnowledgeEditorSidePanelGuidance } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

const mockToggleVisibility = jest.fn()
const mockUseGuidanceStore = jest.fn()
const mockDispatch = jest.fn()
const mockUseFlag = jest.fn()
const mockUseGetArticleTranslationIntents = jest.fn(
    (__params?: unknown, __options?: unknown) => ({
        data: {
            intents: [
                {
                    name: 'Order',
                    children: [
                        {
                            name: 'Order/status',
                            intent: 'order-status',
                            is_available: true,
                        },
                    ],
                },
            ],
        },
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
    }),
)
const mockUseGuidanceContext = jest.fn(() => ({
    guidanceArticle: { id: 123, locale: 'en' },
    config: {
        guidanceHelpCenter: { id: 456 },
    },
    state: {
        guidance: {
            publishedVersionId: 789,
            draftVersionId: 790,
        },
    },
    dispatch: mockDispatch,
    playground: {} as any,
}))

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/context',
    () => ({
        useGuidanceContext: () => mockUseGuidanceContext(),
        useGuidanceStore: (selector: (storeState: unknown) => unknown) =>
            mockUseGuidanceStore(selector),
    }),
)

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/hooks',
    () => ({
        useGuidanceImpactFromContext: jest.fn(
            (): GuidanceImpactData => ({
                tickets: { value: 150 },
                handoverTickets: { value: 42 },
                csat: { value: 3.2 },
                intents: ['Billing/Payment', 'Shipping/Inquiry'],
                isLoading: false,
                subtitle: 'Last 28 days',
            }),
        ),
        useGuidanceRecentTicketsFromContext: jest.fn(() => {
            const testDate = new Date('2025-06-17')
            const testDateRange = {
                start_datetime: new Date(
                    Date.now() - 28 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                end_datetime: new Date().toISOString(),
            }
            return {
                ticketCount: 2,
                latest3Tickets: [
                    {
                        id: 1,
                        lastUpdatedDatetime: testDate,
                        title: 'Ticket 1',
                        messageCount: 2,
                        aiAgentOutcome:
                            AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated,
                    },
                    {
                        id: 2,
                        lastUpdatedDatetime: testDate,
                        title: 'Ticket 2',
                        messageCount: 4,
                        aiAgentOutcome:
                            AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover,
                    },
                ],
                resourceSourceId: 123,
                resourceSourceSetId: 456,
                dateRange: testDateRange,
                outcomeCustomFieldId: 789,
                intentCustomFieldId: 101112,
            }
        }),
        useGuidanceDetailsFromContext: jest.fn(() => {
            const testDate = new Date('2025-06-17')
            return {
                aiAgentStatus: {
                    value: true,
                    onChange: mockToggleVisibility,
                },
                createdDatetime: testDate,
                lastUpdatedDatetime: testDate,
                isUpdating: false,
                isDraft: false,
            }
        }),
    }),
)

jest.mock('models/helpCenter/queries', () => ({
    useGetArticleTranslationIntents: (params: unknown, options: unknown) =>
        mockUseGetArticleTranslationIntents(params, options),
}))

jest.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: jest.requireActual('@repo/feature-flags').FeatureFlagKey,
    useFlag: (key: string) => mockUseFlag(key),
}))

describe('KnowledgeEditorSidePanelGuidance', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation(
            (key) => key === FeatureFlagKey.AddLinkedIntentsFromSidepanel,
        )
        mockUseGuidanceStore.mockImplementation((selector) => {
            const contextValue = mockUseGuidanceContext()

            return selector({
                state: contextValue.state,
                config: contextValue.config,
                dispatch: contextValue.dispatch,
                guidanceArticle:
                    contextValue.guidanceArticle ??
                    contextValue.state?.guidance,
                playground: contextValue.playground,
                setConfig: jest.fn(),
                setGuidanceArticle: jest.fn(),
                setPlayground: jest.fn(),
            })
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders all sections when linked intents feature flag is enabled', () => {
        renderWithStoreAndQueryClientAndRouter(
            <KnowledgeEditorSidePanelGuidance />,
        )

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.getByText('Linked intents')).toBeInTheDocument()
        expect(screen.getByText('Impact')).toBeInTheDocument()
        expect(screen.getByText('Recent tickets')).toBeInTheDocument()
    })

    it('does not render linked intents section when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        renderWithStoreAndQueryClientAndRouter(
            <KnowledgeEditorSidePanelGuidance />,
        )

        expect(screen.getByText('Details')).toBeInTheDocument()
        expect(screen.queryByText('Linked intents')).not.toBeInTheDocument()
        expect(screen.getByText('Impact')).toBeInTheDocument()
        expect(screen.getByText('Recent tickets')).toBeInTheDocument()
    })
})
