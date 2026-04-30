import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorTopBarTitle } from './KnowledgeEditorTopBarTitle'

jest.mock('pages/aiAgent/KnowledgeHub/Table/TruncatedTextWithTooltip', () => ({
    TruncatedTextWithTooltip: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
}))

describe('KnowledgeEditorTopBarTitle', () => {
    it('renders read-only title when no onChangeTitle is provided', () => {
        render(<KnowledgeEditorTopBarTitle title="My Article" />)

        expect(screen.getByText('My Article')).toBeInTheDocument()
    })

    it('renders editable input when onChangeTitle is provided', () => {
        render(
            <KnowledgeEditorTopBarTitle
                title="My Article"
                onChangeTitle={jest.fn()}
            />,
        )

        expect(screen.getByRole('textbox')).toHaveValue('My Article')
    })

    it('shows placeholder when title is empty', () => {
        render(
            <KnowledgeEditorTopBarTitle title="" onChangeTitle={jest.fn()} />,
        )

        expect(screen.getByText('Untitled')).toBeInTheDocument()
    })

    it('calls onChangeTitle when input value changes', async () => {
        const user = userEvent.setup()
        const onChangeTitle = jest.fn()

        render(
            <KnowledgeEditorTopBarTitle
                title="Title"
                onChangeTitle={onChangeTitle}
            />,
        )

        await user.type(screen.getByRole('textbox'), '!')

        expect(onChangeTitle).toHaveBeenCalled()
    })

    it('focuses the input on mount when title is empty', () => {
        render(
            <KnowledgeEditorTopBarTitle title="" onChangeTitle={jest.fn()} />,
        )

        expect(screen.getByRole('textbox')).toHaveFocus()
    })

    it('does not focus the input on mount when title has a value', () => {
        render(
            <KnowledgeEditorTopBarTitle
                title="Existing Title"
                onChangeTitle={jest.fn()}
            />,
        )

        expect(screen.getByRole('textbox')).not.toHaveFocus()
    })
})
