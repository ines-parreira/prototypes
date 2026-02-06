import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { IngestionLogStatus } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'

import { useListenToDocumentEvent } from './EmptyState/utils'
import { SyncStoreDomainBanner } from './SyncStoreDomainBanner'

jest.mock(
    'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed',
)

jest.mock('./EmptyState/utils', () => ({
    ...jest.requireActual('./EmptyState/utils'),
    useListenToDocumentEvent: jest.fn(),
}))

const mockUseIngestionDomainBannerDismissed =
    useIngestionDomainBannerDismissed as jest.MockedFunction<
        typeof useIngestionDomainBannerDismissed
    >

const mockUseListenToDocumentEvent =
    useListenToDocumentEvent as jest.MockedFunction<
        typeof useListenToDocumentEvent
    >

describe('SyncStoreDomainBanner', () => {
    let fileUploadEventCallback: (event?: Event) => void

    beforeEach(() => {
        jest.clearAllMocks()

        // Default mock behavior for banner dismissed hook
        mockUseIngestionDomainBannerDismissed.mockReturnValue({
            isDismissed: false,
            dismissBanner: jest.fn(),
            resetAllBanner: jest.fn(),
            resetBanner: jest.fn(),
        })

        // Mock event listener
        mockUseListenToDocumentEvent.mockImplementation(
            (eventName, callback) => {
                if (eventName === 'file-upload-started') {
                    fileUploadEventCallback = callback
                }
            },
        )
    })

    describe('when banner is dismissed', () => {
        it('does not render anything', () => {
            mockUseIngestionDomainBannerDismissed.mockReturnValue({
                isDismissed: true,
                dismissBanner: jest.fn(),
                resetAllBanner: jest.fn(),
                resetBanner: jest.fn(),
            })

            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="domain"
                />,
            )

            expect(container.firstChild).toBeNull()
        })
    })

    describe('pending status - domain type', () => {
        it('shows pending message for single domain sync', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="domain"
                />,
            )

            expect(
                screen.getByText(/Your store website is currently syncing./),
            ).toBeInTheDocument()
        })

        it('dismisses banner when close button is clicked', async () => {
            const mockDismissBanner = jest.fn()
            mockUseIngestionDomainBannerDismissed.mockReturnValue({
                isDismissed: false,
                dismissBanner: mockDismissBanner,
                resetAllBanner: jest.fn(),
                resetBanner: jest.fn(),
            })

            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="domain"
                />,
            )

            const closeButton = screen.getByRole('button', { name: /close/i })
            await act(() => userEvent.click(closeButton))

            expect(mockDismissBanner).toHaveBeenCalled()
        })
    })

    describe('pending status - url type', () => {
        it('shows pending message for single URL sync', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="url"
                />,
            )

            expect(
                screen.getByText(/Your URL is currently syncing./),
            ).toBeInTheDocument()
        })

        it('shows syncing message when no URLs completed yet', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="url"
                    totalCount={3}
                    completedCount={0}
                />,
            )

            expect(screen.getByText(/Syncing 3 URLs.../)).toBeInTheDocument()
        })

        it('shows progress message when some URLs are completed', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="url"
                    totalCount={5}
                    completedCount={2}
                />,
            )

            expect(
                screen.getByText(/Syncing 2 out of 5 URLs/),
            ).toBeInTheDocument()
        })

        it('does not show progress for single URL', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="url"
                    totalCount={1}
                    completedCount={0}
                />,
            )

            expect(
                screen.getByText(/Your URL is currently syncing./),
            ).toBeInTheDocument()
        })
    })

    describe('pending status - file type', () => {
        it('shows pending message for single file', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="file"
                />,
            )

            expect(
                screen.getByText(/Your document is uploading./),
            ).toBeInTheDocument()
        })

        it('shows uploaded progress when some files are completed', async () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="file"
                    completedCount={2}
                />,
            )

            await act(() => {
                const customEvent = new CustomEvent('file-upload-started', {
                    detail: { fileCount: 5 },
                })
                fileUploadEventCallback?.(customEvent)
            })

            expect(
                screen.getByText(/Uploading 2 out of 5 documents/),
            ).toBeInTheDocument()
        })

        it('does not update optimistic count for non-file types', async () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="url"
                />,
            )

            await act(() => {
                const customEvent = new CustomEvent('file-upload-started', {
                    detail: { fileCount: 3 },
                })
                fileUploadEventCallback?.(customEvent)
            })

            expect(
                screen.getByText(/Your URL is currently syncing./),
            ).toBeInTheDocument()
            expect(screen.queryByText(/Uploading 3/)).not.toBeInTheDocument()
        })

        it('does not show progress for single file', async () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="file"
                    completedCount={0}
                />,
            )

            await act(() => {
                const customEvent = new CustomEvent('file-upload-started', {
                    detail: { fileCount: 1 },
                })
                fileUploadEventCallback?.(customEvent)
            })

            expect(
                screen.getByText(/Your document is uploading./),
            ).toBeInTheDocument()
        })
    })

    describe('successful status - domain type', () => {
        it('shows success message for domain sync', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="domain"
                />,
            )

            expect(
                screen.getByText(
                    /Your store website has been synced successfully and is in use by AI Agent. Review generated content for accuracy./,
                ),
            ).toBeInTheDocument()
        })

        it('dismisses banner when close button is clicked', async () => {
            const mockDismissBanner = jest.fn()
            mockUseIngestionDomainBannerDismissed.mockReturnValue({
                isDismissed: false,
                dismissBanner: mockDismissBanner,
                resetAllBanner: jest.fn(),
                resetBanner: jest.fn(),
            })

            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="domain"
                />,
            )

            const closeButton = screen.getByRole('button', { name: /close/i })
            await act(() => userEvent.click(closeButton))

            expect(mockDismissBanner).toHaveBeenCalled()
        })
    })

    describe('successful status - url type', () => {
        it('shows success message for single URL sync', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="url"
                />,
            )

            expect(
                screen.getByText(
                    /Your URL has been synced successfully and is in use by AI Agent./,
                ),
            ).toBeInTheDocument()
        })

        it('shows plural success message for multiple URLs', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="url"
                    totalCount={3}
                />,
            )

            expect(
                screen.getByText(
                    /URLs have been synced successfully and are in use by AI Agent. Review generated content for accuracy./,
                ),
            ).toBeInTheDocument()
        })

        it('does not show accuracy review for single URL', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="url"
                    totalCount={1}
                />,
            )

            const bannerText = screen.getByText(
                /Your URL has been synced successfully and is in use by AI Agent./,
            )
            expect(bannerText).toBeInTheDocument()
            expect(bannerText.textContent).not.toContain(
                'Review generated content for accuracy',
            )
        })

        it('shows URL in success message for single URL', () => {
            const successUrl = 'https://example.com/page'
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="url"
                    successfulUrls={[successUrl]}
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toContain(
                'Your URL has been synced successfully and is in use by AI Agent.',
            )
            expect(banner?.textContent).toContain('URL:')

            const link = container.querySelector(`a[href="${successUrl}"]`)
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noopener noreferrer')
            expect(link?.textContent).toBe(successUrl)
        })

        it('does not show URL when successfulUrls is empty', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="url"
                    successfulUrls={[]}
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toContain(
                'Your URL has been synced successfully and is in use by AI Agent.',
            )
            expect(banner?.textContent).not.toContain('URL:')
        })

        it('does not show URL when successfulUrls is undefined', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="url"
                />,
            )

            const bannerText = screen.getByText(
                /Your URL has been synced successfully and is in use by AI Agent./,
            )
            expect(bannerText).toBeInTheDocument()
            expect(bannerText.textContent).not.toContain('URL:')
        })

        it('does not show URL for multiple URLs', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="url"
                    totalCount={3}
                    successfulUrls={[
                        'https://example.com/page1',
                        'https://example.com/page2',
                        'https://example.com/page3',
                    ]}
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toContain(
                'URLs have been synced successfully and are in use by AI Agent',
            )
            expect(banner?.textContent).not.toContain('URL:')
            expect(banner?.textContent).not.toContain('page1')
        })
    })

    describe('successful status - file type', () => {
        it('shows success message for file upload', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="file"
                />,
            )

            expect(
                screen.getByText(
                    /Your document has been synced successfully and is in use by AI Agent./,
                ),
            ).toBeInTheDocument()
        })

        it('does not show accuracy review for file type', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Successful}
                    shopName="test-shop"
                    type="file"
                />,
            )

            const bannerText = screen.getByText(
                /Your document has been synced successfully and is in use by AI Agent./,
            )
            expect(bannerText.textContent).not.toContain(
                'Review generated content for accuracy',
            )
        })
    })

    describe('failed status', () => {
        it('shows error message for domain sync failure', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="domain"
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toMatch(/We couldn.t sync/)
            expect(banner?.textContent).toContain('store website')
            expect(banner?.textContent).toContain(
                'Please try again or contact support if the issue persists',
            )
        })

        it('shows error message for URL sync failure', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="url"
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toMatch(/We couldn.t sync/)
            expect(banner?.textContent).toContain('URL')
            expect(banner?.textContent).toContain(
                'Please try again or contact support if the issue persists',
            )
        })

        it('shows error message for file upload failure', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="file"
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toMatch(/We couldn.t sync/)
            expect(banner?.textContent).toContain('document')
            expect(banner?.textContent).toContain(
                'Please try again or contact support if the issue persists',
            )
        })

        it('dismisses banner when close button is clicked', async () => {
            const mockDismissBanner = jest.fn()
            mockUseIngestionDomainBannerDismissed.mockReturnValue({
                isDismissed: false,
                dismissBanner: mockDismissBanner,
                resetAllBanner: jest.fn(),
                resetBanner: jest.fn(),
            })

            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="domain"
                />,
            )

            const closeButton = screen.getByRole('button', { name: /close/i })
            await act(() => userEvent.click(closeButton))

            expect(mockDismissBanner).toHaveBeenCalled()
        })

        it('shows single failed URL for URL type', () => {
            const failedUrl = 'https://example.com/page'
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="url"
                    failedUrls={[failedUrl]}
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toMatch(/We couldn.t sync/)
            expect(banner?.textContent).toContain('URL:')

            const link = container.querySelector(`a[href="${failedUrl}"]`)
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noopener noreferrer')
            expect(link?.textContent).toBe(failedUrl)
        })

        it('shows complete error message text for single failed URL', () => {
            const failedUrl = 'https://example.com/failed-page'
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="url"
                    failedUrls={[failedUrl]}
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toContain(
                "We couldn't sync your URL. Please try again or contact support if the issue persists.",
            )
        })

        it('renders URL label and line break for single failed URL', () => {
            const failedUrl = 'https://example.com/test'
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="url"
                    failedUrls={[failedUrl]}
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            const brElement = banner?.querySelector('br')
            expect(brElement).toBeInTheDocument()

            expect(banner?.textContent).toContain('URL:')
        })

        it('renders clickable failed URL with correct attributes', () => {
            const failedUrl = 'https://example.com/specific-path'
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="url"
                    failedUrls={[failedUrl]}
                />,
            )

            const link = container.querySelector('a')
            expect(link).toBeInTheDocument()
            expect(link).toHaveAttribute('href', failedUrl)
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noopener noreferrer')
            expect(link?.textContent).toBe(failedUrl)
        })

        it('renders failed URL banner structure correctly', () => {
            const failedUrl = 'https://example.com/page'
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="url"
                    failedUrls={[failedUrl]}
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')

            const textBeforeBreak = banner?.innerHTML.split('<br>')[0]
            expect(textBeforeBreak).toContain(
                'Please try again or contact support if the issue persists.',
            )

            const textAfterBreak = banner?.innerHTML.split('<br>')[1]
            expect(textAfterBreak).toContain('URL:')
            expect(textAfterBreak).toContain(failedUrl)
        })

        it('does not show URLs when multiple URLs fail', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="url"
                    failedUrls={[
                        'https://example.com/page1',
                        'https://example.com/page2',
                    ]}
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toMatch(/We couldn.t sync/)
            expect(banner?.textContent).toContain('URLs')
            expect(banner?.textContent).not.toContain('URL:')
            expect(banner?.textContent).not.toContain('page1')
            expect(banner?.textContent).not.toContain('page2')
        })

        it('does not show URL for non-URL types', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="domain"
                    failedUrls={['https://example.com/page']}
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toMatch(/We couldn.t sync/)
            expect(banner?.textContent).not.toContain('URL:')
            expect(banner?.textContent).not.toContain(
                'https://example.com/page',
            )
        })

        it('does not show URL when failedUrls is empty', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="url"
                    failedUrls={[]}
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toMatch(/We couldn.t sync/)
            expect(banner?.textContent).not.toContain('URL:')
        })

        it('does not show URL when failedUrls is undefined', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Failed}
                    shopName="test-shop"
                    type="url"
                />,
            )

            const banner = container.querySelector('[data-name="banner"]')
            expect(banner?.textContent).toMatch(/We couldn.t sync/)
            expect(banner?.textContent).not.toContain('URL:')
        })
    })

    describe('edge cases', () => {
        it('does not render when syncStatus is null', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={null}
                    shopName="test-shop"
                    type="domain"
                />,
            )

            expect(container.firstChild).toBeNull()
        })

        it('does not render when syncStatus is undefined', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={undefined}
                    shopName="test-shop"
                    type="domain"
                />,
            )

            expect(container.firstChild).toBeNull()
        })

        it('does not render when syncStatus is an unknown value', () => {
            const { container } = render(
                <SyncStoreDomainBanner
                    syncStatus={'UNKNOWN' as any}
                    shopName="test-shop"
                    type="domain"
                />,
            )

            expect(container.firstChild).toBeNull()
        })

        it('defaults to domain type when type is not specified', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                />,
            )

            expect(
                screen.getByText(/Your store website is currently syncing/),
            ).toBeInTheDocument()
        })

        it('handles completedCount as 0', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="url"
                    totalCount={5}
                    completedCount={0}
                />,
            )

            expect(screen.getByText(/Syncing 5 URLs.../)).toBeInTheDocument()
        })

        it('handles totalCount as 0', () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="url"
                    totalCount={0}
                    completedCount={0}
                />,
            )

            expect(
                screen.getByText(/Your URL is currently syncing./),
            ).toBeInTheDocument()
        })

        it('handles FILE_UPLOAD_STARTED event without detail', async () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="file"
                />,
            )

            await act(() => {
                const customEvent = new CustomEvent('file-upload-started')
                fileUploadEventCallback?.(customEvent)
            })

            expect(
                screen.getByText(/Your document is uploading./),
            ).toBeInTheDocument()
        })

        it('handles FILE_UPLOAD_STARTED event without fileCount', async () => {
            render(
                <SyncStoreDomainBanner
                    syncStatus={IngestionLogStatus.Pending}
                    shopName="test-shop"
                    type="file"
                />,
            )

            await act(() => {
                const customEvent = new CustomEvent('file-upload-started', {
                    detail: {},
                })
                fileUploadEventCallback?.(customEvent)
            })

            expect(
                screen.getByText(/Your document is uploading./),
            ).toBeInTheDocument()
        })
    })
})
