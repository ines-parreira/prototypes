import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { getGuidanceArticleFixture } from 'pages/aiAgent/fixtures/guidanceArticle.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import { KnowledgeEditorGuidanceProvider } from './context'
import type { GuidanceContextConfig } from './context'
import { KnowledgeEditorGuidanceContent } from './KnowledgeEditorGuidanceContent'

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

// Mock KnowledgeEditorSidePanelGuidance - no longer receives props, fetches data via hooks
jest.mock(
    '../KnowledgeEditorSidePanel/KnowledgeEditorSidePanelGuidance/KnowledgeEditorSidePanelGuidance',
    () => ({
        KnowledgeEditorSidePanelGuidance: () => (
            <div data-testid="side-panel-guidance">Side Panel</div>
        ),
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

jest.mock('./diff/KnowledgeEditorGuidanceDiffView', () => ({
    KnowledgeEditorGuidanceDiffView: () => (
        <div data-testid="diff-view">Diff View</div>
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
    })

    describe('side panel rendering', () => {
        it('should render side panel when isDetailsView is true (default)', () => {
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

            expect(
                screen.getByTestId('side-panel-guidance'),
            ).toBeInTheDocument()
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

        it('should not render diff view in read mode', () => {
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

            expect(screen.queryByTestId('diff-view')).not.toBeInTheDocument()
        })

        it('should not render diff view in edit mode', () => {
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

            expect(screen.queryByTestId('diff-view')).not.toBeInTheDocument()
        })

        it('should not render diff view in create mode', () => {
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

            expect(screen.queryByTestId('diff-view')).not.toBeInTheDocument()
        })
    })
})
