import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import history from 'pages/history'
import { assumeMock } from 'utils/testing'

import { IngestionLogStatus } from '../constant'
import { useIngestionDomainBannerDismissed } from '../hooks/useIngestionDomainBannerDismissed'
import SyncIngestionDomainBanner from '../SyncIngestionDomainBanner'

jest.mock('pages/history')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('../hooks/useIngestionDomainBannerDismissed')

const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)
const mockUseIngestionDomainBannerDismissed = assumeMock(
    useIngestionDomainBannerDismissed,
)

describe('SyncIngestionDomainBanner', () => {
    const mockedShopName = 'test-shop'
    const mockedDismissBanner = jest.fn()

    const defaultProps = {
        shopName: mockedShopName,
        isSourcePage: false,
    }

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                main: '/main',
                pagesContent: '/pages-content',
            },
            navigationItems: [],
        } as unknown as ReturnType<typeof useAiAgentNavigation>)
        mockUseIngestionDomainBannerDismissed.mockReturnValue({
            isDismissed: false,
            dismissBanner: mockedDismissBanner,
        } as unknown as ReturnType<typeof useIngestionDomainBannerDismissed>)
    })

    it('does not render when status is null', () => {
        render(
            <SyncIngestionDomainBanner
                {...defaultProps}
                syncStoreDomainStatus={null}
            />,
        )
        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not render when banner is dismissed', () => {
        mockUseIngestionDomainBannerDismissed.mockReturnValue({
            isDismissed: true,
            dismissBanner: jest.fn(),
        } as unknown as ReturnType<typeof useIngestionDomainBannerDismissed>)

        render(
            <SyncIngestionDomainBanner
                {...defaultProps}
                syncStoreDomainStatus={IngestionLogStatus.Pending}
            />,
        )

        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('renders pending banner', () => {
        render(
            <SyncIngestionDomainBanner
                {...defaultProps}
                syncStoreDomainStatus={IngestionLogStatus.Pending}
            />,
        )

        expect(
            screen.getByText(/Your store website is syncing/i),
        ).toBeInTheDocument()
    })

    it('renders success banner and shows Review button if isSourcePage is true', () => {
        render(
            <SyncIngestionDomainBanner
                {...defaultProps}
                isSourcePage={true}
                syncStoreDomainStatus={IngestionLogStatus.Successful}
            />,
        )

        expect(
            screen.getByText(/Your store website has been synced/i),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /review/i }),
        ).toBeInTheDocument()
    })

    it('calls history.push when Review button is clicked', () => {
        render(
            <SyncIngestionDomainBanner
                {...defaultProps}
                isSourcePage={true}
                syncStoreDomainStatus={IngestionLogStatus.Successful}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: /review/i }))
        expect(history.push).toHaveBeenCalledWith('/pages-content')
    })

    it('renders failed banner', () => {
        render(
            <SyncIngestionDomainBanner
                {...defaultProps}
                syncStoreDomainStatus={IngestionLogStatus.Failed}
            />,
        )

        expect(
            screen.getByText(/We couldn’t sync your store website/i),
        ).toBeInTheDocument()
    })
})
