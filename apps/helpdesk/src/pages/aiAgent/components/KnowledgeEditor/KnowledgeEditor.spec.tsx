import { render, screen } from '@testing-library/react'

import { KnowledgeEditor } from './KnowledgeEditor'

jest.mock('./KnowledgeEditorGuidance/KnowledgeEditorGuidance', () => ({
    KnowledgeEditorGuidance: jest.fn(() => <div>KnowledgeEditorGuidance</div>),
}))

describe('KnowledgeEditor', () => {
    it('renders', () => {
        render(
            <KnowledgeEditor
                shopName="Test Shop"
                shopType="Test Shop Type"
                guidanceArticleId={1}
                onClose={jest.fn()}
                onClickPrevious={jest.fn()}
                onClickNext={jest.fn()}
                guidanceMode="read"
                isOpen
            />,
        )

        expect(screen.getByText('KnowledgeEditorGuidance')).toBeInTheDocument()
    })
})
