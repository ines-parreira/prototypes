import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { getGuidanceArticleFixture } from 'pages/aiAgent/fixtures/guidanceArticle.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import {
    type GuidanceContextConfig,
    KnowledgeEditorGuidanceProvider,
} from './context'
import { KnowledgeEditorGuidanceContent } from './KnowledgeEditorGuidanceContent'

// Mock feature flags
const mockUseFlag = jest.fn()
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    FeatureFlagKey: {
        PerformanceStatsOnIndividualKnowledge:
            'performance_stats_on_individual_knowledge',
    },
    useFlag: (key: string) => mockUseFlag(key),
}))

// Mock resource metrics
const mockUseResourceMetrics = jest.fn()
jest.mock(
    'domains/reporting/models/queryFactories/knowledge/resourceMetrics',
    () => ({
        ...jest.requireActual(
            'domains/reporting/models/queryFactories/knowledge/resourceMetrics',
        ),
        useResourceMetrics: jest.fn((params) => mockUseResourceMetrics(params)),
    }),
)

// Mock useGetGuidancesAvailableActions
jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(() => ({
            guidanceActions: [],
            isLoading: false,
        })),
    }),
)

// Mock guidance variables
jest.mock('pages/aiAgent/components/GuidanceEditor/variables', () => ({
    guidanceVariables: [],
}))

// Mock KnowledgeEditorSidePanelGuidance to capture props
const mockSidePanelGuidance = jest.fn()
jest.mock(
    '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance',
    () => ({
        KnowledgeEditorSidePanelGuidance: (props: any) => {
            mockSidePanelGuidance(props)
            return <div data-testid="side-panel-guidance">Side Panel</div>
        },
    }),
)

// Mock other components
jest.mock('../KnowledgeEditorTopBar/KnowledgeEditorTopBar', () => ({
    KnowledgeEditorTopBar: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="top-bar">{children}</div>
    ),
}))

jest.mock(
    '../KnowledgeEditorTopBar/KnowledgeEditorTopBarGuidanceControls',
    () => ({
        GuidanceToolbarControls: () => (
            <div data-testid="toolbar-controls">Toolbar</div>
        ),
    }),
)

jest.mock('./KnowledgeEditorGuidanceVersionBanner', () => ({
    KnowledgeEditorGuidanceVersionBanner: () => (
        <div data-testid="version-banner">Version Banner</div>
    ),
}))

jest.mock('./edit/KnowledgeEditorGuidanceEditView', () => ({
    KnowledgeEditorGuidanceEditView: () => (
        <div data-testid="edit-view">Edit View</div>
    ),
}))

jest.mock('./read', () => ({
    KnowledgeEditorGuidanceReadView: () => (
        <div data-testid="read-view">Read View</div>
    ),
}))

jest.mock('./modals/KnowledgeEditorGuidanceDeleteModal', () => ({
    KnowledgeEditorGuidanceDeleteModal: () => (
        <div data-testid="delete-modal">Delete Modal</div>
    ),
}))

jest.mock('./modals/KnowledgeEditorGuidanceDiscardDraftModal', () => ({
    KnowledgeEditorGuidanceDiscardDraftModal: () => (
        <div data-testid="discard-modal">Discard Modal</div>
    ),
}))

jest.mock('./modals/KnowledgeEditorGuidanceUnsavedChangesModal', () => ({
    KnowledgeEditorGuidanceUnsavedChangesModal: () => (
        <div data-testid="unsaved-modal">Unsaved Modal</div>
    ),
}))

const guidanceArticle = getGuidanceArticleFixture(1)

const mockGuidanceHelpCenter = {
    id: 1,
    name: 'FAQ Help Center',
    default_locale: 'en-US' as const,
    created_datetime: '2024-01-01T00:00:00Z',
    updated_datetime: '2024-01-01T00:00:00Z',
    deleted_datetime: null,
    uid: 'test-help-center-uid',
    subdomain: 'test',
    deactivated_datetime: null,
    supported_locales: ['en-US' as const],
    favicon_url: null,
    brand_logo_url: null,
    brand_logo_light_url: null,
    search_deactivated_datetime: null,
    powered_by_deactivated_datetime: null,
    algolia_api_key: null,
    algolia_app_id: 'test-app-id',
    algolia_index_name: 'test-index',
    primary_color: '#000000',
    primary_font_family: 'Arial',
    theme: 'default',
    shop_name: null,
    shop_integration_id: null,
    shop_integration: null,
    self_service_deactivated_datetime: null,
    hotswap_session_token: null,
    source: 'manual' as const,
    gaid: null,
    email_integration: null,
    automation_settings_id: null,
    code_snippet_template: '',
    integration_id: null,
    wizard: null,
    type: 'guidance' as const,
    layout: 'default' as const,
    main_embedment_base_url: null,
}

const queryClient = mockQueryClient()

const defaultState = {
    currentUser: fromJS({
        timezone: 'America/New_York',
    }),
    integrations: toImmutable({
        integrations: [],
    }),
    billing: toImmutable({
        products: [],
    }),
}

const store = mockStore(defaultState)

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
)

const baseConfig: GuidanceContextConfig = {
    shopName: 'Test Shop',
    shopType: 'Test Shop Type',
    guidanceHelpCenter: mockGuidanceHelpCenter,
    guidanceArticle,
    guidanceArticles: [],
    initialMode: 'read',
    onClose: jest.fn(),
}

describe('KnowledgeEditorGuidanceContent', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        mockUseFlag.mockReturnValue(false)
        mockUseResourceMetrics.mockReturnValue({
            isLoading: false,
            isError: false,
            data: undefined,
        })
    })

    describe('impact calculation (line 68)', () => {
        it('should pass undefined impact when performance stats flag is disabled (line 68)', () => {
            // Feature flag is disabled
            mockUseFlag.mockImplementation((key: string) => {
                if (
                    key === FeatureFlagKey.PerformanceStatsOnIndividualKnowledge
                ) {
                    return false
                }
                return false
            })

            mockUseResourceMetrics.mockReturnValue({
                isLoading: false,
                isError: false,
                data: {
                    tickets: { value: 156, onClick: undefined },
                    handoverTickets: { value: 12, onClick: undefined },
                    csat: { value: 4.53, onClick: undefined },
                    intents: ['Order/Status', 'Shipping/Inquiry'],
                },
            })

            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider config={baseConfig}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            // Verify side panel is rendered with isDetailsView true (default)
            expect(
                screen.getByTestId('side-panel-guidance'),
            ).toBeInTheDocument()

            // Check that impact is undefined when flag is disabled
            const callArgs = mockSidePanelGuidance.mock.calls[0][0]
            expect(callArgs.impact).toBeUndefined()
        })

        it('should pass impact with data when performance stats flag is enabled (line 68)', () => {
            // Feature flag is enabled
            mockUseFlag.mockImplementation((key: string) => {
                if (
                    key === FeatureFlagKey.PerformanceStatsOnIndividualKnowledge
                ) {
                    return true
                }
                return false
            })

            const mockResourceMetricsData = {
                tickets: { value: 156, onClick: undefined },
                handoverTickets: { value: 12, onClick: undefined },
                csat: { value: 4.53, onClick: undefined },
                intents: ['Order/Status', 'Shipping/Inquiry'],
            }

            mockUseResourceMetrics.mockReturnValue({
                isLoading: false,
                isError: false,
                data: mockResourceMetricsData,
            })

            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider config={baseConfig}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            // Verify side panel is rendered
            expect(
                screen.getByTestId('side-panel-guidance'),
            ).toBeInTheDocument()

            // Check that impact contains the data when flag is enabled
            expect(mockSidePanelGuidance).toHaveBeenCalledWith(
                expect.objectContaining({
                    impact: {
                        tickets: mockResourceMetricsData.tickets,
                        handoverTickets:
                            mockResourceMetricsData.handoverTickets,
                        csat: mockResourceMetricsData.csat,
                        intents: mockResourceMetricsData.intents,
                        isLoading: false,
                    },
                }),
            )
        })

        it('should pass impact with loading state when performance stats flag is enabled and data is loading (line 68)', () => {
            // Feature flag is enabled
            mockUseFlag.mockImplementation((key: string) => {
                if (
                    key === FeatureFlagKey.PerformanceStatsOnIndividualKnowledge
                ) {
                    return true
                }
                return false
            })

            mockUseResourceMetrics.mockReturnValue({
                isLoading: true,
                isError: false,
                data: undefined,
            })

            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider config={baseConfig}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            // Check that impact contains loading state when flag is enabled
            const callArgs = mockSidePanelGuidance.mock.calls[0][0]
            expect(callArgs.impact).toEqual({
                tickets: undefined,
                handoverTickets: undefined,
                csat: undefined,
                intents: undefined,
                isLoading: true,
            })
        })

        it('should pass impact with partial data when performance stats flag is enabled (line 68)', () => {
            // Feature flag is enabled
            mockUseFlag.mockImplementation((key: string) => {
                if (
                    key === FeatureFlagKey.PerformanceStatsOnIndividualKnowledge
                ) {
                    return true
                }
                return false
            })

            // Only partial data available
            const partialData = {
                tickets: { value: 100, onClick: undefined },
                handoverTickets: undefined,
                csat: undefined,
                intents: undefined,
            }

            mockUseResourceMetrics.mockReturnValue({
                isLoading: false,
                isError: false,
                data: partialData,
            })

            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider config={baseConfig}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            // Check that impact contains partial data when flag is enabled
            expect(mockSidePanelGuidance).toHaveBeenCalledWith(
                expect.objectContaining({
                    impact: {
                        tickets: partialData.tickets,
                        handoverTickets: undefined,
                        csat: undefined,
                        intents: undefined,
                        isLoading: false,
                    },
                }),
            )
        })
    })

    describe('useResourceMetrics hook call', () => {
        it('should call useResourceMetrics with correct parameters', () => {
            mockUseFlag.mockReturnValue(true)

            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider config={baseConfig}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    resourceSourceId: guidanceArticle.id,
                    resourceSourceSetId: mockGuidanceHelpCenter.id,
                    timezone: 'America/New_York',
                    enabled: true,
                }),
            )
        })

        it('should disable useResourceMetrics when feature flag is disabled', () => {
            mockUseFlag.mockReturnValue(false)

            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider config={baseConfig}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('should disable useResourceMetrics when guidanceArticle is null', () => {
            mockUseFlag.mockReturnValue(true)

            const configWithoutArticle: GuidanceContextConfig = {
                shopName: 'Test Shop',
                shopType: 'Test Shop Type',
                guidanceHelpCenter: mockGuidanceHelpCenter,
                guidanceArticle: undefined,
                guidanceArticles: [],
                initialMode: 'create',
                onClose: jest.fn(),
            }

            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider
                        config={configWithoutArticle}
                    >
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    enabled: false,
                }),
            )
        })

        it('should use guidanceHelpCenter.id when available', () => {
            mockUseFlag.mockReturnValue(true)

            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider config={baseConfig}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            expect(mockUseResourceMetrics).toHaveBeenCalledWith(
                expect.objectContaining({
                    resourceSourceSetId: mockGuidanceHelpCenter.id,
                }),
            )
        })
    })

    describe('rendering different modes', () => {
        it('should render read view when in read mode', () => {
            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider config={baseConfig}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            expect(screen.getByTestId('read-view')).toBeInTheDocument()
            expect(screen.queryByTestId('edit-view')).not.toBeInTheDocument()
        })

        it('should render edit view when in edit mode', () => {
            const editConfig: GuidanceContextConfig = {
                ...baseConfig,
                initialMode: 'edit',
            }

            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider config={editConfig}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            expect(screen.getByTestId('edit-view')).toBeInTheDocument()
            expect(screen.queryByTestId('read-view')).not.toBeInTheDocument()
        })

        it('should render edit view when in create mode', () => {
            const createConfig: GuidanceContextConfig = {
                ...baseConfig,
                guidanceArticle: undefined,
                initialMode: 'create',
            }

            const closeHandlerRef = { current: null }

            render(
                <Wrapper>
                    <KnowledgeEditorGuidanceProvider config={createConfig}>
                        <KnowledgeEditorGuidanceContent
                            closeHandlerRef={closeHandlerRef}
                        />
                    </KnowledgeEditorGuidanceProvider>
                </Wrapper>,
            )

            expect(screen.getByTestId('edit-view')).toBeInTheDocument()
            expect(screen.queryByTestId('read-view')).not.toBeInTheDocument()
        })
    })
})
