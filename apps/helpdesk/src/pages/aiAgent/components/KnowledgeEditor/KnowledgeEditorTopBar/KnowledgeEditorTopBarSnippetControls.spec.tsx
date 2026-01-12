import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { KnowledgeEditorTopBarSnippetControls } from './KnowledgeEditorTopBarSnippetControls'

describe('KnowledgeEditorTopBarSnippetControls', () => {
    const onTest = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders read mode with disabled edit button', () => {
        render(<KnowledgeEditorTopBarSnippetControls onTest={onTest} />)

        expect(screen.getByRole('button', { name: /edit/i })).toBeDisabled()
    })

    it('should render Test button when isPlaygroundOpen is false', () => {
        render(
            <KnowledgeEditorTopBarSnippetControls
                onTest={onTest}
                isPlaygroundOpen={false}
            />,
        )

        expect(
            screen.getByRole('button', { name: /test/i }),
        ).toBeInTheDocument()
    })

    it('should hide Test button when isPlaygroundOpen is true', () => {
        render(
            <KnowledgeEditorTopBarSnippetControls
                onTest={onTest}
                isPlaygroundOpen={true}
            />,
        )

        expect(
            screen.queryByRole('button', { name: /test/i }),
        ).not.toBeInTheDocument()
    })

    it('should call onTest when Test button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <KnowledgeEditorTopBarSnippetControls
                onTest={onTest}
                isPlaygroundOpen={false}
            />,
        )

        await user.click(screen.getByRole('button', { name: /test/i }))

        expect(onTest).toHaveBeenCalledTimes(1)
    })

    it('should render Test button by default when isPlaygroundOpen is not provided', () => {
        render(<KnowledgeEditorTopBarSnippetControls onTest={onTest} />)

        expect(
            screen.getByRole('button', { name: /test/i }),
        ).toBeInTheDocument()
    })
})
