import { render, screen } from '@testing-library/react'
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
})
