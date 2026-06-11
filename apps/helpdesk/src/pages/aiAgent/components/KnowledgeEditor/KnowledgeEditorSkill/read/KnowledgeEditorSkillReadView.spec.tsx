import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { KnowledgeEditorSkillReadView } from './KnowledgeEditorSkillReadView'

jest.mock('pages/common/draftjs/plugins/toolbar/ToolbarProvider', () => ({
    __esModule: true,
    ToolbarProvider: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))
jest.mock('pages/common/forms/RichField/RichField', () => ({
    __esModule: true,
    RichField: () => <div>Rich Field</div>,
}))

describe('KnowledgeEditorSkillReadView', () => {
    it('renders the rich field', () => {
        render(<KnowledgeEditorSkillReadView content="<p>test</p>" />)

        expect(screen.getByText('Rich Field')).toBeInTheDocument()
    })
})
