import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {Router, useLocation} from 'react-router-dom'
import {createMemoryHistory} from 'history'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {RootState, StoreDispatch} from 'state/types'
import {useSearchParam} from 'hooks/useSearchParam'
import {assumeMock} from 'utils/testing'
import {initialState} from 'state/ui/stats/drillDownSlice'
import {IntegrationType} from 'models/integration/constants'
import {getHelpCenterFAQList} from 'state/entities/helpCenter/helpCenters'
import {logEvent, SegmentEvent} from 'common/segment'
import {ArticleOrigin} from 'pages/settings/helpCenter/types/articleOrigin.enum'
import {useTopQuestionsFilters} from '../TopQuestions/useTopQuestionsFilters'
import AutomateAllRecommendationsPage from '../AutomateAllRecommendationsPage'
import {useAIArticleRecommendationItems} from '../../hooks/useAIArticleRecommendationItems'
import {useHasEmailToStoreConnection} from '../TopQuestions/useHasEmailToStoreConnection'
import {useTopQuestionsViewedOnPage} from '../TopQuestions/useTopQuestionsViewedOnPage'
import {useAIArticlePublishedPreviewUrl} from '../../hooks/useAIArticlePublishedPreviewUrl'

const storeFilter = {
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
        {
            shopName: 'Store 3',
            shopType: IntegrationType.Shopify,
            integrationId: 3,
        },
        {
            shopName: 'Store 4',
            shopType: IntegrationType.Shopify,
            integrationId: 4,
        },
        {
            shopName: 'Store 5',
            shopType: IntegrationType.Shopify,
            integrationId: 5,
        },
    ],
    setSelectedStoreIntegrationId: jest.fn(),
}

const helpCenterFilter = {
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
}

const mockCreateArticle = jest.fn()
const batchDatetime = '2024-07-10T13:28:49.755Z'
const paginatedItemsFixture = [
    {
        title: 'AI Generated Article 1',
        templateKey: 'ai_Generated_1',
        ticketsCount: 12,
        reviewAction: undefined,
        createArticle: mockCreateArticle,
    },
    {
        title: 'AI Generated Article 2',
        templateKey: 'ai_Generated_2',
        ticketsCount: 10,
        reviewAction: 'archive',
        createArticle: mockCreateArticle,
    },
    {
        title: 'AI Generated Article 3',
        templateKey: 'ai_Generated_3',
        ticketsCount: 8,
        reviewAction: undefined,
        createArticle: mockCreateArticle,
    },
    {
        title: 'AI Generated Article 4',
        templateKey: 'ai_Generated_4',
        ticketsCount: 5,
        reviewAction: 'publish',
        createArticle: mockCreateArticle,
    },
    {
        title: 'AI Generated Article 5',
        templateKey: 'ai_Generated_5',
        ticketsCount: 3,
        reviewAction: 'saveAsDraft',
        createArticle: mockCreateArticle,
    },
]

jest.mock('common/segment')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useLocation: jest.fn(),
}))
const mockUseLocation = assumeMock(useLocation)

jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: jest.fn(),
}))
const mockUseSearchParam = assumeMock(useSearchParam)

jest.mock('../TopQuestions/useTopQuestionsFilters')
const mockUseTopQuestionsFilters = assumeMock(useTopQuestionsFilters)

jest.mock('../../hooks/useAIArticleRecommendationItems', () => ({
    ...jest.requireActual<Record<string, any>>(
        '../../hooks/useAIArticleRecommendationItems'
    ),
    useAIArticleRecommendationItems: jest.fn(),
}))
const mockUseAIArticleRecommendationItems = assumeMock(
    useAIArticleRecommendationItems
)

jest.mock('../TopQuestions/useTopQuestionsViewedOnPage')
const mockUseTopQuestionsViewedOnPage = assumeMock(useTopQuestionsViewedOnPage)

jest.mock('../TopQuestions/useHasEmailToStoreConnection')
const mockUseHasEmailToStoreConnection = assumeMock(
    useHasEmailToStoreConnection
)

jest.mock('state/entities/helpCenter/helpCenters')
const mockGetHelpCenterFAQList = assumeMock(getHelpCenterFAQList)

jest.mock('../../hooks/useAIArticlePublishedPreviewUrl')
const mockUseAIArticlePublishedPreviewUrl = assumeMock(
    useAIArticlePublishedPreviewUrl
)

describe('<AutomateAllRecommendationsPage />', () => {
    const history = createMemoryHistory()
    const defaultState = {
        ui: {
            drillDown: initialState,
        },
    } as unknown as RootState

    const renderComponent = () =>
        render(
            <Router history={history}>
                <Provider store={mockStore(defaultState)}>
                    <AutomateAllRecommendationsPage />
                </Provider>
            </Router>
        )

    beforeEach(() => {
        jest.resetAllMocks()
        mockUseLocation.mockReturnValue({
            pathname: '/app/automation/ai-recommendations',
            search: `store_integration_id=1&help_center_id=11`,
            state: undefined,
            hash: '',
        })
        mockUseSearchParam.mockReturnValue([null, jest.fn()])
        mockUseSearchParam.mockImplementation((param) =>
            param === 'store_integration_id'
                ? ['1', jest.fn()]
                : param === 'help_center_id'
                ? ['11', jest.fn()]
                : [null, jest.fn()]
        )
        mockUseTopQuestionsFilters.mockReturnValue({
            isLoading: false,
            selectedStore: {
                name: storeFilter.options[0].shopName,
                id: storeFilter.options[0].integrationId,
            },
            storeFilter,
            selectedHelpCenter: {
                name: helpCenterFilter.options[0].name,
                id: helpCenterFilter.options[0].helpCenterId,
            },
            helpCenterFilter,
        } as unknown as ReturnType<typeof useTopQuestionsFilters>)
        mockUseAIArticleRecommendationItems.mockReturnValue({
            paginatedItems: paginatedItemsFixture,
            itemsCount: 3,
            totalItemsCount: 5,
            isLoading: false,
            batchDatetime,
        } as unknown as ReturnType<typeof useAIArticleRecommendationItems>)
        mockUseTopQuestionsViewedOnPage.mockReturnValue(true)
        mockUseHasEmailToStoreConnection.mockReturnValue({
            hasEmailToStoreConnection: true,
            isLoading: false,
        })
        mockGetHelpCenterFAQList.mockReturnValue([
            {
                id: 11,
                name: 'Help Center 1',
                type: 'faq',
                deactivated_datetime: null,
            },
            {
                id: 22,
                name: 'Help Center 2',
                type: 'faq',
                deactivated_datetime: null,
            },
        ] as unknown as ReturnType<typeof getHelpCenterFAQList>)
        mockUseAIArticlePublishedPreviewUrl.mockReturnValue({
            url: 'https://test-preview.com',
            article: {
                id: 123,
                translation: {
                    visibility_status: 'PUBLIC',
                },
            },
        } as unknown as ReturnType<typeof useAIArticlePublishedPreviewUrl>)
        jest.spyOn(history, 'push')
    })

    it('returns null when loading', () => {
        mockUseTopQuestionsFilters.mockReturnValueOnce({
            isLoading: true,
            selectedStore: undefined,
            selectedHelpCenter: undefined,
            storeFilter: {
                options: [],
                setSelectedStoreIntegrationId: jest.fn(),
            },
            helpCenterFilter: {
                options: [],
                setSelectedHelpCenterId: jest.fn(),
            },
        })
        const {container} = renderComponent()

        expect(container.firstChild).toBeNull()
    })

    it('returns null when loading email to store connections', () => {
        mockUseHasEmailToStoreConnection.mockReturnValue({
            hasEmailToStoreConnection: false,
            isLoading: true,
        })

        const {container} = renderComponent()

        expect(container.firstChild).toBeNull
    })

    it('return empty state section when selected store has no connection to email', () => {
        mockUseHasEmailToStoreConnection.mockReturnValue({
            hasEmailToStoreConnection: false,
            isLoading: false,
        })

        renderComponent()

        expect(
            screen.getByText(
                'This store must be connected to an email to receive recommendations.'
            )
        ).toBeInTheDocument()
    })

    it('renders AutomateAllRecommendationsPage correctly', () => {
        renderComponent()

        expect(screen.getByText('All Recommendations')).toBeInTheDocument()
        expect(screen.getByText('AI Generated Article 2')).toBeInTheDocument()
        expect(screen.getByText('ARCHIVED')).toBeInTheDocument()

        expect(mockUseTopQuestionsViewedOnPage).toBeCalledWith(
            1,
            11,
            'all-recommendations',
            new Date(batchDatetime)
        )

        expect(mockUseTopQuestionsFilters).toBeCalledWith({
            initialStoreId: 1,
            initialHelpCenterId: 11,
            searchFirstMatchingStoreAndHelpCenter: false,
        })
    })

    it('creates article', async () => {
        renderComponent()

        fireEvent.click(screen.getAllByText('Create Article')[0])

        await waitFor(() => {
            expect(mockCreateArticle).toHaveBeenCalledTimes(1)
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.AutomateTopQuestionsAllRecommendationsCreateArticle
        )
    })

    it('renders AutomateAllRecommendationsPage with new badge', () => {
        mockUseTopQuestionsViewedOnPage.mockReturnValue(false)
        renderComponent()

        expect(screen.getByText('All Recommendations')).toBeInTheDocument()
        expect(screen.getByText('AI Generated Article 2')).toBeInTheDocument()
        expect(screen.getByText('ARCHIVED')).toBeInTheDocument()

        expect(screen.getByText('5 NEW')).toBeInTheDocument()
    })

    it('does not render AutomateAllRecommendationsPage with new badge when loading', () => {
        const dateNow = new Date('2024-07-10T10:10:10.500Z')
        jest.useFakeTimers().setSystemTime(dateNow)

        mockUseTopQuestionsViewedOnPage.mockReturnValue(false)
        mockUseAIArticleRecommendationItems.mockReturnValue({
            paginatedItems: paginatedItemsFixture,
            itemsCount: 5,
            totalItemsCount: 5,
            isLoading: true,
            batchDatetime: undefined,
        } as unknown as ReturnType<typeof useAIArticleRecommendationItems>)

        renderComponent()

        expect(screen.queryByText('5 NEW')).not.toBeInTheDocument()

        expect(mockUseTopQuestionsViewedOnPage).toBeCalledWith(
            1,
            11,
            'all-recommendations',
            dateNow
        )
    })

    it('updates query params when store changes', async () => {
        const {rerender} = renderComponent()

        fireEvent.click(screen.getByText('Store 4'))

        await waitFor(() => {
            expect(
                storeFilter.setSelectedStoreIntegrationId
            ).toHaveBeenCalledWith(4)
        })

        mockUseTopQuestionsFilters.mockReturnValue({
            isLoading: false,
            selectedStore: {
                name: 'Store 4',
                id: 4,
            },
            storeFilter,
            selectedHelpCenter: {
                name: helpCenterFilter.options[0].name,
                id: helpCenterFilter.options[0].helpCenterId,
            },
            helpCenterFilter,
        } as unknown as ReturnType<typeof useTopQuestionsFilters>)

        rerender(
            <Router history={history}>
                <Provider store={mockStore(defaultState)}>
                    <AutomateAllRecommendationsPage />
                </Provider>
            </Router>
        )

        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith({
                pathname: '/app/automation/ai-recommendations',
                search: `store_integration_id=4&help_center_id=11`,
            })
        })
    })
    it('updates query params when Help Center changes', async () => {
        const {rerender} = renderComponent()

        fireEvent.click(screen.getByText('Help Center 2'))

        await waitFor(() => {
            expect(
                helpCenterFilter.setSelectedHelpCenterId
            ).toHaveBeenCalledWith(22)
        })

        mockUseTopQuestionsFilters.mockReturnValue({
            isLoading: false,
            selectedStore: {
                name: storeFilter.options[0].shopName,
                id: storeFilter.options[0].integrationId,
            },
            storeFilter,
            selectedHelpCenter: {
                name: helpCenterFilter.options[1].name,
                id: helpCenterFilter.options[1].helpCenterId,
            },
            helpCenterFilter,
        } as unknown as ReturnType<typeof useTopQuestionsFilters>)

        rerender(
            <Router history={history}>
                <Provider store={mockStore(defaultState)}>
                    <AutomateAllRecommendationsPage />
                </Provider>
            </Router>
        )

        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith({
                pathname: '/app/automation/ai-recommendations',
                search: `store_integration_id=1&help_center_id=22`,
            })
        })
    })

    it('reads and updates status and page query params', async () => {
        mockUseSearchParam.mockImplementation((param) =>
            param === 'status'
                ? ['all', jest.fn()]
                : param === 'page'
                ? ['2', jest.fn()]
                : [null, jest.fn()]
        )
        mockUseLocation.mockReturnValue({
            pathname: '/app/automation/ai-recommendations',
            search: `store_integration_id=1&help_center_id=11&status=all&page=2`,
            state: undefined,
            hash: '',
        })

        mockUseAIArticleRecommendationItems.mockReturnValue({
            paginatedItems: paginatedItemsFixture,
            itemsCount: 40,
            totalItemsCount: 60,
            isLoading: false,
        } as unknown as ReturnType<typeof useAIArticleRecommendationItems>)

        const {container, rerender} = renderComponent()

        expect(mockUseAIArticleRecommendationItems).toHaveBeenCalledWith({
            currentPage: 2,
            helpCenterId: 11,
            itemsPerPage: 15,
            locale: undefined,
            origin: ArticleOrigin.ALL_RECOMMENDATIONS_PAGE,
            statusFilter: 'all',
            storeIntegrationId: 1,
        })

        fireEvent.click(screen.getByText('Not created'))

        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith({
                pathname: '/app/automation/ai-recommendations',
                search: `store_integration_id=1&help_center_id=11&status=not-created`,
            })
        })

        mockUseLocation.mockReturnValue({
            pathname: '/app/automation/ai-recommendations',
            search: `store_integration_id=1&help_center_id=11&status=not-created`,
            state: undefined,
            hash: '',
        })

        mockUseSearchParam.mockImplementation((param) =>
            param === 'status' ? ['not-created', jest.fn()] : [null, jest.fn()]
        )

        rerender(
            <Router history={history}>
                <Provider store={mockStore(defaultState)}>
                    <AutomateAllRecommendationsPage />
                </Provider>
            </Router>
        )

        const page3 = container.querySelector('[aria-label="page-3"]')
        expect(page3).toBeInTheDocument()
        fireEvent.click(page3!)

        await waitFor(() => {
            expect(history.push).toHaveBeenLastCalledWith({
                pathname: '/app/automation/ai-recommendations',
                search: `store_integration_id=1&help_center_id=11&status=not-created&page=3`,
            })
        })
    })

    it('does not update query params if there is no change', () => {
        mockUseAIArticleRecommendationItems.mockReturnValue({
            paginatedItems: paginatedItemsFixture,
            itemsCount: 40,
            totalItemsCount: 60,
            isLoading: false,
        } as unknown as ReturnType<typeof useAIArticleRecommendationItems>)

        const {container} = renderComponent()

        const page1 = container.querySelector('[aria-label="page-1"]')
        expect(page1).toBeInTheDocument()
        fireEvent.click(page1!)

        expect(history.push).not.toHaveBeenCalledWith(
            expect.stringContaining('page=1')
        )

        fireEvent.click(screen.getAllByText('Not created')[1])

        expect(history.push).not.toHaveBeenCalledWith(
            expect.stringContaining('status=not-created')
        )
    })

    it('redirect preview to help center editor if the article published is unlisted', () => {
        mockUseSearchParam.mockImplementation((param) =>
            param === 'status'
                ? ['article-created', jest.fn()]
                : param === 'page'
                ? ['1', jest.fn()]
                : [null, jest.fn()]
        )
        mockUseLocation.mockReturnValue({
            pathname: '/app/automation/ai-recommendations',
            search: `store_integration_id=1&help_center_id=11&status=article-created&page=1`,
            state: undefined,
            hash: '',
        })
        mockUseAIArticlePublishedPreviewUrl.mockReturnValue({
            url: 'https://test-preview.com',
            article: {
                id: 123,
                translation: {
                    visibility_status: 'UNLISTED',
                },
            },
        } as unknown as ReturnType<typeof useAIArticlePublishedPreviewUrl>)

        renderComponent()

        expect(screen.getByText('AI Generated Article 4')).toBeInTheDocument()

        const linkElement = screen.getAllByRole('link', {
            name: /open_in_new/i,
        })[0]

        expect(linkElement).toHaveAttribute(
            'href',
            `/app/settings/help-center/11/articles?article_id=123`
        )
    })

    it('redirect preview to help center editor if the help center is not live', () => {
        mockUseSearchParam.mockImplementation((param) =>
            param === 'status'
                ? ['article-created', jest.fn()]
                : param === 'page'
                ? ['1', jest.fn()]
                : [null, jest.fn()]
        )
        mockUseLocation.mockReturnValue({
            pathname: '/app/automation/ai-recommendations',
            search: `store_integration_id=1&help_center_id=11&status=article-created&page=1`,
            state: undefined,
            hash: '',
        })
        mockGetHelpCenterFAQList.mockReturnValue([
            {
                id: 11,
                name: 'Help Center 1',
                type: 'faq',
                deactivated_datetime: '2021-01-15T15:26:02.575404+00:00',
            },
        ] as unknown as ReturnType<typeof getHelpCenterFAQList>)

        renderComponent()

        expect(screen.getByText('AI Generated Article 4')).toBeInTheDocument()

        const linkElement = screen.getAllByRole('link', {
            name: /open_in_new/i,
        })[0]

        expect(linkElement).toHaveAttribute(
            'href',
            `/app/settings/help-center/11/articles?article_id=123`
        )
    })

    it('redirect to article preview url when article is published', () => {
        mockUseSearchParam.mockImplementation((param) =>
            param === 'status'
                ? ['article-created', jest.fn()]
                : param === 'page'
                ? ['1', jest.fn()]
                : [null, jest.fn()]
        )
        mockUseLocation.mockReturnValue({
            pathname: '/app/automation/ai-recommendations',
            search: `store_integration_id=1&help_center_id=11&status=article-created&page=1`,
            state: undefined,
            hash: '',
        })

        renderComponent()

        expect(screen.getByText('AI Generated Article 4')).toBeInTheDocument()

        const linkElement = screen.getAllByRole('link', {
            name: /open_in_new/i,
        })[0]

        expect(linkElement).toHaveAttribute('href', 'https://test-preview.com')
    })

    it('render no Recommendations state view when there is no fetch article', () => {
        mockUseAIArticleRecommendationItems.mockReturnValue({
            paginatedItems: paginatedItemsFixture,
            itemsCount: 0,
            totalItemsCount: 0,
            isLoading: false,
            batchDatetime,
        } as unknown as ReturnType<typeof useAIArticleRecommendationItems>)

        renderComponent()

        expect(
            screen.getByText('You have no recommendations for this store yet.')
        ).toBeInTheDocument()
    })

    it('render no Data state view when there is no recommendation items in the selected status filter', () => {
        mockUseAIArticleRecommendationItems.mockReturnValue({
            paginatedItems: paginatedItemsFixture,
            itemsCount: 0,
            totalItemsCount: 5,
            isLoading: false,
            batchDatetime,
        } as unknown as ReturnType<typeof useAIArticleRecommendationItems>)

        renderComponent()

        expect(screen.getByText('No data available')).toBeInTheDocument()
        expect(
            screen.getByText('Try adjusting filters to get results.')
        ).toBeInTheDocument()
    })
})
