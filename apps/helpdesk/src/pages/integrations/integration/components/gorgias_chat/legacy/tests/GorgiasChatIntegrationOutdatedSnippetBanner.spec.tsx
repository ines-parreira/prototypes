import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { IntegrationType } from 'models/integration/types'
import { Tab } from 'pages/integrations/integration/types'

import GorgiasChatIntegrationOutdatedSnippetBanner from '../GorgiasChatIntegrationOutdatedSnippetBanner'

describe('GorgiasChatIntegrationOutdatedSnippetBanner', () => {
    it('should render theme extension migration banner with correct content and link', () => {
        const mockIntegration = fromJS({
            id: 'test-integration-id',
            type: IntegrationType.GorgiasChat,
            meta: {
                shop_integration_id: 1,
            },
        })

        const { getByText } = render(
            <MemoryRouter>
                <GorgiasChatIntegrationOutdatedSnippetBanner
                    integration={mockIntegration}
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

        const linkElement = ctaButton.closest('a')
        expect(linkElement).toHaveAttribute(
            'href',
            `/app/settings/channels/${IntegrationType.GorgiasChat}/test-integration-id/${Tab.Installation}`,
        )
    })
})
