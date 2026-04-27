import { render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { getGuidanceArticleFixture } from 'pages/aiAgent/fixtures/guidanceArticle.fixture'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore } from 'utils/testing'

import { KnowledgeEditorSkill } from './KnowledgeEditorSkill'

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: () => null,
}))

jest.mock('./modals/SkillDeleteModal', () => ({
    SkillDeleteModal: () => null,
}))
jest.mock('./modals/SkillDisableModal', () => ({
    SkillDisableModal: () => null,
}))
jest.mock('./modals/SkillEnableModal', () => ({
    SkillEnableModal: () => null,
}))
jest.mock('./modals/SkillPublishModal', () => ({
    SkillPublishModal: () => null,
}))
jest.mock('./modals/SkillRestoreVersionModal', () => ({
    SkillRestoreVersionModal: () => null,
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SidePanel: ({
        isOpen,
        children,
    }: {
        isOpen: boolean
        children: React.ReactNode
    }) => (isOpen ? <div>{children}</div> : null),
}))

const mockNotifyError = jest.fn()
jest.mock('./hooks/useSkillNotify', () => ({
    useSkillNotify: jest.fn(() => ({
        error: mockNotifyError,
        success: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenterState: jest.fn(() => ({
        helpCenter: {
            id: 1,
            name: 'FAQ Help Center',
            default_locale: 'en-US',
        },
        isLoading: false,
    })),
}))
const { useAiAgentHelpCenterState } = jest.requireMock(
    'pages/aiAgent/hooks/useAiAgentHelpCenter',
)

const mockUseGuidanceArticle = jest.fn()
jest.mock('pages/aiAgent/hooks/useGuidanceArticle', () => ({
    useGuidanceArticle: (params: any) => mockUseGuidanceArticle(params),
}))

jest.mock('pages/aiAgent/skills/hooks/useSkillsTemplates', () => ({
    useSkillsTemplates: jest.fn(() => ({
        allSkillsTemplates: [],
        availableSkillsTemplates: [],
    })),
}))

jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(() => ({
            guidanceActions: [],
            isLoading: false,
        })),
    }),
)

jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: () => ({
        createGuidanceArticle: jest.fn(),
        updateGuidanceArticle: jest.fn(),
        rebasePublishGuidanceArticle: jest.fn(),
        getGuidanceArticleTranslation: jest.fn(),
        deleteGuidanceArticle: jest.fn(),
    }),
}))

jest.mock('../../PlaygroundPanel/PlaygroundPanel', () => ({
    PlaygroundPanel: ({ onClose }: { onClose: () => void }) => (
        <div>
            <button onClick={onClose}>Close Playground</button>
        </div>
    ),
}))

jest.mock('models/api/types', () => ({
    ...jest.requireActual('models/api/types'),
    isGorgiasApiError: jest.fn(),
}))
const { isGorgiasApiError } = jest.requireMock('models/api/types')

jest.mock('models/helpCenter/queries', () => ({
    ...jest.requireActual('models/helpCenter/queries'),
    useGetArticleTranslationVersion: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
    useGetArticleTranslationVersions: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
    useInfiniteGetArticleTranslationVersions: jest.fn(() => ({
        data: undefined,
        isLoading: false,
        isFetchingNextPage: false,
        hasNextPage: false,
        fetchNextPage: jest.fn(),
    })),
    useListIntents: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
    useGetArticleTranslationIntents: jest.fn(() => ({
        data: undefined,
        isLoading: false,
        isError: false,
        refetch: jest.fn(),
    })),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetUser: () => ({ data: undefined }),
    useGetCurrentUser: () => ({ data: undefined }),
}))

const guidanceArticle = getGuidanceArticleFixture(1)

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

const Wrapper = ({ children }: { children?: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
        <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
)

const defaultProps = {
    shopName: 'Test Shop',
    shopType: 'shopify',
    onClose: jest.fn(),
}

describe('KnowledgeEditorSkill', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
        useAiAgentHelpCenterState.mockReturnValue({
            helpCenter: {
                id: 1,
                name: 'FAQ Help Center',
                default_locale: 'en-US',
            },
            isLoading: false,
        })
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: false,
            isError: false,
            error: null,
        })
    })

    it('renders loading shell while help center is loading', () => {
        useAiAgentHelpCenterState.mockReturnValue({
            helpCenter: null,
            isLoading: true,
        })

        const { container } = render(
            <Wrapper>
                <KnowledgeEditorSkill {...defaultProps} />
            </Wrapper>,
        )

        expect(
            screen.queryByRole('button', { name: /back to skills/i }),
        ).not.toBeInTheDocument()
        expect(
            container.querySelector('.react-loading-skeleton'),
        ).not.toBeNull()
    })

    it('renders loading shell while article is loading', () => {
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: true,
            isError: false,
            error: null,
        })

        const { container } = render(
            <Wrapper>
                <KnowledgeEditorSkill {...defaultProps} skillId="1" />
            </Wrapper>,
        )

        expect(
            screen.queryByRole('button', { name: /back to skills/i }),
        ).not.toBeInTheDocument()
        expect(
            container.querySelector('.react-loading-skeleton'),
        ).not.toBeNull()
    })

    it('renders the editor content when data is loaded', () => {
        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: {
                ...guidanceArticle,
                content: '<div>Skill content</div>',
            },
            isGuidanceArticleLoading: false,
            isError: false,
            error: null,
        })

        render(
            <Wrapper>
                <KnowledgeEditorSkill {...defaultProps} skillId="1" />
            </Wrapper>,
        )

        expect(
            screen.getByDisplayValue(guidanceArticle.title),
        ).toBeInTheDocument()
    })

    it('renders in create mode when skillId is not provided', () => {
        render(
            <Wrapper>
                <KnowledgeEditorSkill {...defaultProps} />
            </Wrapper>,
        )

        expect(
            screen.getByRole('button', { name: /enable/i }),
        ).toBeInTheDocument()
    })

    it('calls onSharedPanelStateChange with playground sidePanelWidth on mount', () => {
        const onSharedPanelStateChange = jest.fn()

        render(
            <Wrapper>
                <KnowledgeEditorSkill
                    {...defaultProps}
                    onSharedPanelStateChange={onSharedPanelStateChange}
                />
            </Wrapper>,
        )

        expect(onSharedPanelStateChange).toHaveBeenCalledWith(
            expect.objectContaining({
                width: expect.any(String),
                onRequestClose: expect.any(Function),
            }),
        )
    })

    it('does not call onSharedPanelStateChange when not provided', () => {
        expect(() => {
            render(
                <Wrapper>
                    <KnowledgeEditorSkill {...defaultProps} />
                </Wrapper>,
            )
        }).not.toThrow()
    })

    it('calls onClose and shows error notification on 404 error', () => {
        const onClose = jest.fn()
        isGorgiasApiError.mockReturnValue(true)

        mockUseGuidanceArticle.mockReturnValue({
            guidanceArticle: undefined,
            isGuidanceArticleLoading: false,
            isError: true,
            error: { response: { status: 404 } },
        })

        render(
            <Wrapper>
                <KnowledgeEditorSkill
                    {...defaultProps}
                    skillId="999"
                    onClose={onClose}
                />
            </Wrapper>,
        )

        expect(mockNotifyError).toHaveBeenCalledWith(
            'This skill is no longer available. It may have been deleted.',
        )
        expect(onClose).toHaveBeenCalled()
    })
})
