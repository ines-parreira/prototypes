import React from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen } from '@testing-library/react'

import {
    IngestionLogStatus,
    PAGE_NAME,
} from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import history from 'pages/history'

import SyncIngestionDomainBanner from '../SyncIngestionDomainBanner'

jest.mock('pages/history')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock(
    'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed',
)

const mockUseAiAgentNavigation = assumeMock(useAiAgentNavigation)
const mockUseIngestionDomainBannerDismissed = assumeMock(
    useIngestionDomainBannerDismissed,
)

describe('SyncIngestionDomainBanner', () => {
    const mockedShopName = 'test-shop'
    const mockedDismissBanner = jest.fn()

    const defaultProps = {
        shopName: mockedShopName,
        syncEntityType: PAGE_NAME.SOURCE,
    }

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                main: '/main',
                questionsContent: '/questions-content',
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

    it('renders success banner and shows Review button when syncEntityType is Source', () => {
        render(
            <SyncIngestionDomainBanner
                {...defaultProps}
                syncEntityType={PAGE_NAME.SOURCE}
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
                syncEntityType={PAGE_NAME.SOURCE}
                syncStoreDomainStatus={IngestionLogStatus.Successful}
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: /review/i }))
        expect(history.push).toHaveBeenCalledWith('/questions-content')
    })

    it('renders failed banner', () => {
        render(
            <SyncIngestionDomainBanner
                {...defaultProps}
                syncStoreDomainStatus={IngestionLogStatus.Failed}
            />,
        )

        expect(
            screen.getByText(/We couldn't sync your store website/i),
        ).toBeInTheDocument()
    })

    describe('Conditional text messages based on sync type', () => {
        describe('Pending banner text', () => {
            it('shows URL syncing message when syncEntityType is URL', () => {
                render(
                    <SyncIngestionDomainBanner
                        {...defaultProps}
                        syncEntityType="url-content"
                        syncStoreDomainStatus={IngestionLogStatus.Pending}
                    />,
                )

                expect(
                    screen.getByText(
                        /Your URL is syncing. You will be notified once complete. In the meantime, AI Agent may not have your latest content./i,
                    ),
                ).toBeInTheDocument()
            })

            it('shows store website syncing message when syncEntityType is not URL', () => {
                render(
                    <SyncIngestionDomainBanner
                        {...defaultProps}
                        syncEntityType={PAGE_NAME.STORE_WEBSITE}
                        syncStoreDomainStatus={IngestionLogStatus.Pending}
                    />,
                )

                expect(
                    screen.getByText(
                        /Your store website is syncing\. This may take a while/i,
                    ),
                ).toBeInTheDocument()
            })
        })

        describe('Success banner text', () => {
            it('shows URL synced successfully message when syncEntityType is URL', () => {
                render(
                    <SyncIngestionDomainBanner
                        {...defaultProps}
                        syncEntityType="url-content"
                        syncStoreDomainStatus={IngestionLogStatus.Successful}
                    />,
                )

                expect(
                    screen.getByText(
                        /Your URL has been synced successfully and is in use by AI Agent/i,
                    ),
                ).toBeInTheDocument()
            })

            it('shows store website synced successfully message when syncEntityType is not URL', () => {
                render(
                    <SyncIngestionDomainBanner
                        {...defaultProps}
                        syncEntityType={PAGE_NAME.STORE_WEBSITE}
                        syncStoreDomainStatus={IngestionLogStatus.Successful}
                    />,
                )

                expect(
                    screen.getByText(
                        /Your store website has been synced successfully and is in use by AI Agent/i,
                    ),
                ).toBeInTheDocument()
            })
        })

        describe('Failed banner text', () => {
            it('shows URL sync failed message when syncEntityType is URL', () => {
                render(
                    <SyncIngestionDomainBanner
                        {...defaultProps}
                        syncEntityType="url-content"
                        syncStoreDomainStatus={IngestionLogStatus.Failed}
                    />,
                )

                expect(
                    screen.getByText(
                        /We couldn't sync your URL. AI Agent is using your previous content/i,
                    ),
                ).toBeInTheDocument()
            })

            it('shows store website sync failed message when syncEntityType is not URL', () => {
                render(
                    <SyncIngestionDomainBanner
                        {...defaultProps}
                        syncEntityType={PAGE_NAME.STORE_WEBSITE}
                        syncStoreDomainStatus={IngestionLogStatus.Failed}
                    />,
                )

                expect(
                    screen.getByText(
                        /We couldn't sync your store website. AI Agent is using your previous content. Please try again or contact support if the issue persists./i,
                    ),
                ).toBeInTheDocument()
            })
        })
    })
})
