import { render } from '@repo/testing'

import { KnowledgeEditorGuidanceReadView } from './KnowledgeEditorGuidanceReadView'

describe('KnowledgeEditorGuidanceReadView', () => {
    it('renders', () => {
        const { container } = render(
            <KnowledgeEditorGuidanceReadView
                content="Test Content"
                title="Test Title"
                shopName="test-shop"
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
            />,
        )

        const editorContent = container.querySelector(
            '.public-DraftEditor-content',
        )
        expect(editorContent?.textContent).toBe('Test Content')
    })
})
