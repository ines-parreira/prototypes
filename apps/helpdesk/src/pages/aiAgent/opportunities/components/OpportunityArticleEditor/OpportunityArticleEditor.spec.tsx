import { render, screen } from '@testing-library/react'

import { OpportunityType } from '../../enums'
import type { Opportunity } from '../../types'
import { OpportunityArticleEditor } from './OpportunityArticleEditor'

jest.mock('pages/common/forms/TextArea', () => ({
    __esModule: true,
    default: ({ label, value, onChange, isDisabled }: any) => (
        <div>
            {label && <label htmlFor="article-body">{label}</label>}
            <textarea
                id="article-body"
                data-testid="article-body"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={isDisabled}
            />
        </div>
    ),
}))

const mockOpportunity: Opportunity = {
    id: '123',
    key: 'ai_123',
    type: OpportunityType.FILL_KNOWLEDGE_GAP,
    title: 'Test Article Title',
    content: 'Test article body content',
    ticketCount: 5,
}

describe('OpportunityArticleEditor', () => {
    const defaultProps = {
        opportunity: mockOpportunity,
    }

    it('should render article editor heading', () => {
        render(<OpportunityArticleEditor {...defaultProps} />)

        expect(screen.getByText('Help Center article')).toBeInTheDocument()
    })

    it('should render body field with content', () => {
        render(<OpportunityArticleEditor {...defaultProps} />)

        const bodyTextarea = screen.getByLabelText('Body')
        expect(bodyTextarea).toHaveValue('Test article body content')
    })

    it('should disable body textarea when isVisible is false', () => {
        render(<OpportunityArticleEditor {...defaultProps} isVisible={false} />)

        const bodyTextarea = screen.getByLabelText('Body')
        expect(bodyTextarea).toBeDisabled()
    })
})
