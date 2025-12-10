import { render } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import { KnowledgeEditorGuidanceReadView } from './KnowledgeEditorGuidanceReadView'

describe('KnowledgeEditorGuidanceReadView', () => {
    it('renders', () => {
        const { container } = render(
            <Provider store={mockStore({})}>
                <KnowledgeEditorGuidanceReadView
                    content="Test Content"
                    title="Test Title"
                    availableActions={[
                        {
                            name: 'Test action',
                            value: 'test-action',
                        },
                    ]}
                    availableVariables={[
                        {
                            name: 'Shopify',
                            variables: [
                                {
                                    name: 'Tags',
                                    value: '&&&customer.customer_tags&&&',
                                    category: 'customer',
                                },
                            ],
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
