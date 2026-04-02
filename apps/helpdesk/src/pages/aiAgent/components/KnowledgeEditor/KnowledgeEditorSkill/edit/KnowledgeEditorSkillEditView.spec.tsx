import { render, screen } from '@testing-library/react'

import { KnowledgeEditorSkillEditView } from './KnowledgeEditorSkillEditView'

jest.mock('pages/aiAgent/components/GuidanceEditor/GuidanceEditor', () => ({
    GuidanceEditor: () => <div>Guidance Editor</div>,
}))

describe('KnowledgeEditorSkillEditView', () => {
    it('renders the guidance editor', () => {
        render(
            <KnowledgeEditorSkillEditView
                content="<p>test</p>"
                onChangeContent={jest.fn()}
                shopName="test-shop"
            />,
        )

        expect(screen.getByText('Guidance Editor')).toBeInTheDocument()
    })
})
