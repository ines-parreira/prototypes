import { render, screen } from '@testing-library/react'

import { KnowledgeEditorGuidanceDiffView } from './KnowledgeEditorGuidanceDiffView'

jest.mock('./DiffReadOnlyEditor', () => ({
    DiffReadOnlyEditor: () => <div data-testid="diff-read-only-editor" />,
}))

describe('KnowledgeEditorGuidanceDiffView', () => {
    it('renders the diff editor content', () => {
        render(
            <KnowledgeEditorGuidanceDiffView
                oldTitle="Old title"
                oldContent="<p>Old content</p>"
                newTitle="New title"
                newContent="<p>New content</p>"
            />,
        )

        expect(screen.getByTestId('diff-read-only-editor')).toBeInTheDocument()
    })
})
