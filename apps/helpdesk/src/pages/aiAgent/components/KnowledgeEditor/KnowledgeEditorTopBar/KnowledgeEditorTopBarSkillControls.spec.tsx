import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillToolbarControls } from './KnowledgeEditorTopBarSkillControls'

jest.mock('../KnowledgeEditorSkill/context', () => ({
    useSkillEditorStore: (selector: Function) =>
        mockUseSkillEditorStore(selector),
    hasDraft: (state: {
        skill?: {
            publishedVersionId?: number | null
            draftVersionId?: number | null
        }
    }) => {
        const skill = state.skill
        return (
            skill?.publishedVersionId != null &&
            skill?.draftVersionId != null &&
            skill?.publishedVersionId !== skill?.draftVersionId
        )
    },
}))

jest.mock('./KnowledgeEditorTopBarCommonControls', () => ({
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
    DeleteDraftButton: ({
        disabled,
        onDelete,
    }: {
        disabled: boolean
        onDelete?: () => void
    }) => (
        <button
            disabled={disabled}
            onClick={onDelete}
            aria-label="delete-draft"
        >
            Delete draft
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

describe('SkillToolbarControls', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        setStoreData()
    })

    it('renders edit button and version history in published-without-draft mode', () => {
        render(<SkillToolbarControls />)

        expect(
            screen.getByRole('button', { name: /edit/i }),
        ).toBeInTheDocument()
        expect(screen.getByTestId('version-history')).toBeInTheDocument()
    })

    it('dispatches SET_MODE edit when edit is clicked', async () => {
        const user = userEvent.setup()
        render(<SkillToolbarControls />)

        await user.click(screen.getByRole('button', { name: /edit/i }))

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_MODE',
            payload: 'edit',
        })
    })

    it('renders publish button in draft-edit mode', () => {
        setStoreData({
            state: {
                mode: 'edit',
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

    it('renders publish button without version history in create mode', () => {
        setStoreData({ state: { mode: 'create', skill: null } })
        render(<SkillToolbarControls />)

        expect(
            screen.getByRole('button', { name: /publish changes/i }),
        ).toBeInTheDocument()
        expect(screen.queryByTestId('version-history')).not.toBeInTheDocument()
    })

    it('shows version history in draft-view mode', () => {
        setStoreData({
            state: {
                mode: 'read',
                skill: {
                    id: 1,
                    isCurrent: false,
                    publishedVersionId: 1,
                    draftVersionId: 2,
                },
            },
        })
        render(<SkillToolbarControls />)

        expect(screen.getByTestId('version-history')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /publish/i }),
        ).toBeInTheDocument()
    })
})
