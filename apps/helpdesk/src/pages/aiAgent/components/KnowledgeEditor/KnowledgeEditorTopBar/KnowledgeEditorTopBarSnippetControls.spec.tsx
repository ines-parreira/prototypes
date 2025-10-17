import { render, screen } from '@testing-library/react'

import { KnowledgeEditorTopBarSnippetControls } from './KnowledgeEditorTopBarSnippetControls'

describe('KnowledgeEditorTopBarSnippetControls', () => {
    const onTest = jest.fn()
    it('renders read mode', () => {
        render(<KnowledgeEditorTopBarSnippetControls onTest={onTest} />)

        expect(screen.getByText('Edit')).toBeDisabled()
    })
})
