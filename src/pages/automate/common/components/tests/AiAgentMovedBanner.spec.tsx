import {render, screen, fireEvent} from '@testing-library/react'
import React from 'react'

import {BannersContextProvider} from 'AlertBanners'
import * as Storage from 'AlertBanners/Storage'

import {banner} from '../../hooks/useDisplayAiAgentMovedBanner'
import {AiAgentMovedBanner} from '../AiAgentMovedBanner'

jest.mock('AlertBanners/Storage', () => ({
    useDismissedStorage: jest.fn(),
}))

describe('AiAgentMovedBanner', () => {
    const mockSetDismissed = jest.fn()
    const mockIsBannerDismissed = jest.fn()

    beforeEach(() => {
        ;(Storage.useDismissedStorage as jest.Mock).mockReturnValue({
            setDismissed: mockSetDismissed,
            isBannerDismissed: mockIsBannerDismissed,
        })
        mockIsBannerDismissed.mockReturnValue(false)
    })

    const renderBanner = () => {
        return render(
            <BannersContextProvider>
                <AiAgentMovedBanner />
            </BannersContextProvider>
        )
    }

    it('renders the banner when not dismissed', () => {
        renderBanner()
        expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('does not render the banner when dismissed', () => {
        mockIsBannerDismissed.mockReturnValue(true)
        renderBanner()
        expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    })

    it('calls setDismissed with correct parameters when closing the banner', () => {
        renderBanner()
        const closeButton = screen.getByRole('button')
        fireEvent.click(closeButton)

        expect(mockSetDismissed).toHaveBeenCalledWith(
            banner.category,
            banner.instanceId
        )
    })

    it('checks dismissal status with correct parameters', () => {
        renderBanner()
        expect(mockIsBannerDismissed).toHaveBeenCalledWith(
            banner.category,
            banner.instanceId
        )
    })
})
