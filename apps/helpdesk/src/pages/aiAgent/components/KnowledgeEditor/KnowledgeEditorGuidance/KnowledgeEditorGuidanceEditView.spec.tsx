import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { KnowledgeEditorGuidanceEditView } from 'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorGuidance/KnowledgeEditorGuidanceEditView'
import { mockStore } from 'utils/testing'

describe('KnowledgeEditorGuidanceEditView', () => {
    it('renders', () => {
        const { container } = render(
            <Provider store={mockStore({})}>
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
                />
            </Provider>,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        expect(editorContent?.textContent).toBe('Test Content')
    })
})
