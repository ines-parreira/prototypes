import { fireEvent, render, screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import { IntegrationType } from 'models/integration/types'
import { Tab } from 'pages/integrations/integration/types'
import { hideShopifyCheckoutChatBanner } from 'state/integrations/actions'
import * as actionTypes from 'state/integrations/constants'

import GorgiasChatShopifyCheckoutChatBanner from '../GorgiasChatShopifyCheckoutChatBanner'

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(),
}))

jest.mock('state/integrations/actions', () => ({
    hideShopifyCheckoutChatBanner: jest.fn(),
}))

describe('<GorgiasChatShopifyCheckoutBanner />', () => {
    const mockDispatch = jest.fn()
    const integrationMock = {
        get: jest.fn(),
    } as unknown as Map<any, any>

    beforeEach(() => {
        ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
        ;(hideShopifyCheckoutChatBanner as jest.Mock).mockReturnValue({
            type: actionTypes.HIDE_SHOPIFY_CHECKOUT_CHAT_BANNER,
        })
        ;(integrationMock.get as jest.Mock).mockReturnValue('1')
    })

    it('should render the banner with correct message and CTA', () => {
        // When
        render(
            <MemoryRouter>
                <GorgiasChatShopifyCheckoutChatBanner
                    integration={integrationMock}
                />
            </MemoryRouter>,
        )

        // Then
        expect(
            screen.getByText(
                'Chat is available on Shopify Checkout and Thank you pages!',
            ),
        ).toBeInTheDocument()
        const ctaLink = screen.getByText('Add To Checkout')
        expect(ctaLink).toBeInTheDocument()
        expect(ctaLink).toHaveAttribute(
            'href',
            `/app/settings/channels/${IntegrationType.GorgiasChat}/1/${Tab.Installation}`,
        )
    })

    it('should call dispatch to hide the banner when onClose is triggered', () => {
        // When
        render(
            <MemoryRouter>
                <GorgiasChatShopifyCheckoutChatBanner
                    integration={integrationMock}
                />
            </MemoryRouter>,
        )

        const closeButton = screen.getByRole('button', { name: /close/i })
        fireEvent.click(closeButton)

        // Then
        expect(mockDispatch).toHaveBeenCalledWith(
            hideShopifyCheckoutChatBanner(),
        )
    })

    it('should handle missing integration ID gracefully', () => {
        // Given
        ;(integrationMock.get as jest.Mock).mockReturnValue(undefined)

        // When
        render(
            <MemoryRouter>
                <GorgiasChatShopifyCheckoutChatBanner
                    integration={integrationMock}
                />
            </MemoryRouter>,
        )

        // Then
        expect(
            screen.queryByText(
                'Chat is available on Shopify Checkout and Thank you pages!',
            ),
        ).not.toBeInTheDocument()
    })
})
