import React from 'react'
import {render, screen} from '@testing-library/react'
import {IntegrationType} from 'models/integration/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import {AiAgentStatsEmptyState} from '../AiAgentStatsEmptyState'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
const useStoreIntegrationsMock = useStoreIntegrations as jest.Mock

jest.mock('utils', () => {
    const utils: Record<string, unknown> = jest.requireActual('utils')
    return {
        ...utils,
        assetsUrl: jest.fn((path: string) => `/my-assets-path${path}`),
    }
})

describe('AiAgentStatsEmptyState', () => {
    const renderComponent = ({
        storeIntegrations = [],
    }: {
        storeIntegrations?: Array<{
            type: IntegrationType
            meta: {shop_name: string}
        }>
    } = {}) => {
        useStoreIntegrationsMock.mockReturnValue(storeIntegrations)
        return render(<AiAgentStatsEmptyState />)
    }

    it('correctly renders the component', () => {
        renderComponent({
            storeIntegrations: [
                {
                    type: IntegrationType.BigCommerce,
                    meta: {shop_name: 'my-big-commerce-store'},
                },
                {
                    type: IntegrationType.Shopify,
                    meta: {shop_name: 'my-shopify-store'},
                },
            ],
        })

        const button = screen.getByRole('button', {name: /Set Up AI Agent/i})

        expect(screen.getByText('AI Agent Statistics')).toBeInTheDocument()
        expect(button).toBeInTheDocument()
        expect(button.closest('a')).toHaveAttribute(
            'to',
            '/app/automation/shopify/my-shopify-store/ai-agent'
        )

        expect(screen.getByAltText('AI Agent stats example')).toHaveAttribute(
            'src',
            '/my-assets-path/img/paywalls/screens/ai_agent_stats_empty_state.png'
        )
    })

    it('renders the default CTA link if no Shopify integration is present', () => {
        renderComponent({
            storeIntegrations: [
                {
                    type: IntegrationType.BigCommerce,
                    meta: {shop_name: 'my-big-commerce-store'},
                },
                {
                    type: IntegrationType.Magento2,
                    meta: {shop_name: 'my-magento-store'},
                },
            ],
        })

        const button = screen.getByRole('button', {name: /Set Up AI Agent/i})
        expect(button.closest('a')).toHaveAttribute('to', '/app/automation/')
    })
})
