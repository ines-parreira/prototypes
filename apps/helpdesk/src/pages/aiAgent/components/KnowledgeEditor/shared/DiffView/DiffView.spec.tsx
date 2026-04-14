import { render, screen } from '@testing-library/react'

import { DiffView } from './DiffView'

jest.mock(
    'common/knowledge-editor/components/DiffReadOnlyEditor/DiffReadOnlyEditor',
    () => ({
        DiffReadOnlyEditor: () => <div data-testid="diff-read-only-editor" />,
    }),
)

describe('DiffView', () => {
    it('renders the diff editor content', () => {
        render(
            <DiffView
                oldTitle="Old title"
                oldContent="<p>Old content</p>"
                newTitle="New title"
                newContent="<p>New content</p>"
            />,
        )

        expect(screen.getByTestId('diff-read-only-editor')).toBeInTheDocument()
    })
})
