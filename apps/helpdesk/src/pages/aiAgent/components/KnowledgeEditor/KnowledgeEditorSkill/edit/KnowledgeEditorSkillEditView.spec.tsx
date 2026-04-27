import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { GuidanceEditor } from 'pages/aiAgent/components/GuidanceEditor/GuidanceEditor'

import { KnowledgeEditorSkillEditView } from './KnowledgeEditorSkillEditView'

jest.mock('pages/aiAgent/components/GuidanceEditor/GuidanceEditor', () => ({
    GuidanceEditor: jest.fn(() => <div>Guidance Editor</div>),
}))

const MockGuidanceEditor = GuidanceEditor as jest.Mock

describe('KnowledgeEditorSkillEditView', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

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

    it('passes editorContextName="Skill" to GuidanceEditor', () => {
        render(
            <KnowledgeEditorSkillEditView
                content="<p>test</p>"
                onChangeContent={jest.fn()}
                shopName="test-shop"
            />,
        )

        expect(MockGuidanceEditor).toHaveBeenCalledWith(
            expect.objectContaining({ editorContextName: 'Skill' }),
            expect.anything(),
        )
    })
})
