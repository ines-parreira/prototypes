import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { IntegrationType } from 'models/integration/types'
import { Tab } from 'pages/integrations/integration/types'

import GorgiasChatIntegrationHeader from '../GorgiasChatIntegrationHeader'
import useChatMigrationBanner from '../hooks/useChatMigrationBanner'

jest.mock('../hooks/useChatMigrationBanner')
jest.mock('../GorgiasChatIntegrationNavigation', () => () => null)
jest.mock('../GorgiasChatShopifyCheckoutChatBanner', () => () => null)

jest.mock('hooks/useAppSelector', () => ({
    __esModule: true,
    default: jest.fn((selector) => {
        if (selector.name === 'getChatInstallationStatus') {
            return { installed: true }
        }
        return false
    }),
}))

jest.mock('../hooks/useShouldShowShopifyCheckoutChatBanner', () => ({
    useShouldShowShopifyCheckoutChatBanner: () => false,
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus',
    () => ({
        useInstallationStatus: () => ({
            installed: true,
            installedOnShopifyCheckout: false,
            embeddedSpqInstalled: false,
            minimumSnippetVersion: null,
        }),
    }),
)

describe('GorgiasChatIntegrationHeader', () => {
    it('should show theme extensions migration banner when conditions are met', () => {
        const mockIntegration = fromJS({
            id: 'test-integration-id',
            type: IntegrationType.GorgiasChat,
            meta: {
                shop_integration_id: 1,
            },
        })

        ;(useChatMigrationBanner as jest.Mock).mockReturnValue({
            showThemeExtensionsMigrationBanner: true,
            hasShopifyScriptTagScope: true,
        })

        const { getByText } = render(
            <MemoryRouter>
                <GorgiasChatIntegrationHeader
                    integration={mockIntegration}
                    tab={Tab.Installation}
                />
            </MemoryRouter>,
        )

        expect(
            getByText(
                'Use Shopify Theme extensions for the best chat experience—faster, more reliable, and ready for upcoming features',
            ),
        ).toBeInTheDocument()

        const ctaButton = getByText('Switch to Theme extensions')
        expect(ctaButton).toBeInTheDocument()
    })
})
