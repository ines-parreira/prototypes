import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ArticleToolbarControls } from './ArticleToolbarControls'
import { useArticleToolbar } from './hooks/useArticleToolbar'

jest.mock('./hooks/useArticleToolbar', () => ({
    useArticleToolbar: jest.fn(),
}))

const mockUseArticleToolbar = useArticleToolbar as jest.Mock

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
    })

    beforeEach(() => {
        jest.clearAllMocks()

        mockOnClickEdit = jest.fn()
        mockOnClickPublish = jest.fn()
        mockOnOpenDeleteModal = jest.fn()
        mockOnDiscard = jest.fn()
        mockOnTest = jest.fn()

        mockUseArticleToolbar.mockReturnValue(createMockToolbar())
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
            expect(
                screen.queryByRole('button', { name: /delete draft/i }),
            ).not.toBeInTheDocument()
        })

        it('should disable edit button (no onEdit handler)', () => {
            render(<ArticleToolbarControls />)

            expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled()
        })

        it('should call onOpenDeleteModal when delete is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /delete/i }))

            expect(mockOnOpenDeleteModal).toHaveBeenCalled()
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

        it('should call onOpenDeleteModal when delete is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /delete/i }))

            expect(mockOnOpenDeleteModal).toHaveBeenCalled()
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

        it('should call onOpenDeleteModal when delete is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(screen.getByRole('button', { name: /delete/i }))

            expect(mockOnOpenDeleteModal).toHaveBeenCalled()
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

        it('should not render edit, delete, or delete draft buttons', () => {
            render(<ArticleToolbarControls />)

            expect(
                screen.queryByRole('button', { name: /^edit$/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /^delete$/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: /delete draft/i }),
            ).not.toBeInTheDocument()
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
                screen.getByRole('button', { name: /delete draft/i }),
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
                screen.queryByRole('button', { name: /^delete$/i }),
            ).not.toBeInTheDocument()
        })

        it('should call onDiscard when delete draft is clicked', async () => {
            const user = userEvent.setup()
            render(<ArticleToolbarControls />)

            await user.click(
                screen.getByRole('button', { name: /delete draft/i }),
            )

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
                screen.getByRole('button', { name: /delete draft/i }),
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
                screen.getByRole('button', { name: /delete draft/i }),
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

            await user.click(
                screen.getByRole('button', { name: /delete draft/i }),
            )

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

    describe('tooltip for disabled edit button', () => {
        it('should show tooltip with disabled reason when edit is disabled with reason', () => {
            mockUseArticleToolbar.mockReturnValue(
                createMockToolbar({
                    state: { type: 'published-with-draft' },
                    editDisabledReason:
                        'You already have a draft version. Only one draft is allowed.',
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
