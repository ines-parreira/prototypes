import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    getToolbarState,
    SkillToolbarControls,
} from './KnowledgeEditorTopBarSkillControls'

jest.mock('../KnowledgeEditorSkill/context', () => ({
    useSkillEditorStore: (selector: Function) =>
        mockUseSkillEditorStore(selector),
    isFormValid: (state: {
        title: string
        content: string
        intents: string[]
    }) =>
        state.title.trim() !== '' &&
        state.content.trim() !== '' &&
        state.intents.length > 0,
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
}))

const mockOnSelectVersion = jest.fn()
const mockRemoveVersionIdParam = jest.fn()

jest.mock('../KnowledgeEditorSkill/hooks/useRemoveVersionIdParam', () => ({
    useRemoveVersionIdParam: () => mockRemoveVersionIdParam,
}))

jest.mock('../shared/VersionHistoryButton', () => ({
    VersionHistoryButton: ({
        onSelectVersion,
        versions,
    }: {
        onSelectVersion: (v: unknown) => void
        versions: unknown[]
    }) => (
        <div data-testid="version-history">
            {versions.length > 0 && (
                <button
                    aria-label="Select version"
                    onClick={() => onSelectVersion(versions[0])}
                />
            )}
        </div>
    ),
}))

const mockUseSkillVersionHistory = jest.fn()

jest.mock('../KnowledgeEditorSkill/hooks/useSkillVersionHistory', () => ({
    useSkillVersionHistory: () => mockUseSkillVersionHistory(),
}))

const mockRequestEnable = jest.fn()

jest.mock('../KnowledgeEditorSkill/modals/useSkillEnableModal', () => ({
    useSkillEnableModal: () => ({ requestEnable: mockRequestEnable }),
}))

const mockUseSkillEditorStore = jest.fn()
const mockDispatch = jest.fn()
const mockOnTest = jest.fn()

const defaultStoreData = {
    state: {
        mode: 'read' as const,
        isUpdating: false,
        isAutoSaving: false,
        isDetailsView: false,
        isFullscreen: false,
        visibility: true,
        title: 'My Skill',
        content: 'Some content',
        intents: ['intent-1'],
        skill: {
            id: 1,
            isCurrent: true,
            publishedVersionId: 1,
            draftVersionId: 1,
        },
        historicalVersion: null,
    },
    config: {
        isPreviewMode: false,
        isDetailsView: false,
        isFullscreen: false,
        onClose: jest.fn(),
    },
    dispatch: mockDispatch,
    playground: {
        isOpen: false,
        onTest: mockOnTest,
    },
}

const setStoreData = (overrides: Record<string, unknown> = {}) => {
    const data = {
        ...defaultStoreData,
        state: { ...defaultStoreData.state, ...(overrides.state as object) },
        config: {
            ...defaultStoreData.config,
            ...(overrides.config as object),
        },
        playground: {
            ...defaultStoreData.playground,
            ...(overrides.playground as object),
        },
    }

    mockUseSkillEditorStore.mockImplementation((selector: Function) =>
        selector(data),
    )
}

describe('getToolbarState', () => {
    it('returns viewing-historical-version when viewing historical version', () => {
        expect(getToolbarState('read', false, true, true, true, true)).toEqual({
            type: 'viewing-historical-version',
        })
    })

    it('returns new-skill when in create mode', () => {
        expect(
            getToolbarState('create', false, undefined, false, false, false),
        ).toEqual({
            type: 'new-skill',
        })
    })

    it('returns published-enabled when viewing published and enabled', () => {
        expect(getToolbarState('read', false, true, false, true, true)).toEqual(
            {
                type: 'published-enabled',
            },
        )
    })

    it('returns published-disabled when viewing published and disabled', () => {
        expect(
            getToolbarState('read', false, true, false, false, true),
        ).toEqual({
            type: 'published-disabled',
        })
    })

    it('returns draft-only when isCurrent is undefined', () => {
        expect(
            getToolbarState('edit', false, undefined, false, false, false),
        ).toEqual({
            type: 'draft-only',
        })
    })

    it('returns draft-only when isCurrent is false but no published version', () => {
        expect(
            getToolbarState('edit', false, false, false, false, false),
        ).toEqual({
            type: 'draft-only',
        })
    })

    it('returns published-with-draft-changes when viewing draft with published version', () => {
        expect(
            getToolbarState('edit', false, false, false, true, true),
        ).toEqual({
            type: 'published-with-draft-changes',
        })
    })

    describe('preview mode', () => {
        it('returns preview-read when isPreview and mode is read', () => {
            expect(
                getToolbarState('read', true, true, false, true, true),
            ).toEqual({ type: 'preview-read' })
        })

        it('returns preview-edit when isPreview and mode is edit', () => {
            expect(
                getToolbarState('edit', true, true, false, true, true),
            ).toEqual({ type: 'preview-edit' })
        })

        it('returns preview-previous-version when isPreview and viewing historical version', () => {
            expect(
                getToolbarState('read', true, true, true, true, true),
            ).toEqual({ type: 'preview-previous-version' })
        })
    })
})

describe('SkillToolbarControls', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setStoreData()
        mockUseSkillVersionHistory.mockReturnValue({
            versions: [],
            isLoading: false,
            currentVersionId: null,
            selectedVersionId: null,
            onSelectVersion: mockOnSelectVersion,
            isDisabled: false,
            isFetchingNextPage: false,
            onLoadMore: jest.fn(),
            shouldLoadMore: false,
        })
    })

    describe('new-skill state', () => {
        beforeEach(() => {
            setStoreData({
                state: { mode: 'create', skill: null, visibility: false },
            })
        })

        it('renders delete button and Enable button', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /enable/i }),
            ).toBeInTheDocument()
        })

        it('does not render version history', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.queryByTestId('version-history'),
            ).not.toBeInTheDocument()
        })

        it('disables Enable when requirements are not met', () => {
            setStoreData({
                state: {
                    mode: 'create',
                    skill: null,
                    visibility: false,
                    title: '',
                    content: '',
                    intents: [],
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /enable/i }),
            ).toBeDisabled()
        })

        it('triggers requestEnable on click', async () => {
            const user = userEvent.setup()
            render(<SkillToolbarControls />)

            await user.click(screen.getByRole('button', { name: /enable/i }))

            expect(mockRequestEnable).toHaveBeenCalledTimes(1)
        })
    })

    describe('draft-only state', () => {
        beforeEach(() => {
            setStoreData({
                state: {
                    mode: 'edit',
                    visibility: false,
                    skill: {
                        id: 1,
                        isCurrent: undefined,
                        publishedVersionId: null,
                        draftVersionId: 1,
                    },
                },
            })
        })

        it('renders Enable button, delete, and version history', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /enable/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
            expect(screen.getByTestId('version-history')).toBeInTheDocument()
        })
    })

    describe('published-enabled state', () => {
        beforeEach(() => {
            setStoreData({
                state: {
                    mode: 'read',
                    visibility: true,
                    skill: {
                        id: 1,
                        isCurrent: true,
                        publishedVersionId: 1,
                        draftVersionId: 1,
                    },
                },
            })
        })

        it('renders Disable button', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /disable/i }),
            ).toBeInTheDocument()
        })

        it('renders delete and version history', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
            expect(screen.getByTestId('version-history')).toBeInTheDocument()
        })

        it('dispatches disable modal on click', async () => {
            const user = userEvent.setup()
            render(<SkillToolbarControls />)

            await user.click(screen.getByRole('button', { name: /disable/i }))

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'disable',
            })
        })
    })

    describe('published-disabled state', () => {
        it('renders Enable button', () => {
            setStoreData({
                state: {
                    mode: 'read',
                    visibility: false,
                    skill: {
                        id: 1,
                        isCurrent: true,
                        publishedVersionId: 1,
                        draftVersionId: 1,
                    },
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /enable/i }),
            ).toBeInTheDocument()
        })
    })

    describe('published-with-draft-changes state', () => {
        beforeEach(() => {
            setStoreData({
                state: {
                    mode: 'edit',
                    visibility: true,
                    skill: {
                        id: 1,
                        isCurrent: false,
                        publishedVersionId: 1,
                        draftVersionId: 2,
                    },
                },
            })
        })

        it('renders Publish changes button', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /publish changes/i }),
            ).toBeInTheDocument()
        })

        it('renders delete and version history', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
            expect(screen.getByTestId('version-history')).toBeInTheDocument()
        })

        it('dispatches publish modal on click', async () => {
            const user = userEvent.setup()
            render(<SkillToolbarControls />)

            await user.click(
                screen.getByRole('button', { name: /publish changes/i }),
            )

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'publish',
            })
        })

        it('disables Publish changes when requirements are not met', () => {
            setStoreData({
                state: {
                    mode: 'edit',
                    visibility: true,
                    title: 'My Skill',
                    content: 'Some content',
                    intents: [],
                    skill: {
                        id: 1,
                        isCurrent: false,
                        publishedVersionId: 1,
                        draftVersionId: 2,
                    },
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /publish changes/i }),
            ).toBeDisabled()
        })
    })

    describe('viewing-historical-version state', () => {
        beforeEach(() => {
            setStoreData({
                state: {
                    mode: 'read',
                    historicalVersion: {
                        publishedDatetime: '2024-01-01',
                        versionId: 5,
                    },
                },
            })
        })

        it('renders Restore draft button', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /restore draft/i }),
            ).toBeInTheDocument()
        })

        it('does not render delete button', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /delete/i }),
            ).not.toBeInTheDocument()
        })

        it('renders version history', () => {
            render(<SkillToolbarControls />)

            expect(screen.getByTestId('version-history')).toBeInTheDocument()
        })

        it('dispatches restore modal on click', async () => {
            const user = userEvent.setup()
            render(<SkillToolbarControls />)

            await user.click(
                screen.getByRole('button', { name: /restore draft/i }),
            )

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'restore',
            })
        })
    })

    describe('read-only mode', () => {
        it('renders no header actions when the skill is read-only', () => {
            setStoreData({
                config: { isPreviewMode: false, isReadOnly: true },
                state: {
                    mode: 'read',
                    skill: {
                        id: 1,
                        isCurrent: undefined,
                        publishedVersionId: null,
                        draftVersionId: 1,
                    },
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /delete/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /enable/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('version-history'),
            ).not.toBeInTheDocument()
        })
    })

    describe('busy state', () => {
        it('disables buttons when isUpdating', () => {
            setStoreData({
                state: {
                    isUpdating: true,
                    visibility: true,
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /disable/i }),
            ).toBeDisabled()
        })

        it('disables buttons when isAutoSaving', () => {
            setStoreData({
                state: {
                    isAutoSaving: true,
                    visibility: true,
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /disable/i }),
            ).toBeDisabled()
        })
    })

    describe('preview-read state', () => {
        beforeEach(() => {
            setStoreData({
                config: { isPreviewMode: true },
                state: {
                    mode: 'read',
                    visibility: true,
                    skill: {
                        id: 1,
                        isCurrent: true,
                        publishedVersionId: 1,
                        draftVersionId: 1,
                    },
                },
            })
        })

        it('renders Edit button', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /edit/i }),
            ).toBeInTheDocument()
        })

        it('renders version history and test buttons', () => {
            render(<SkillToolbarControls />)

            expect(screen.getByTestId('version-history')).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /test/i }),
            ).toBeInTheDocument()
        })

        it('renders Close button', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /close/i }),
            ).toBeInTheDocument()
        })

        it('dispatches SET_MODE edit on edit click', async () => {
            const user = userEvent.setup()
            render(<SkillToolbarControls />)

            await user.click(screen.getByRole('button', { name: /edit/i }))

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODE',
                payload: 'edit',
            })
        })
    })

    describe('preview-edit state', () => {
        it('renders Disable button when published and enabled (published-enabled)', () => {
            setStoreData({
                config: { isPreviewMode: true },
                state: {
                    mode: 'edit',
                    visibility: true,
                    skill: {
                        id: 1,
                        isCurrent: true,
                        publishedVersionId: 1,
                        draftVersionId: 1,
                    },
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /delete/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /disable/i }),
            ).toBeInTheDocument()
        })

        it('renders Enable button when published and disabled (published-disabled)', () => {
            setStoreData({
                config: { isPreviewMode: true },
                state: {
                    mode: 'edit',
                    visibility: false,
                    skill: {
                        id: 1,
                        isCurrent: true,
                        publishedVersionId: 1,
                        draftVersionId: 1,
                    },
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /enable/i }),
            ).toBeInTheDocument()
        })

        it('renders Publish changes button when draft changes exist (published-with-draft-changes)', () => {
            setStoreData({
                config: { isPreviewMode: true },
                state: {
                    mode: 'edit',
                    visibility: true,
                    skill: {
                        id: 1,
                        isCurrent: false,
                        publishedVersionId: 1,
                        draftVersionId: 2,
                    },
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /publish changes/i }),
            ).toBeInTheDocument()
        })

        it('renders Enable button when no published version (draft-only)', () => {
            setStoreData({
                config: { isPreviewMode: true },
                state: {
                    mode: 'edit',
                    visibility: false,
                    skill: {
                        id: 1,
                        isCurrent: undefined,
                        publishedVersionId: null,
                        draftVersionId: 1,
                    },
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /enable/i }),
            ).toBeInTheDocument()
        })

        it('does not render Edit button', () => {
            setStoreData({
                config: { isPreviewMode: true },
                state: {
                    mode: 'edit',
                    visibility: true,
                    skill: {
                        id: 1,
                        isCurrent: true,
                        publishedVersionId: 1,
                        draftVersionId: 1,
                    },
                },
            })
            render(<SkillToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /^edit$/i }),
            ).not.toBeInTheDocument()
        })
    })

    describe('preview-previous-version state', () => {
        beforeEach(() => {
            setStoreData({
                config: { isPreviewMode: true },
                state: {
                    mode: 'read',
                    historicalVersion: {
                        publishedDatetime: '2024-01-01',
                        versionId: 5,
                    },
                },
            })
        })

        it('renders Restore draft and version history buttons', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /restore draft/i }),
            ).toBeInTheDocument()
            expect(screen.getByTestId('version-history')).toBeInTheDocument()
        })

        it('does not render Edit button', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /^edit$/i }),
            ).not.toBeInTheDocument()
        })

        it('test button is disabled when viewing historical version in preview', () => {
            render(<SkillToolbarControls />)

            expect(screen.getByRole('button', { name: /test/i })).toBeDisabled()
        })
    })

    describe('version picker — versionId param cleanup', () => {
        beforeEach(() => {
            setStoreData({
                state: {
                    mode: 'read',
                    historicalVersion: {
                        publishedDatetime: '2024-01-01',
                        versionId: 5,
                    },
                },
            })
            mockUseSkillVersionHistory.mockReturnValue({
                versions: [
                    {
                        id: 5,
                        version: 1,
                        published_datetime: '2024-01-01T00:00:00Z',
                    },
                ],
                isLoading: false,
                currentVersionId: 5,
                selectedVersionId: null,
                onSelectVersion: mockOnSelectVersion,
                isDisabled: false,
                isFetchingNextPage: false,
                onLoadMore: jest.fn(),
                shouldLoadMore: false,
            })
        })

        it('removes versionId param when a version is selected', async () => {
            const user = userEvent.setup()
            render(<SkillToolbarControls />)

            await user.click(
                screen.getByRole('button', { name: /select version/i }),
            )

            expect(mockRemoveVersionIdParam).toHaveBeenCalled()
        })

        it('still calls the underlying onSelectVersion when a version is selected', async () => {
            const user = userEvent.setup()
            render(<SkillToolbarControls />)

            await user.click(
                screen.getByRole('button', { name: /select version/i }),
            )

            expect(mockOnSelectVersion).toHaveBeenCalled()
        })
    })
})
