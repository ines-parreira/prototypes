import type { ReactElement } from 'react'

import { history } from '@repo/routing'
import { assumeMock } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useLocation, useParams } from 'react-router-dom'

import {
    useGetArticleIngestionLogs,
    useGetFileIngestion,
    useGetHelpCenterArticle,
} from 'models/helpCenter/queries'
import { HeaderType } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useIngestionDomainBannerDismissed } from 'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { usePublicResourceMutation } from 'pages/aiAgent/hooks/usePublicResourcesMutation'
import { usePublicResourcesPooling } from 'pages/aiAgent/hooks/usePublicResourcesPooling'
import { getSingleHelpCenterResponseFixtureWithTranslation } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { mockFeatureFlags } from 'tests/mockFeatureFlags'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import AiAgentExternalSourceArticlesView from '../AiAgentExternalSourceArticlesView'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
    useParams: jest.fn(),
}))

jest.mock('models/helpCenter/queries')
jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation')
jest.mock('pages/aiAgent/hooks/usePublicResourcesMutation')
jest.mock('pages/aiAgent/hooks/usePublicResourcesPooling')
jest.mock(
    'pages/aiAgent/AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed',
)
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

const mockUseLocation = assumeMock(useLocation)
const mockUseParams = assumeMock(useParams)
const mockUseGetHelpCenterArticle = assumeMock(useGetHelpCenterArticle)
const mockUseGetArticleIngestionLogs = assumeMock(useGetArticleIngestionLogs)
const mockUseGetFileIngestion = assumeMock(useGetFileIngestion)
const mockUseGuidanceArticleMutation = assumeMock(useGuidanceArticleMutation)
const mockUsePublicResourceMutation = assumeMock(usePublicResourceMutation)
const mockUsePublicResourcesPooling = assumeMock(usePublicResourcesPooling)
const mockUseIngestionDomainBannerDismissed = assumeMock(
    useIngestionDomainBannerDismissed,
)
const mockedShopName = 'test-shop'
const mockedFileIngestionId = '123'
const mockedHelpCenterId = 1
const mockedHelpCenter = getSingleHelpCenterResponseFixtureWithTranslation

const mockArticles = [
    {
        id: 1,
        title: 'Test article 1',
        status: 'published',
        article_id: 1,
        help_center_id: mockedHelpCenterId,
        file_ingestion_id: mockedFileIngestionId,
    },
    {
        id: 2,
        title: 'Test article 2',
        status: 'draft',
        article_id: 2,
        help_center_id: mockedHelpCenterId,
        file_ingestion_id: mockedFileIngestionId,
    },
]

const mockFetchArticles = jest.fn().mockReturnValue({
    data: mockArticles,
    isLoading: false,
    refetch: jest.fn(),
})

const defaultState = {
    currentAccount: fromJS({
        domain: 'test-shop.example.com',
    }),
}

const renderComponent = (props = {}) => {
    const defaultProps = {
        shopName: mockedShopName,
        fileIngestionId: mockedFileIngestionId,
        helpCenterId: mockedHelpCenterId,
        helpCenter: mockedHelpCenter,
        fetchArticles: mockFetchArticles,
        pageType: 'FILE_QUESTION',
        headerType: HeaderType.ExternalDocument,
        isLoading: false,
    }

    return renderWithStoreAndQueryClientAndRouter(
        (
            <AiAgentExternalSourceArticlesView {...defaultProps} {...props} />
        ) as ReactElement,
        defaultState,
    )
}

describe('AiAgentExternalSourceArticlesView', () => {
    beforeEach(() => {
        mockFeatureFlags({
            AiShoppingAssistantEnabled: true,
        })
        mockUseLocation.mockReturnValue({
            state: {
                selectedResource: {
                    filename: 'test.pdf',
                    url: 'test.pdf',
                    uploaded_datetime: '2024-01-01T00:00:00Z',
                },
            },
        } as any)
        mockUseGetHelpCenterArticle.mockReturnValue({
            data: null,
            isLoading: false,
            refetch: jest.fn(),
        } as any)

        mockUseGetArticleIngestionLogs.mockReturnValue({
            data: [],
            isLoading: false,
            error: null,
        } as any)

        mockUseGetFileIngestion.mockReturnValue({
            data: { data: [] },
            isLoading: false,
            error: null,
        } as any)

        mockUseGuidanceArticleMutation.mockReturnValue({
            updateGuidanceArticle: jest.fn(),
            isGuidanceArticleUpdating: false,
        } as any)

        mockUsePublicResourceMutation.mockReturnValue({
            addPublicResource: jest.fn(),
            deletePublicResource: jest.fn(),
        } as any)

        mockUsePublicResourcesPooling.mockReturnValue({
            articleIngestionLogs: [],
            isLoading: false,
            refetch: jest.fn(),
        } as any)

        mockUseIngestionDomainBannerDismissed.mockReturnValue({
            resetAllBanner: jest.fn(),
            isDismissed: false,
            dismissBanner: jest.fn(),
        } as any)
        mockUseParams.mockReturnValue({
            articleId: undefined,
        })
    })

    it('should render the component with correct title for external document', () => {
        renderComponent()

        expect(screen.getByText('Document')).toBeInTheDocument()
    })

    it('should render the component with correct title for URL', () => {
        renderComponent({
            headerType: HeaderType.URL,
        })

        expect(screen.getByText('URL')).toBeInTheDocument()
    })

    it('should fetch and display articles', () => {
        renderComponent()

        expect(mockFetchArticles).toHaveBeenCalledWith(
            mockedHelpCenterId,
            mockedFileIngestionId,
        )
        expect(screen.getByText('Test article 1')).toBeInTheDocument()
        expect(screen.getByText('Test article 2')).toBeInTheDocument()
    })

    it('should handle article selection', () => {
        mockUseParams.mockReturnValue({
            articleId: '1',
        })
        renderComponent()

        // Click on the first article row
        const articleRow = screen.getByRole('row', { name: /Test article 1/i })
        fireEvent.click(articleRow)

        // Verify that the selected article content wrapper is rendered
        const modalTitle = screen.getByText('Question details')
        expect(modalTitle).toBeInTheDocument()
        expect(
            screen.getByText('Test article 1', {
                selector: '.contentBody div',
            }),
        ).toBeInTheDocument()
    })

    it('should handle article deselection', () => {
        renderComponent()

        // Click on the first article row
        const articleRow = screen.getByRole('row', { name: /Test article 1/i })
        fireEvent.click(articleRow)

        // Verify modal is open
        expect(screen.getByText('Question details')).toBeInTheDocument()

        // Close the selected article
        const closeButton = screen.getByAltText('hide-view-icon')
        fireEvent.click(closeButton)

        // Verify that the article list is still visible
        expect(
            screen.getByRole('columnheader', { name: /Question/i }),
        ).toBeInTheDocument()

        // Verify modal is closed (should not have opened class)
        const modal = screen.getByText('Question details').closest('.modal')
        expect(modal).not.toHaveClass('opened')
    })

    it('should display store domain from location state', () => {
        renderComponent()

        expect(screen.getByText('test.pdf')).toBeInTheDocument()
    })

    it('should display store URL from location state', () => {
        mockUseLocation.mockReturnValue({
            state: {
                selectedResource: {
                    url: 'https://test.com/test.pdf',
                },
            },
        } as any)

        renderComponent()

        expect(
            screen.getByText('https://test.com/test.pdf'),
        ).toBeInTheDocument()
    })

    it('should handle empty articles list', () => {
        mockFetchArticles.mockReturnValueOnce([])
        renderComponent()

        expect(screen.queryByText('Test article 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Test article 2')).not.toBeInTheDocument()
    })

    describe('handleOnSync function', () => {
        let mockAddPublicResource: jest.Mock
        let mockResetAllBanner: jest.Mock

        beforeEach(() => {
            mockAddPublicResource = jest.fn()
            mockResetAllBanner = jest.fn()

            mockUsePublicResourceMutation.mockReturnValue({
                addPublicResource: mockAddPublicResource,
                deletePublicResource: jest.fn(),
            } as any)

            mockUseIngestionDomainBannerDismissed.mockReturnValue({
                resetAllBanner: mockResetAllBanner,
                isDismissed: false,
                dismissBanner: jest.fn(),
            } as any)

            mockUsePublicResourcesPooling.mockReturnValue({
                articleIngestionLogs: [],
            } as any)

            // Mock location with fileUrl
            mockUseLocation.mockReturnValue({
                state: {
                    selectedResource: {
                        url: 'https://example.com/test.pdf',
                        id: Number(mockedFileIngestionId),
                    },
                },
            } as any)
        })

        it('should handle successful sync', async () => {
            // Mock the status as not loading initially so sync button is clickable
            mockUsePublicResourcesPooling.mockReturnValue({
                articleIngestionLogs: [
                    {
                        id: Number(mockedFileIngestionId),
                        url: 'https://example.com/test.pdf',
                        status: 'SUCCESSFUL',
                        created_datetime: '2024-01-01T00:00:00Z',
                    },
                ],
            } as any)

            mockAddPublicResource.mockResolvedValue({})

            renderComponent({ headerType: HeaderType.URL })

            // Find and click the initial sync button to open modal
            const syncButton = screen.getByText('Sync')
            fireEvent.click(syncButton)

            // Wait for modal to open and click the sync button in the modal
            await waitFor(() => {
                expect(screen.getByText('Sync URL')).toBeInTheDocument()
            })

            // Click the sync button in the modal footer
            const modalSyncButtons = screen.getAllByText('Sync')
            const modalSyncButton = modalSyncButtons.find((button) =>
                button.closest('.footer'),
            )
            if (modalSyncButton) {
                fireEvent.click(modalSyncButton)
            }

            // Wait for async operations
            await waitFor(() => {
                expect(mockAddPublicResource).toHaveBeenCalledWith(
                    'https://example.com/test.pdf',
                )
            })
        })

        it('should not sync when fileUrl is null', async () => {
            // Mock location without fileUrl
            mockUseLocation.mockReturnValue({
                state: {
                    selectedResource: null,
                },
            } as any)

            renderComponent({ headerType: HeaderType.URL })

            // The sync button should still be present but clicking it should do nothing
            const syncButton = screen.getByText('Sync')
            fireEvent.click(syncButton)

            // Wait a bit to ensure no async operations are triggered
            await new Promise((resolve) => setTimeout(resolve, 100))

            expect(mockAddPublicResource).not.toHaveBeenCalled()
            expect(mockResetAllBanner).not.toHaveBeenCalled()
        })

        it('should not show sync button for external document', () => {
            renderComponent({ headerType: HeaderType.ExternalDocument })

            // Sync button should not be present for external documents
            expect(screen.queryByText('Sync')).not.toBeInTheDocument()
        })

        it('should reset banners when syncing URL if banner is dismissed', async () => {
            mockUseIngestionDomainBannerDismissed.mockReturnValue({
                resetAllBanner: mockResetAllBanner,
                isDismissed: true,
                dismissBanner: jest.fn(),
            } as any)
            mockUsePublicResourcesPooling.mockReturnValue({
                articleIngestionLogs: [
                    {
                        id: Number(mockedFileIngestionId),
                        url: 'https://example.com/test.pdf',
                        status: 'SUCCESSFUL',
                        created_datetime: '2024-01-01T00:00:00Z',
                    },
                ],
            } as any)

            mockAddPublicResource.mockResolvedValue({})

            renderComponent({ headerType: HeaderType.URL })

            // Find and click the initial sync button to open modal
            const syncButton = screen.getByText('Sync')
            fireEvent.click(syncButton)

            // Wait for modal to open and click the sync button in the modal
            await waitFor(() => {
                expect(screen.getByText('Sync URL')).toBeInTheDocument()
            })

            // Click the sync button in the modal footer
            const modalSyncButtons = screen.getAllByText('Sync')
            const modalSyncButton = modalSyncButtons.find((button) =>
                button.closest('.footer'),
            )
            if (modalSyncButton) {
                fireEvent.click(modalSyncButton)
            }

            // Wait for async operations
            await waitFor(() => {
                expect(mockResetAllBanner).toHaveBeenCalled()
            })
        })
    })

    it('should fetch and display URL when navigating directly to route (no location state)', () => {
        // Clear previous mock and set up new mock for direct navigation
        mockUseGetArticleIngestionLogs.mockReturnValue({
            data: [
                {
                    id: Number(mockedFileIngestionId),
                    url: 'https://example.com/direct-navigation-url',
                    latest_sync: '2024-01-15T00:00:00Z',
                    created_datetime: '2024-01-01T00:00:00Z',
                    status: 'SUCCESSFUL',
                    article_ids: [1, 2],
                },
            ],
            isLoading: false,
            error: null,
        } as any)

        mockUseLocation.mockReturnValue({
            state: {
                selectedResource: null,
            },
        } as any)

        renderComponent({ headerType: HeaderType.URL })

        // The URL should be displayed from the fetched resource data
        expect(
            screen.getByText('https://example.com/direct-navigation-url'),
        ).toBeInTheDocument()

        // Verify that useGetArticleIngestionLogs was called to fetch the resource
        expect(mockUseGetArticleIngestionLogs).toHaveBeenCalledWith(
            {
                help_center_id: mockedHelpCenterId,
                ids: [Number(mockedFileIngestionId)],
            },
            {
                enabled: true, // Should be enabled since no location state is available
            },
        )
    })

    it('should fetch and display filename when navigating directly to file route (no location state)', () => {
        // Clear previous mock and set up new mock for direct navigation to file
        mockUseGetFileIngestion.mockReturnValue({
            data: {
                data: [
                    {
                        id: Number(mockedFileIngestionId),
                        filename: 'test-document.pdf',
                        uploaded_datetime: '2024-01-15T00:00:00Z',
                        status: 'SUCCESSFUL',
                        snippets_article_ids: [1, 2],
                        help_center_id: mockedHelpCenterId,
                        type: 'pdf',
                        size_bytes: 1024,
                        google_storage_url:
                            'https://storage.googleapis.com/test.pdf',
                        meta: null,
                    },
                ],
            },
            isLoading: false,
            error: null,
        } as any)

        // Clear location state to simulate direct navigation
        mockUseLocation.mockReturnValue({
            state: {
                selectedResource: null,
            },
        } as any)

        renderComponent({ headerType: HeaderType.ExternalDocument })

        // The filename should be displayed from the fetched resource data
        expect(screen.getByText('test-document.pdf')).toBeInTheDocument()

        // Verify that useGetFileIngestion was called to fetch the resource
        expect(mockUseGetFileIngestion).toHaveBeenCalledWith(
            {
                help_center_id: mockedHelpCenterId,
                ids: [Number(mockedFileIngestionId)],
            },
            {
                enabled: true, // Should be enabled since no location state is available
            },
        )
    })

    it('should navigate to the article list for URL header type when closing the article detail modal', () => {
        const mockHistoryPush = jest.spyOn(history, 'push')
        renderComponent({ headerType: HeaderType.URL })

        // Click on the first article row to open the modal
        const articleRow = screen.getByRole('row', { name: /Test article 1/i })
        fireEvent.click(articleRow)

        // Close the selected article
        const closeButton = screen.getByAltText('hide-view-icon')
        fireEvent.click(closeButton)

        // Should navigate to the article list for URL header type
        expect(mockHistoryPush).toHaveBeenCalledWith(
            expect.stringContaining('/url-articles/'),
        )
    })

    it('should navigate to the article detail for URL header type when selecting an article', () => {
        const mockHistoryPush = jest.spyOn(history, 'push')
        renderComponent({ headerType: HeaderType.URL })

        // Click on the first article row to trigger navigation to detail
        const articleRow = screen.getByRole('row', { name: /Test article 1/i })
        fireEvent.click(articleRow)

        // Should navigate to the article detail for URL header type
        expect(mockHistoryPush).toHaveBeenCalledWith(
            expect.stringContaining('/url-articles/123/articles/1'),
        )
    })
})
