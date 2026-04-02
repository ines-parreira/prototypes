import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillToolbarControls } from './KnowledgeEditorTopBarSkillControls'

jest.mock('../KnowledgeEditorSkill/context')
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
}))

const mockUseSkillEditorStore = jest.requireMock(
    '../KnowledgeEditorSkill/context',
).useSkillEditorStore as jest.Mock

const mockDispatch = jest.fn()
const mockOnTest = jest.fn()

const defaultStoreData = {
    state: {
        mode: 'read' as const,
        isUpdating: false,
        isAutoSaving: false,
        skill: { id: 1 },
    },
    dispatch: mockDispatch,
    playground: {
        isOpen: false,
        onTest: mockOnTest,
        onClose: jest.fn(),
        sidePanelWidth: '100vw',
        shouldHideFullscreenButton: false,
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

    it('renders edit and test buttons in read mode', () => {
        render(<SkillToolbarControls />)

        expect(
            screen.getByRole('button', { name: /edit/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /test/i }),
        ).toBeInTheDocument()
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

    it('renders publish button in edit mode', () => {
        setStoreData({ state: { mode: 'edit' } })
        render(<SkillToolbarControls />)

        expect(
            screen.getByRole('button', { name: /publish changes/i }),
        ).toBeInTheDocument()
    })

    it('dispatches SET_MODAL publish when publish is clicked', async () => {
        setStoreData({ state: { mode: 'edit' } })
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

    it('returns null for unknown mode', () => {
        setStoreData({ state: { mode: 'diff' } })
        const { container } = render(<SkillToolbarControls />)

        expect(container).toBeEmptyDOMElement()
    })
})
