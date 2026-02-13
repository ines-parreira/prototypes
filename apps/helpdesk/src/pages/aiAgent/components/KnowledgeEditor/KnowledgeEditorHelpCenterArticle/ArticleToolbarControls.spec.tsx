import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArticleToolbarControls } from './ArticleToolbarControls'
import { useArticleContext } from './context'
import { useArticleToolbar } from './hooks/useArticleToolbar'
import { useVersionHistory } from './hooks/useVersionHistory'

jest.mock('./hooks/useArticleToolbar', () => ({
    useArticleToolbar: jest.fn(),
}))

jest.mock('./hooks/useVersionHistory', () => ({
    useVersionHistory: jest.fn(),
}))

jest.mock('./context', () => ({
    useArticleContext: jest.fn(),
}))

jest.mock('../shared/VersionHistoryButton', () => ({
    VersionHistoryButton: (props: { isDisabled?: boolean }) => (
        <button aria-label="Version history" disabled={props.isDisabled}>
            Version history
        </button>
    ),
}))

const mockUseArticleToolbar = useArticleToolbar as jest.Mock
const mockUseVersionHistory = useVersionHistory as jest.Mock
const mockUseArticleContext = useArticleContext as jest.Mock

describe('ArticleToolbarControls', () => {
    let mockOnClickEdit: jest.Mock
    let mockOnClickPublish: jest.Mock
    let mockOnOpenDeleteModal: jest.Mock
    let mockOnDiscard: jest.Mock
    let mockOnTest: jest.Mock

    const createMockToolbar = (
        overrides: Partial<{
            state: { type: string }
            isDisabled: boolean
            isFormValid: boolean
            canEdit: boolean
            editDisabledReason: string | undefined
            isPlaygroundOpen: boolean
            isVersionHistoryEnabled: boolean
        }> = {},
    ) => ({
        state: overrides.state ?? { type: 'draft-edit' },
        actions: {
            onClickEdit: mockOnClickEdit,
            onClickPublish: mockOnClickPublish,
            onOpenDeleteModal: mockOnOpenDeleteModal,
            onDiscard: mockOnDiscard,
        },
        isDisabled: overrides.isDisabled ?? false,
        isFormValid: overrides.isFormValid ?? true,
        canEdit: overrides.canEdit ?? true,
        editDisabledReason: overrides.editDisabledReason,
        onTest: mockOnTest,
        isPlaygroundOpen: overrides.isPlaygroundOpen ?? false,
        isVersionHistoryEnabled: overrides.isVersionHistoryEnabled ?? false,
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockOnClickEdit = jest.fn()
        mockOnClickPublish = jest.fn()
        mockOnOpenDeleteModal = jest.fn()
        mockOnDiscard = jest.fn()
        mockOnTest = jest.fn()

        mockUseArticleContext.mockReturnValue({
            dispatch: jest.fn(),
        })
        mockUseArticleToolbar.mockReturnValue(createMockToolbar())
        mockUseVersionHistory.mockReturnValue({
            versions: [],
            isLoading: false,
            isViewingHistoricalVersion: false,
            currentVersionId: null,
            selectedVersionId: null,
            onSelectVersion: jest.fn(),
            onGoToLatest: jest.fn(),
            isDisabled: false,
            hasNextPage: false,
            isFetchingNextPage: false,
            onLoadMore: jest.fn(),
            shouldLoadMore: false,
        })
    })

    describe('published-with-draft state', () => {
        beforeEach(() => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-with-draft' },
                }),
            )
        })

        it('should render edit, delete, and test buttons', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /edit/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('should not render publish or delete draft buttons', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /publish/i }),
            ).not.toBeInTheDocument()
        })

        it('should disable edit button (no onEdit handler)', () => {
            render(<ArticleToolbarControls />)

            expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled()
        })

        it('should render delete button', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
        })

        it('should call onTest when test is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /test/i }))

            expect(mockOnTest).toHaveBeenCalled()
        })

        it('should disable buttons when isDisabled is true', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-with-draft' },
                    isDisabled: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeDisabled()
            expect(screen.getByRole('button', { name: /test/i })).toBeDisabled()
        })
    })

    describe('published-without-draft state', () => {
        beforeEach(() => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-without-draft' },
                    canEdit: true,
                }),
            )
        })

        it('should render edit, delete, and test buttons', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /edit/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('should call onClickEdit when edit is clicked and canEdit is true', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /edit/i }))

            expect(mockOnClickEdit).toHaveBeenCalled()
        })

        it('should not call onClickEdit when canEdit is false', async () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-without-draft' },
                    canEdit: false,
                }),
            )
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            const editButton = screen.getByRole('button', { name: /edit/i })
            expect(editButton).toBeDisabled()

            await user.click(editButton)

            expect(mockOnClickEdit).not.toHaveBeenCalled()
        })

        it('should render delete button', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
        })

        it('should call onTest when test is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /test/i }))

            expect(mockOnTest).toHaveBeenCalled()
        })
    })

    describe('draft-view state', () => {
        beforeEach(() => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'draft-view' },
                    isFormValid: true,
                }),
            )
        })

        it('should render edit, delete, publish, and test buttons', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /edit/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('should call onClickEdit when edit is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /edit/i }))

            expect(mockOnClickEdit).toHaveBeenCalled()
        })

        it('should call onClickPublish when publish is clicked and form is valid', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /publish/i }))

            expect(mockOnClickPublish).toHaveBeenCalled()
        })

        it('should disable publish button when form is invalid', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'draft-view' },
                    isFormValid: false,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeDisabled()
        })

        it('should disable publish button when isDisabled is true', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'draft-view' },
                    isFormValid: true,
                    isDisabled: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeDisabled()
        })

        it('should render delete button', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
        })
    })

    describe('published-without-draft-edit state', () => {
        beforeEach(() => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-without-draft-edit' },
                }),
            )
        })

        it('should render publish and test buttons only', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('should render delete draft button and not render edit button', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /^edit$/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Delete' }),
            ).toBeInTheDocument()
        })

        it('should always disable publish button', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeDisabled()
        })

        it('should call onTest when test is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /test/i }))

            expect(mockOnTest).toHaveBeenCalled()
        })
    })

    describe('draft-edit state', () => {
        beforeEach(() => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'draft-edit' },
                    isFormValid: true,
                }),
            )
        })

        it('should render delete draft, publish, and test buttons', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: 'Delete' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('should not render edit or delete buttons', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /^edit$/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'delete' }),
            ).not.toBeInTheDocument()
        })

        it('should call onDiscard when delete draft is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: 'Delete' }))

            expect(mockOnDiscard).toHaveBeenCalled()
        })

        it('should call onClickPublish when publish is clicked and form is valid', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /publish/i }))

            expect(mockOnClickPublish).toHaveBeenCalled()
        })

        it('should disable publish button when form is invalid', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'draft-edit' },
                    isFormValid: false,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeDisabled()
        })

        it('should disable all buttons when isDisabled is true', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'draft-edit' },
                    isDisabled: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: 'Delete' }),
            ).toBeDisabled()
            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeDisabled()
            expect(screen.getByRole('button', { name: /test/i })).toBeDisabled()
        })

        it('should call onTest when test is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /test/i }))

            expect(mockOnTest).toHaveBeenCalled()
        })
    })

    describe('create state', () => {
        beforeEach(() => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'create' },
                    isFormValid: true,
                }),
            )
        })

        it('should render delete draft, publish, and test buttons', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: 'Delete' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('should disable publish button in create mode regardless of form validity', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeDisabled()
        })

        it('should disable test button in create mode', () => {
            render(<ArticleToolbarControls />)

            expect(screen.getByRole('button', { name: /test/i })).toBeDisabled()
        })

        it('should call onDiscard when delete draft is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: 'Delete' }))

            expect(mockOnDiscard).toHaveBeenCalled()
        })

        it('should not call onClickPublish when publish button is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            const publishButton = screen.getByRole('button', {
                name: /publish/i,
            })
            await user.click(publishButton)

            expect(mockOnClickPublish).not.toHaveBeenCalled()
        })
    })

    describe('viewing-historical-version state', () => {
        const mockDispatch = jest.fn()

        beforeEach(() => {
            mockUseArticleContext.mockReturnValue({
                dispatch: mockDispatch,
            })
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'viewing-historical-version' },
                    isVersionHistoryEnabled: true,
                }),
            )
            mockUseVersionHistory.mockReturnValue({
                versions: [
                    {
                        id: 10,
                        version: 3,
                        title: 'V3',
                        content: '<p>V3</p>',
                        excerpt: '',
                        slug: '',
                        seo_meta: null,
                        created_datetime: '2024-03-01T00:00:00Z',
                        published_datetime: '2024-03-01T12:00:00Z',
                        commit_message: 'Published v3',
                        publisher_user_id: 42,
                    },
                ],
                isLoading: false,
                isViewingHistoricalVersion: true,
                currentVersionId: 10,
                selectedVersionId: 10,
                onSelectVersion: jest.fn(),
                onGoToLatest: jest.fn(),
                isDisabled: false,
                hasNextPage: false,
                isFetchingNextPage: false,
                onLoadMore: jest.fn(),
                shouldLoadMore: false,
            })
        })

        it('should render version history, restore, and test buttons', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /version history/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /restore/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('should not render edit or delete buttons', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /edit/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /delete/i }),
            ).not.toBeInTheDocument()
        })

        it('should dispatch SET_MODAL restore when restore button is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /restore/i }))

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'restore',
            })
        })

        it('should disable test button', () => {
            render(<ArticleToolbarControls />)

            expect(screen.getByRole('button', { name: /test/i })).toBeDisabled()
        })

        it('should not render publish button', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /publish/i }),
            ).not.toBeInTheDocument()
        })

        it('should hide test button when playground is open', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'viewing-historical-version' },
                    isVersionHistoryEnabled: true,
                    isPlaygroundOpen: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('VersionHistoryButton visibility', () => {
        const versionHistoryMock = {
            versions: [
                {
                    id: 10,
                    version: 3,
                    title: 'V3',
                    content: '<p>V3</p>',
                    excerpt: '',
                    slug: '',
                    seo_meta: null,
                    created_datetime: '2024-03-01T00:00:00Z',
                    published_datetime: '2024-03-01T12:00:00Z',
                    commit_message: 'Published v3',
                    publisher_user_id: 42,
                },
            ],
            isLoading: false,
            isViewingHistoricalVersion: false,
            currentVersionId: 10,
            selectedVersionId: null,
            onSelectVersion: jest.fn(),
            onGoToLatest: jest.fn(),
            isDisabled: false,
            hasNextPage: false,
            isFetchingNextPage: false,
            onLoadMore: jest.fn(),
            shouldLoadMore: false,
        }

        beforeEach(() => {
            mockUseVersionHistory.mockReturnValue(versionHistoryMock)
        })

        it.each([
            'published-with-draft',
            'published-without-draft',
            'draft-view',
            'published-without-draft-edit',
            'draft-edit',
        ] as const)(
            'should render version history button in %s state when enabled',
            (stateType) => {
                mockUseArticleToolbar.mockReturnValue(
                    createMockToolbar({
                        state: { type: stateType },
                        isVersionHistoryEnabled: true,
                    }),
                )
                render(<ArticleToolbarControls />)

                expect(
                    screen.getByRole('button', { name: /version history/i }),
                ).toBeInTheDocument()
            },
        )

        it.each([
            'published-with-draft',
            'published-without-draft',
            'draft-view',
            'published-without-draft-edit',
            'draft-edit',
            'create',
        ] as const)(
            'should not render version history button in %s state when disabled',
            (stateType) => {
                mockUseArticleToolbar.mockReturnValue(
                    createMockToolbar({
                        state: { type: stateType },
                        isVersionHistoryEnabled: false,
                    }),
                )
                render(<ArticleToolbarControls />)

                expect(
                    screen.queryByRole('button', { name: /version history/i }),
                ).not.toBeInTheDocument()
            },
        )

        it('should not render version history button in create state even when enabled', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'create' },
                    isVersionHistoryEnabled: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /version history/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('tooltip for disabled edit button', () => {
        it('should show tooltip with disabled reason when edit is disabled with reason', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-with-draft' },
                    editDisabledReason:
                        'This version is read-only. View the version with draft edits to make changes.',
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /edit/i }),
            ).toBeInTheDocument()
        })
    })

    describe('TestButton visibility based on isPlaygroundOpen', () => {
        it('should hide TestButton when isPlaygroundOpen is true in published-with-draft state', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-with-draft' },
                    isPlaygroundOpen: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })

        it('should hide TestButton when isPlaygroundOpen is true in published-without-draft state', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-without-draft' },
                    isPlaygroundOpen: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })

        it('should hide TestButton when isPlaygroundOpen is true in draft-view state', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'draft-view' },
                    isPlaygroundOpen: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })

        it('should hide TestButton when isPlaygroundOpen is true in published-without-draft-edit state', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-without-draft-edit' },
                    isPlaygroundOpen: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })

        it('should hide TestButton when isPlaygroundOpen is true in draft-edit state', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'draft-edit' },
                    isPlaygroundOpen: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })

        it('should hide TestButton when isPlaygroundOpen is true in create state', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'create' },
                    isPlaygroundOpen: true,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /test/i }),
            ).not.toBeInTheDocument()
        })

        it('should show TestButton when isPlaygroundOpen is false', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-without-draft' },
                    isPlaygroundOpen: false,
                }),
            )
            render(<ArticleToolbarControls />)

            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })
    })
})
