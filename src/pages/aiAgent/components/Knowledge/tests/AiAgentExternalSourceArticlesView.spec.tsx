import React from 'react'

import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { useLocation } from 'react-router-dom'

import {
    useGetArticleIngestionLogs,
    useGetHelpCenterArticle,
} from 'models/helpCenter/queries'
import { HeaderType } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { useGuidanceArticleMutation } from 'pages/aiAgent/hooks/useGuidanceArticleMutation'
import { usePublicResourceMutation } from 'pages/aiAgent/hooks/usePublicResourcesMutation'
import { getSingleHelpCenterResponseFixtureWithTranslation } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

import AiAgentExternalSourceArticlesView from '../AiAgentExternalSourceArticlesView'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}))

jest.mock('models/helpCenter/queries')
jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation')
jest.mock('pages/aiAgent/hooks/usePublicResourcesMutation')

const mockUseLocation = assumeMock(useLocation)
const mockUseGetHelpCenterArticle = assumeMock(useGetHelpCenterArticle)
const mockUseGetArticleIngestionLogs = assumeMock(useGetArticleIngestionLogs)
const mockUseGuidanceArticleMutation = assumeMock(useGuidanceArticleMutation)
const umockUsePublicResourceMutation = assumeMock(usePublicResourceMutation)
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
        <AiAgentExternalSourceArticlesView {...defaultProps} {...props} />,
        defaultState,
    )
}

describe('AiAgentExternalSourceArticlesView', () => {
    beforeEach(() => {
        mockFlags({
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

        mockUseGuidanceArticleMutation.mockReturnValue({
            updateGuidanceArticle: jest.fn(),
            isGuidanceArticleUpdating: false,
        } as any)

        umockUsePublicResourceMutation.mockReturnValue({
            addPublicResource: jest.fn(),
            deletePublicResource: jest.fn(),
        } as any)
    })

    it('should render the component with correct title for external document', () => {
        renderComponent()

        expect(screen.getByText('Document')).toBeInTheDocument()
    })

    it('should render the component with correct title for URL', () => {
        renderComponent({
            headerType: HeaderType.URL,
        })

        expect(screen.getByText('Single page URL')).toBeInTheDocument()
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
})
