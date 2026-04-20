import { render, screen } from '@testing-library/react'
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
}))

jest.mock('../shared/VersionHistoryButton', () => ({
    VersionHistoryButton: () => <div data-testid="version-history" />,
}))

jest.mock('../KnowledgeEditorSkill/hooks/useSkillVersionHistory', () => ({
    useSkillVersionHistory: () => ({
        versions: [],
        isLoading: false,
        currentVersionId: null,
        selectedVersionId: null,
        onSelectVersion: jest.fn(),
        isDisabled: false,
        isFetchingNextPage: false,
        onLoadMore: jest.fn(),
        shouldLoadMore: false,
    }),
}))

const mockUseSkillEditorStore = jest.fn()
const mockDispatch = jest.fn()
const mockOnTest = jest.fn()

const defaultStoreData = {
    state: {
        mode: 'read' as const,
        isUpdating: false,
        isAutoSaving: false,
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
        expect(getToolbarState('read', true, true, true, true)).toEqual({
            type: 'viewing-historical-version',
        })
    })

    it('returns new-skill when in create mode', () => {
        expect(
            getToolbarState('create', undefined, false, false, false),
        ).toEqual({
            type: 'new-skill',
        })
    })

    it('returns published-enabled when viewing published and enabled', () => {
        expect(getToolbarState('read', true, false, true, true)).toEqual({
            type: 'published-enabled',
        })
    })

    it('returns published-disabled when viewing published and disabled', () => {
        expect(getToolbarState('read', true, false, false, true)).toEqual({
            type: 'published-disabled',
        })
    })

    it('returns draft-only when isCurrent is undefined', () => {
        expect(getToolbarState('edit', undefined, false, false, false)).toEqual(
            {
                type: 'draft-only',
            },
        )
    })

    it('returns draft-only when isCurrent is false but no published version', () => {
        expect(getToolbarState('edit', false, false, false, false)).toEqual({
            type: 'draft-only',
        })
    })

    it('returns published-with-draft-changes when viewing draft with published version', () => {
        expect(getToolbarState('edit', false, false, true, true)).toEqual({
            type: 'published-with-draft-changes',
        })
    })
})

describe('SkillToolbarControls', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setStoreData()
    })

    describe('new-skill state', () => {
        beforeEach(() => {
            setStoreData({
                state: { mode: 'create', skill: null, visibility: false },
            })
        })

        it('renders Enable button', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.getByRole('button', { name: /enable/i }),
            ).toBeInTheDocument()
        })

        it('does not render delete button or version history', () => {
            render(<SkillToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /delete/i }),
            ).not.toBeInTheDocument()
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

        it('dispatches enable modal on click', async () => {
            const user = userEvent.setup()
            render(<SkillToolbarControls />)

            await user.click(screen.getByRole('button', { name: /enable/i }))

            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'SET_MODAL',
                payload: 'enable',
            })
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
})
