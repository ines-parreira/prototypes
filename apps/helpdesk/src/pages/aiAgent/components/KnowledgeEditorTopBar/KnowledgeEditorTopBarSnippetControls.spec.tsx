import { render, screen } from '@testing-library/react'

import { KnowledgeEditorTopBarSnippetControls } from './KnowledgeEditorTopBarSnippetControls'

describe('KnowledgeEditorTopBarSnippetControls', () => {
    it('renders read mode', () => {
        render(<KnowledgeEditorTopBarSnippetControls />)

        expect(screen.getByText('Edit')).toBeDisabled()
    })
})
