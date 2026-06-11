import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SkillEditorHeader } from './SkillEditorHeader'

jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorTopBar/KnowledgeEditorTopBarTitle',
    () => ({
        KnowledgeEditorTopBarTitle: ({
            title,
            onChangeTitle,
        }: {
            title: string
            onChangeTitle?: (value: string) => void
        }) =>
            onChangeTitle ? (
                <input
                    aria-label="title"
                    value={title}
                    onChange={(e) => onChangeTitle(e.target.value)}
                />
            ) : (
                <span>{title}</span>
            ),
    }),
)

jest.mock('hooks/useGetDateAndTimeFormat', () => ({
    __esModule: true,
    useGetDateAndTimeFormat: () => 'MMM d, yyyy h:mm a',
}))

describe('SkillEditorHeader', () => {
    const defaultProps = {
        title: 'My Skill',
        onBack: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the title in read-only mode', () => {
        render(<SkillEditorHeader {...defaultProps} />)

        expect(screen.getByText('My Skill')).toBeInTheDocument()
    })

    it('renders back button and calls onBack when clicked', async () => {
        const user = userEvent.setup()
        render(<SkillEditorHeader {...defaultProps} />)

        await user.click(
            screen.getByRole('button', { name: /back to skills/i }),
        )

        expect(defaultProps.onBack).toHaveBeenCalled()
    })

    it('renders an editable title when onChangeTitle is provided', () => {
        render(
            <SkillEditorHeader {...defaultProps} onChangeTitle={jest.fn()} />,
        )

        expect(screen.getByRole('textbox', { name: /title/i })).toHaveValue(
            'My Skill',
        )
    })

    it('renders children in the actions area', () => {
        render(
            <SkillEditorHeader {...defaultProps}>
                <button>Publish</button>
            </SkillEditorHeader>,
        )

        expect(
            screen.getByRole('button', { name: /publish/i }),
        ).toBeInTheDocument()
    })

    it('renders saving indicator when isSaving is true', () => {
        render(
            <SkillEditorHeader
                {...defaultProps}
                onChangeTitle={jest.fn()}
                isSaving
            />,
        )

        expect(screen.getByText('Saving')).toBeInTheDocument()
    })

    it('renders error icon when autoSaveError is true and editable', () => {
        render(
            <SkillEditorHeader
                {...defaultProps}
                onChangeTitle={jest.fn()}
                autoSaveError
            />,
        )

        expect(
            screen.getByRole('img', { name: /cloud-off/i }),
        ).toBeInTheDocument()
    })

    it('renders success icon when lastUpdatedDatetime is provided and editable', () => {
        render(
            <SkillEditorHeader
                {...defaultProps}
                onChangeTitle={jest.fn()}
                lastUpdatedDatetime={new Date('2024-03-15T00:00:00Z')}
            />,
        )

        expect(
            screen.getByRole('img', { name: /cloud-check/i }),
        ).toBeInTheDocument()
    })

    describe('preview mode (isPreview=true)', () => {
        it('hides the back button when isPreview is true', () => {
            render(<SkillEditorHeader {...defaultProps} isPreview />)

            expect(
                screen.queryByRole('button', { name: /back to skills/i }),
            ).not.toBeInTheDocument()
        })

        it('still renders the title in preview mode', () => {
            render(<SkillEditorHeader {...defaultProps} isPreview />)

            expect(screen.getByText('My Skill')).toBeInTheDocument()
        })

        it('still renders children in preview mode', () => {
            render(
                <SkillEditorHeader {...defaultProps} isPreview>
                    <button>Publish</button>
                </SkillEditorHeader>,
            )

            expect(
                screen.getByRole('button', { name: /publish/i }),
            ).toBeInTheDocument()
        })
    })
})
