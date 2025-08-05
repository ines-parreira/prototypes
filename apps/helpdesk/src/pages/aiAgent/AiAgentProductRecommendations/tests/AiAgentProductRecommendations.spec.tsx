import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { GetProductRecommendationRules } from '@gorgias/knowledge-service-client'

import { useGetRulesProductRecommendation } from 'models/knowledgeService/queries'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import { AiAgentProductRecommendations } from '../AiAgentProductRecommendations'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ shopName: 'test-shop' }),
}))

jest.mock('pages/aiAgent/components/AiAgentLayout/AiAgentLayout', () => ({
    AiAgentLayout: jest.fn(({ shopName, title, children }) => (
        <div>
            <div>
                Layout Mock - Shop: {shopName}, Title: {title}
            </div>
            {children}
        </div>
    )),
}))

jest.mock('pages/common/hooks/useShopifyIntegrationAndScope')
const mockUseShopifyIntegrationAndScope =
    useShopifyIntegrationAndScope as jest.Mock

jest.mock('models/knowledgeService/queries')
const mockUseGetRulesProductRecommendation =
    useGetRulesProductRecommendation as jest.Mock

const renderComponent = (
    options: {
        promotedProducts?: number[]
        promotedTags?: string[]
        excludedProducts?: number[]
        excludedTags?: string[]
        integrationId?: number | null
        isLoadingRules?: boolean
    } = {},
) => {
    const {
        promotedProducts = [2, 7, 10, 12],
        promotedTags = [
            'Gym Gear',
            'Moisture-Wicking',
            'Four-Way Stretch',
            'Speed Training',
        ],
        excludedProducts = [1, 6, 9, 11, 15],
        excludedTags = ['Yoga Clothing', 'Slim Fit', 'Performance Mesh'],
        integrationId = 123,
        isLoadingRules = false,
    } = options

    const rules: GetProductRecommendationRules = {
        promoted: [],
        excluded: [],
    }

    if (promotedProducts.length > 0) {
        rules.promoted.push({
            type: 'product',
            items: promotedProducts.map((product) => ({
                target: product.toString(),
            })),
        })
    }

    if (promotedTags.length > 0) {
        rules.promoted.push({
            type: 'tag',
            items: promotedTags.map((tag) => ({ target: tag })),
        })
    }

    if (excludedProducts.length > 0) {
        rules.excluded.push({
            type: 'product',
            items: excludedProducts.map((product) => ({
                target: product.toString(),
            })),
        })
    }

    if (excludedTags.length > 0) {
        rules.excluded.push({
            type: 'tag',
            items: excludedTags.map((tag) => ({ target: tag })),
        })
    }

    mockUseShopifyIntegrationAndScope.mockReturnValue({
        integrationId,
    })

    mockUseGetRulesProductRecommendation.mockReturnValue({
        data: isLoadingRules ? undefined : rules,
    })

    return render(
        <MemoryRouter>
            <AiAgentProductRecommendations />
        </MemoryRouter>,
    )
}

describe('AiAgentProductRecommendations', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component correctly', () => {
        const screen = renderComponent()

        expect(
            screen.queryByText(
                'Layout Mock - Shop: test-shop, Title: Product Recommendations',
            ),
        ).toBeInTheDocument()
        expect(screen.queryByText('Promote products')).toBeInTheDocument()
        expect(screen.queryByText('Exclude products')).toBeInTheDocument()

        const buttons = screen.getAllByRole('button')
        expect(buttons[0]).toHaveTextContent('Manage')
        expect(buttons[1]).toHaveTextContent('Manage')
    })

    it('should render the buttons with correct text 1', () => {
        const screen = renderComponent({
            promotedProducts: [],
            promotedTags: [],
        })

        expect(screen.queryByText('Promote products')).toBeInTheDocument()
        expect(screen.queryByText('Exclude products')).toBeInTheDocument()

        const buttons = screen.getAllByRole('button')
        expect(buttons[0]).toHaveTextContent('Set Up')
        expect(buttons[1]).toHaveTextContent('Manage')
    })

    it('should render the buttons with correct text 2', () => {
        const screen = renderComponent({
            excludedProducts: [],
            excludedTags: [],
        })

        expect(screen.queryByText('Promote products')).toBeInTheDocument()
        expect(screen.queryByText('Exclude products')).toBeInTheDocument()

        const buttons = screen.getAllByRole('button')
        expect(buttons[0]).toHaveTextContent('Manage')
        expect(buttons[1]).toHaveTextContent('Set Up')
    })

    it('should render the buttons with correct text 3', () => {
        const screen = renderComponent({
            promotedProducts: [],
            promotedTags: [],
            excludedProducts: [],
            excludedTags: [],
        })

        expect(screen.queryByText('Promote products')).toBeInTheDocument()
        expect(screen.queryByText('Exclude products')).toBeInTheDocument()

        const buttons = screen.getAllByRole('button')
        expect(buttons[0]).toHaveTextContent('Set Up')
        expect(buttons[1]).toHaveTextContent('Set Up')
    })

    it('should render loading state correctly', () => {
        const screen = renderComponent({
            isLoadingRules: true,
        })

        expect(
            screen.queryByText(
                'Layout Mock - Shop: test-shop, Title: Product Recommendations',
            ),
        ).toBeInTheDocument()
        expect(screen.queryByText('Promote products')).toBeInTheDocument()
        expect(screen.queryByText('Exclude products')).toBeInTheDocument()

        const buttons = screen.queryAllByRole('button')
        expect(buttons.length).toBe(0)
    })
})
