import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useJourneyContext } from 'AIJourney/providers'

import { ShopifyCard } from './ShopifyCard'

jest.mock('AIJourney/providers', () => ({
    useJourneyContext: jest.fn(),
}))

const mockUseJourneyContext = useJourneyContext as jest.Mock

describe('<ShopifyCard />', () => {
    beforeEach(() => {
        mockUseJourneyContext.mockReturnValue({ shopName: 'artemisathletix' })
    })

    it('should render the Shopify card title and description', () => {
        render(<ShopifyCard />)

        expect(
            screen.getByRole('heading', { name: 'Shopify' }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'AI Journey uses the product catalog synced from Shopify to AI Agent, including inventory, variants, descriptions, and product page links.',
            ),
        ).toBeInTheDocument()
    })

    it('should render a link to the AI Agent products page scoped to the current shop, opening in a new tab', () => {
        render(<ShopifyCard />)

        const link = screen.getByRole('link', {
            name: /view product catalog in ai agent/i,
        })

        expect(link).toHaveAttribute(
            'href',
            '/app/ai-agent/shopify/artemisathletix/products',
        )
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
})
