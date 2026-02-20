import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ArticleTranslationVersion } from '../KnowledgeEditorGuidance/context'
import { GuidanceToolbarControls } from './KnowledgeEditorTopBarGuidanceControls'
import type {
    GuidanceToolbarActions,
    GuidanceToolbarState,
} from './useGuidanceToolbar'

jest.mock('./useGuidanceToolbar')
jest.mock('../KnowledgeEditorGuidance/context')
jest.mock('../KnowledgeEditorGuidance/hooks/useVersionHistory')
jest.mock('../shared/VersionHistoryButton', () => ({
    VersionHistoryButton: ({
        isDisabled,
        versions,
    }: {
        isDisabled: boolean
        versions: ArticleTranslationVersion[]
    }) => (
        <button disabled={isDisabled} aria-label="version history">
            Version History ({versions.length})
        </button>
    ),
}))
jest.mock('./KnowledgeEditorTopBarCommonControls', () => ({
    DeleteButton: ({
        disabled,
        onDelete,
    }: {
        disabled: boolean
        onDelete?: () => void
    }) => (
        <button disabled={disabled} onClick={onDelete} aria-label="delete">
            Delete
        </button>
    ),
    DeleteDraftButton: ({
        disabled,
        onDelete,
    }: {
        disabled: boolean
        onDelete?: () => void
    }) => <button disabled={disabled} onClick={onDelete} aria-label="Delete" />,
    EditIconButton: ({
        disabled,
        onEdit,
    }: {
        disabled: boolean
        onEdit?: () => void
    }) => (
        <button disabled={disabled} onClick={onEdit} aria-label="edit">
            Edit
        </button>
    ),
    TestButton: ({
        disabled,
        onTest,
    }: {
        disabled: boolean
        onTest?: () => void
    }) => (
        <button disabled={disabled} onClick={onTest} aria-label="test">
            Test
        </button>
    ),
}))

const mockUseGuidanceToolbar = jest.requireMock('./useGuidanceToolbar')
    .useGuidanceToolbar as jest.Mock
const mockUseGuidanceContext = jest.requireMock(
    '../KnowledgeEditorGuidance/context',
).useGuidanceContext as jest.Mock
const mockUseGuidanceStore = jest.requireMock(
    '../KnowledgeEditorGuidance/context',
).useGuidanceStore as jest.Mock
const mockUseVersionHistory = jest.requireMock(
    '../KnowledgeEditorGuidance/hooks/useVersionHistory',
).useVersionHistory as jest.Mock

const renderComponent = () => {
    return render(<GuidanceToolbarControls />)
}

const mockActions: GuidanceToolbarActions = {
    onClickEdit: jest.fn(),
    onClickPublish: jest.fn(),
    onOpenDiscardModal: jest.fn(),
    onOpenDeleteModal: jest.fn(),
    onOpenDuplicateModal: jest.fn(),
    onDiscardCreate: jest.fn(),
}

const mockOnTest = jest.fn()

const defaultToolbarData = {
    actions: mockActions,
    isDisabled: false,
    isFormValid: true,
    canEdit: true,
    editDisabledReason: undefined,
    onTest: mockOnTest,
    isPlaygroundOpen: false,
}

const defaultContextData = {
    state: {
        guidance: { id: 1 },
        historicalVersion: null,
    },
    config: {
        shopName: 'test-shop',
    },
}

const mapContextToStore = (contextData: any) => ({
    state: contextData.state,
    config: contextData.config,
    dispatch: contextData.dispatch ?? jest.fn(),
    guidanceArticle: contextData.state?.guidance,
    playground:
        contextData.playground ??
        ({
            isOpen: false,
            onTest: jest.fn(),
            onClose: jest.fn(),
            sidePanelWidth: '100%',
            shouldHideFullscreenButton: false,
        } as const),
    setConfig: jest.fn(),
    setGuidanceArticle: jest.fn(),
    setPlayground: jest.fn(),
})

const setMockContextData = (contextData: any) => {
    mockUseGuidanceContext.mockReturnValue(contextData)
    mockUseGuidanceStore.mockImplementation((selector) =>
        selector(mapContextToStore(contextData)),
    )
}

const mockVersion: ArticleTranslationVersion = {
    id: 1,
    version: 1,
    title: 'Test Title',
    excerpt: 'Test excerpt',
    content: 'Test content',
    slug: 'test-slug',
    seo_meta: null,
    created_datetime: '2024-01-01T00:00:00Z',
    published_datetime: '2024-01-01T00:00:00Z',
    commit_message: 'Initial version',
    publisher_user_id: 1,
}

const defaultVersionHistoryData = {
    versions: [mockVersion],
    isLoading: false,
    isViewingHistoricalVersion: false,
    currentVersionId: 1,
    selectedVersionId: null,
    onSelectVersion: jest.fn(),
    onGoToLatest: jest.fn(),
    isDisabled: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    onLoadMore: jest.fn(),
}

describe('GuidanceToolbarControls', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setMockContextData(defaultContextData)
        mockUseVersionHistory.mockReturnValue(defaultVersionHistoryData)
    })

    describe('viewing-historical-version state', () => {
        const mockDispatch = jest.fn()

        beforeEach(() => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: {
                    type: 'viewing-historical-version',
                } as GuidanceToolbarState,
            })
            setMockContextData({
                ...defaultContextData,
                dispatch: mockDispatch,
            })
        })

        it('renders version history button enabled', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /version history/i }),
            ).not.toBeDisabled()
        })

        it('does not render edit or more actions buttons', () => {
            renderComponent()

            expect(
                screen.queryByRole('button', { name: /edit/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: /dots-kebab-vertical/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('renders restore button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /restore/i }),
            ).toBeInTheDocument()
        })

        it('dispatches SET_MODAL restore when restore button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('button', { name: /restore/i }))

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'restore',
            })
        })

        it('renders test button disabled when playground is closed', () => {
            renderComponent()

            expect(screen.getByRole('button', { name: /test/i })).toBeDisabled()
        })

        it('does not render test button when playground is open', () => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: {
                    type: 'viewing-historical-version',
                } as GuidanceToolbarState,
                isPlaygroundOpen: true,
            })

            renderComponent()

            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('published-with-draft state', () => {
        beforeEach(() => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: { type: 'published-with-draft' } as GuidanceToolbarState,
            })
        })

        it('renders version history button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /version history/i }),
            ).toBeInTheDocument()
        })

        it('renders edit button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /edit/i }),
            ).toBeInTheDocument()
        })

        it('renders more actions menu and test buttons', () => {
            renderComponent()

            expect(
                screen.getByRole('button', {
                    name: /dots-kebab-vertical/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })
    })

    describe('published-without-draft state', () => {
        beforeEach(() => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: {
                    type: 'published-without-draft',
                } as GuidanceToolbarState,
            })
        })

        it('renders version history button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /version history/i }),
            ).toBeInTheDocument()
        })

        it('renders all action buttons', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /edit/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: /dots-kebab-vertical/i,
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('calls onClickEdit when edit button is clicked and canEdit is true', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('button', { name: /edit/i }))

            expect(mockActions.onClickEdit).toHaveBeenCalled()
        })
    })

    describe('draft-view state', () => {
        beforeEach(() => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: { type: 'draft-view' } as GuidanceToolbarState,
            })
        })

        it('renders version history button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /version history/i }),
            ).toBeInTheDocument()
        })

        it('renders publish button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeInTheDocument()
        })

        it('publish button is disabled when form is invalid', () => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: { type: 'draft-view' } as GuidanceToolbarState,
                isFormValid: false,
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeDisabled()
        })
    })

    describe('published-without-draft-edit state', () => {
        beforeEach(() => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: {
                    type: 'published-without-draft-edit',
                } as GuidanceToolbarState,
            })
        })

        it('renders version history button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /version history/i }),
            ).toBeInTheDocument()
        })

        it('renders disabled publish button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeDisabled()
        })

        it('renders delete draft button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
        })
    })

    describe('draft-edit state', () => {
        beforeEach(() => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: { type: 'draft-edit' } as GuidanceToolbarState,
            })
        })

        it('renders version history button', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /version history/i }),
            ).toBeInTheDocument()
        })

        it('renders delete draft and publish buttons', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeInTheDocument()
        })

        it('publish button is enabled when form is valid', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).not.toBeDisabled()
        })
    })

    describe('create state', () => {
        beforeEach(() => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: { type: 'create' } as GuidanceToolbarState,
            })
        })

        it('does not render version history button in create mode', () => {
            renderComponent()

            expect(
                screen.queryByRole('button', { name: /version history/i }),
            ).not.toBeInTheDocument()
        })

        it('renders delete draft and publish buttons', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeInTheDocument()
        })

        it('publish button is disabled in create mode', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeDisabled()
        })

        it('calls onDiscardCreate when delete draft is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('button', { name: /delete/i }))

            expect(mockActions.onDiscardCreate).toHaveBeenCalled()
        })
    })

    describe('version history integration', () => {
        it('passes correct props to VersionHistoryButton', () => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: {
                    type: 'published-without-draft',
                } as GuidanceToolbarState,
            })

            mockUseVersionHistory.mockReturnValue({
                ...defaultVersionHistoryData,
                versions: [mockVersion],
                currentVersionId: 1,
                selectedVersionId: 2,
                hasNextPage: true,
                isFetchingNextPage: true,
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: /version history/i }),
            ).toBeInTheDocument()
        })

        it('disables version history button when isDisabled is true', () => {
            mockUseGuidanceToolbar.mockReturnValue({
                ...defaultToolbarData,
                state: {
                    type: 'published-without-draft',
                } as GuidanceToolbarState,
            })

            mockUseVersionHistory.mockReturnValue({
                ...defaultVersionHistoryData,
                isDisabled: true,
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: /version history/i }),
            ).toBeDisabled()
        })
    })
})
