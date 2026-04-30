import { render } from '@repo/testing'

import { KnowledgeEditorGuidanceEditView } from './KnowledgeEditorGuidanceEditView'

describe('KnowledgeEditorGuidanceEditView', () => {
    it('renders', () => {
        const { container } = render(
            <KnowledgeEditorGuidanceEditView
                content="Test Content"
                onChangeContent={jest.fn()}
                title="Test title"
                onChangeTitle={jest.fn()}
                shopName="Test shop"
                availableActions={[
                    {
                        name: 'Test action',
                        value: 'test-action',
                    },
                ]}
            />,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        expect(editorContent?.textContent).toBe('Test Content')
    })
})
