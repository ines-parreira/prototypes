import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import type { HelpCenter } from 'models/helpCenter/types'
import { IntegrationType } from 'models/integration/constants'
import type { ShopifyIntegration } from 'models/integration/types'
import { renderWithRouter } from 'utils/testing'

import { AutomateLandingPageTopQuestions } from '../AutomateLandingPageTopQuestions'
import { useHasEmailToStoreConnection } from '../useHasEmailToStoreConnection'
import { useTopQuestionsArticles } from '../useTopQuestionsArticles'
import { useTopQuestionsFilters } from '../useTopQuestionsFilters'
import { useTopQuestionsViewedOnPage } from '../useTopQuestionsViewedOnPage'

jest.mock('@repo/logging')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

jest.mock('../useTopQuestionsFilters')
const mockUseTopQuestionsFilters = assumeMock(useTopQuestionsFilters)

jest.mock('../useHasEmailToStoreConnection')
const mockUseHasEmailToStoreConnection = assumeMock(
    useHasEmailToStoreConnection,
)

jest.mock('../useTopQuestionsArticles')
const mockUseTopQuestionsArticles = assumeMock(useTopQuestionsArticles)

jest.mock('../useTopQuestionsViewedOnPage')
const mockUseViewedOnPage = assumeMock(useTopQuestionsViewedOnPage)

const defaultTopQuestionsFilters: ReturnType<typeof useTopQuestionsFilters> = {
    isLoading: false,
    selectedStore: {
        name: 'Store 1',
        id: 1,
    } as unknown as ShopifyIntegration,
    storeFilter: {
        options: [
            {
                shopName: 'Store 1',
                shopType: IntegrationType.Shopify,
                integrationId: 1,
            },
            {
                shopName: 'Store 2',
                shopType: IntegrationType.Shopify,
                integrationId: 2,
            },
        ],
        setSelectedStoreIntegrationId: jest.fn(),
    },
    selectedHelpCenter: {
        name: 'Help Center 1',
        id: 11,
    } as unknown as HelpCenter,
    helpCenterFilter: {
        options: [
            {
                name: 'Help Center 1',
                helpCenterId: 11,
            },
            {
                name: 'Help Center 2',
                helpCenterId: 22,
            },
        ],
        setSelectedHelpCenterId: jest.fn(),
    },
}

const defaultTopQuestionsArticles: ReturnType<typeof useTopQuestionsArticles> =
    {
        articles: [
            {
                key: 'ai_article_1',
                title: 'AI Article 1',
                html_content: '<p>AI Article 1 content</p>',
                excerpt: 'AI Article 1 excerpt',
                category: 'AI',
                score: 0.5,
                related_tickets_count: 150,
                batch_datetime: '2024-02-06T13:30:00Z',
                review_action: undefined,
                reviews: [],
            },
            {
                key: 'ai_article_2',
                title: 'AI Article 2',
                html_content: '<p>AI Article 2 content</p>',
                excerpt: 'AI Article 2 excerpt',
                category: 'AI',
                score: 0.5,
                related_tickets_count: 140,
                batch_datetime: '2024-02-06T13:30:00Z',
                review_action: undefined,
                reviews: [],
            },
            {
                key: 'ai_article_3',
                title: 'AI Article 3',
                html_content: '<p>AI Article 3 content</p>',
                excerpt: 'AI Article 3 excerpt',
                category: 'AI',
                score: 0.5,
                related_tickets_count: 130,
                batch_datetime: '2024-02-06T13:30:00Z',
                review_action: undefined,
                reviews: [],
            },
            {
                key: 'ai_article_4',
                title: 'AI Article 4',
                html_content: '<p>AI Article 4 content</p>',
                excerpt: 'AI Article 4 excerpt',
                category: 'AI',
                score: 0.5,
                related_tickets_count: 120,
                batch_datetime: '2024-02-06T13:30:00Z',
                review_action: undefined,
                reviews: [],
            },
            {
                key: 'ai_article_5',
                title: 'AI Article 5',
                html_content: '<p>AI Article 5 content</p>',
                excerpt: 'AI Article 5 excerpt',
                category: 'AI',
                score: 0.5,
                related_tickets_count: 110,
                batch_datetime: '2024-02-06T13:30:00Z',
                review_action: undefined,
                reviews: [],
            },
        ],
        isLoading: false,
        dismissArticle: jest.fn(),
        createArticle: jest.fn(),
    }

describe('AutomateLandingPageTopQuestions', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseTopQuestionsFilters.mockReturnValue(defaultTopQuestionsFilters)
        mockUseHasEmailToStoreConnection.mockReturnValue({
            hasEmailToStoreConnection: true,
            isLoading: false,
        })
        mockUseTopQuestionsArticles.mockReturnValue(defaultTopQuestionsArticles)
        mockUseViewedOnPage.mockReturnValue(true)
    })

    it('renders top questions', () => {
        renderWithRouter(<AutomateLandingPageTopQuestions />)

        expect(screen.getByText('AI Article 1')).toBeInTheDocument()
        expect(screen.getByText('AI Article 2')).toBeInTheDocument()
        expect(screen.getByText('AI Article 3')).toBeInTheDocument()
        expect(screen.getByText('AI Article 4')).toBeInTheDocument()
        expect(screen.queryByText('AI Article 5')).not.toBeInTheDocument()

        expect(screen.queryByText(' new')).not.toBeInTheDocument()
    })

    it('displays new badge', () => {
        mockUseViewedOnPage.mockReturnValue(false)

        renderWithRouter(<AutomateLandingPageTopQuestions />)

        expect(screen.getByText('5 new')).toBeInTheDocument()
    })

    it('renders nothing if loading', () => {
        mockUseTopQuestionsArticles.mockReturnValue({
            ...defaultTopQuestionsArticles,
            isLoading: true,
        })

        renderWithRouter(<AutomateLandingPageTopQuestions />)

        expect(screen.queryByText('AI Article 1')).not.toBeInTheDocument()
        expect(screen.queryByText('AI Article 2')).not.toBeInTheDocument()
        expect(screen.queryByText('AI Article 3')).not.toBeInTheDocument()
        expect(screen.queryByText('AI Article 4')).not.toBeInTheDocument()
    })

    it('renders nothing is loading email to store connection', () => {
        mockUseHasEmailToStoreConnection.mockReturnValue({
            hasEmailToStoreConnection: false,
            isLoading: true,
        })

        renderWithRouter(<AutomateLandingPageTopQuestions />)

        expect(screen.queryByText('AI Article 1')).not.toBeInTheDocument()
        expect(screen.queryByText('AI Article 2')).not.toBeInTheDocument()
        expect(screen.queryByText('AI Article 3')).not.toBeInTheDocument()
        expect(screen.queryByText('AI Article 4')).not.toBeInTheDocument()
    })

    it('renders connect email to store message for multi store', () => {
        mockUseHasEmailToStoreConnection.mockReturnValue({
            hasEmailToStoreConnection: false,
            isLoading: false,
        })

        renderWithRouter(<AutomateLandingPageTopQuestions />)

        expect(screen.getByText('Connect store to email')).toBeInTheDocument()
    })

    it('creates article', async () => {
        renderWithRouter(<AutomateLandingPageTopQuestions />)

        act(() => {
            fireEvent.click(screen.getAllByText('Create Article')[0])
        })

        await waitFor(() => {
            expect(defaultTopQuestionsArticles.createArticle).toHaveBeenCalled()
            expect(screen.getByText('Creating...')).toBeInTheDocument()
        })

        expect(logEventMock.mock.calls).toEqual([
            [SegmentEvent.AutomateTopQuestionsSectionCreateArticle],
        ])
    })

    it('dismisses article', async () => {
        renderWithRouter(<AutomateLandingPageTopQuestions />)

        act(() => {
            fireEvent.click(screen.getAllByText('close')[0])
        })

        await waitFor(() =>
            expect(
                defaultTopQuestionsArticles.dismissArticle,
            ).toHaveBeenCalled(),
        )
    })

    it('displays message if there are 0 articles in multi-store configuration', () => {
        mockUseTopQuestionsArticles.mockReturnValue({
            ...defaultTopQuestionsArticles,
            articles: [],
        })

        renderWithRouter(<AutomateLandingPageTopQuestions />)

        expect(
            screen.getByText('You have no recommendations for this store yet.'),
        ).toBeInTheDocument()
    })

    it('displays nothing if there are 0 articles in single store configuration', () => {
        mockUseTopQuestionsFilters.mockReturnValue({
            ...defaultTopQuestionsFilters,
            storeFilter: {
                options: [
                    {
                        shopName: 'Store 1',
                        shopType: IntegrationType.Shopify,
                        integrationId: 1,
                    },
                ],
                setSelectedStoreIntegrationId: jest.fn(),
            },
        })

        mockUseTopQuestionsArticles.mockReturnValue({
            ...defaultTopQuestionsArticles,
            articles: [],
        })

        renderWithRouter(<AutomateLandingPageTopQuestions />)

        expect(
            screen.queryByText(
                'You have no recommendations for this store yet.',
            ),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('AI Article 1')).not.toBeInTheDocument()
        expect(screen.queryByText('AI Article 2')).not.toBeInTheDocument()
        expect(screen.queryByText('AI Article 3')).not.toBeInTheDocument()
        expect(screen.queryByText('AI Article 4')).not.toBeInTheDocument()
    })

    it('displays all reviewed if all articles were just reviewed', async () => {
        mockUseTopQuestionsArticles.mockReturnValue({
            ...defaultTopQuestionsArticles,
            articles: defaultTopQuestionsArticles.articles.slice(0, 4),
            dismissArticle: async () => Promise.resolve(),
        })

        const { rerender } = renderWithRouter(
            <AutomateLandingPageTopQuestions />,
        )

        act(() => {
            fireEvent.click(screen.getAllByText('close')[0])
            fireEvent.click(screen.getAllByText('close')[1])
            fireEvent.click(screen.getAllByText('close')[2])
            fireEvent.click(screen.getAllByText('close')[3])
        })

        mockUseTopQuestionsArticles.mockReturnValue({
            ...defaultTopQuestionsArticles,
            articles: [],
        })

        rerender(<AutomateLandingPageTopQuestions />)

        await waitFor(() =>
            expect(
                screen.getByText('You’ve reviewed every recommendation!'),
            ).toBeInTheDocument(),
        )
    })

    it('displays all reviewed if all articles were just reviewed in single store configuration', async () => {
        mockUseTopQuestionsFilters.mockReturnValue({
            ...defaultTopQuestionsFilters,
            storeFilter: {
                options: [
                    {
                        shopName: 'Store 1',
                        shopType: IntegrationType.Shopify,
                        integrationId: 1,
                    },
                ],
                setSelectedStoreIntegrationId: jest.fn(),
            },
        })

        mockUseTopQuestionsArticles.mockReturnValue({
            ...defaultTopQuestionsArticles,
            articles: defaultTopQuestionsArticles.articles.slice(0, 4),
            dismissArticle: async () => Promise.resolve(),
        })

        const { rerender } = renderWithRouter(
            <AutomateLandingPageTopQuestions />,
        )

        act(() => {
            fireEvent.click(screen.getAllByText('close')[0])
            fireEvent.click(screen.getAllByText('close')[1])
            fireEvent.click(screen.getAllByText('close')[2])
            fireEvent.click(screen.getAllByText('close')[3])
        })

        mockUseTopQuestionsArticles.mockReturnValue({
            ...defaultTopQuestionsArticles,
            articles: [],
        })

        rerender(<AutomateLandingPageTopQuestions />)

        await waitFor(() =>
            expect(
                screen.getByText('You’ve reviewed every recommendation!'),
            ).toBeInTheDocument(),
        )
    })
})
