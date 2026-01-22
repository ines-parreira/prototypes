import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OpportunityType } from '../../enums'
import type { Opportunity } from '../../types'
import { OpportunitySnippetEditor } from './OpportunitySnippetEditor'

const mockOpportunity: Opportunity = {
    id: '123',
    key: 'ai_123',
    type: OpportunityType.FILL_KNOWLEDGE_GAP,
    title: 'Test Snippet',
    content: 'Test snippet content',
    ticketCount: 5,
}

describe('OpportunitySnippetEditor', () => {
    const defaultProps = {
        opportunity: mockOpportunity,
        source: 'test-source',
    }

    it('should render snippet content', () => {
        render(<OpportunitySnippetEditor {...defaultProps} />)

        expect(screen.getByText('Test snippet content')).toBeInTheDocument()
    })

    it('should render enable button when visible', () => {
        render(<OpportunitySnippetEditor {...defaultProps} isVisible />)

        expect(
            screen.getByRole('button', { name: /disable/i }),
        ).toBeInTheDocument()
    })

    it('should render disable button when not visible', () => {
        render(<OpportunitySnippetEditor {...defaultProps} isVisible={false} />)

        expect(
            screen.getByRole('button', { name: /enable/i }),
        ).toBeInTheDocument()
    })

    it('should call onValuesChange when toggling visibility', async () => {
        const user = userEvent.setup()
        const onValuesChange = jest.fn()

        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                isVisible
                onValuesChange={onValuesChange}
            />,
        )

        const disableButton = screen.getByRole('button', { name: /disable/i })
        await user.click(disableButton)

        expect(onValuesChange).toHaveBeenCalledWith({
            isVisible: false,
        })
    })

    it('should toggle from disabled to enabled', async () => {
        const user = userEvent.setup()
        const onValuesChange = jest.fn()

        render(
            <OpportunitySnippetEditor
                {...defaultProps}
                isVisible={false}
                onValuesChange={onValuesChange}
            />,
        )

        const enableButton = screen.getByRole('button', { name: /enable/i })
        await user.click(enableButton)

        expect(onValuesChange).toHaveBeenCalledWith({
            isVisible: true,
        })
    })

    it('should render source information', () => {
        render(<OpportunitySnippetEditor {...defaultProps} />)

        expect(screen.getByText('test-source')).toBeInTheDocument()
    })
})
