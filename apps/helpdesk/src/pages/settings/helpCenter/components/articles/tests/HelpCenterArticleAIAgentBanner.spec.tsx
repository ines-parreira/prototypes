import React from 'react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'

import { HelpCenterArticleAIAgentBanner } from '../HelpCenterArticleAIAgentBanner'

jest.mock('hooks/useAppSelector')

const mockUseAppSelector = useAppSelector as jest.Mock

describe('<HelpCenterArticleAIAgentBanner />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders nothing when user does not have automate plan', () => {
        mockUseAppSelector.mockReturnValue(false)

        const { container } = render(
            <HelpCenterArticleAIAgentBanner
                articleId={42}
                shopName="test-shop"
            />,
        )

        expect(container.innerHTML).toBe('')
    })

    it('renders nothing when shopName is null', () => {
        mockUseAppSelector.mockReturnValue(true)

        const { container } = render(
            <HelpCenterArticleAIAgentBanner articleId={42} shopName={null} />,
        )

        expect(container.innerHTML).toBe('')
    })

    it('renders banner with link to Knowledge Hub when hasAutomate and shopName are truthy', () => {
        mockUseAppSelector.mockReturnValue(true)

        render(
            <MemoryRouter>
                <HelpCenterArticleAIAgentBanner
                    articleId={42}
                    shopName="test-shop"
                />
            </MemoryRouter>,
        )

        expect(
            screen.getByText(/to enable or disable this article for ai agent/i),
        ).toBeInTheDocument()

        const link = screen.getByRole('link', { name: /knowledge hub/i })
        expect(link).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/test-shop/knowledge/faq/42',
        )
    })
})
