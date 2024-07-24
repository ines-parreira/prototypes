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
import {useTopQuestionsFilters} from '../TopQuestions/useTopQuestionsFilters'
import AutomateAllRecommendationsPage from '../AutomateAllRecommendationsPage'
import {useAIArticleRecommendationItems} from '../../hooks/useAIArticleRecommendationItems'
import {useLocalStorageTopQuestions} from '../../hooks/useLocalStorageTopQuestions'

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

const paginatedItemsFixture = [
    {
        title: 'How to cancel order',
        templateKey: 'ai_Generated_3',
        ticketsCount: 8,
        reviewAction: undefined,
    },
    {
        title: 'AI Generated Article 1',
        templateKey: 'ai_Generated_1',
        ticketsCount: 5,
        reviewAction: undefined,
    },
    {
        title: 'AI Generated Article 2',
        templateKey: 'ai_Generated_2',
        ticketsCount: 3,
        reviewAction: 'archive',
    },
]

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

jest.mock('../../hooks/useAIArticleRecommendationItems')
const mockUseAIArticleRecommendationItems = assumeMock(
    useAIArticleRecommendationItems
)

jest.mock('../../hooks/useLocalStorageTopQuestions')
const mockUseLocalStorageTopQuestions = assumeMock(useLocalStorageTopQuestions)

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
            totalItemsCount: 3,
            isLoading: false,
        } as unknown as ReturnType<typeof useAIArticleRecommendationItems>)
        mockUseLocalStorageTopQuestions.mockReturnValue({
            viewedOnPages: new Set([
                'automate-overview',
                'all-recommendations',
            ]),
            addViewedOnPage: jest.fn(),
        })
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

    it('renders AutomateAllRecommendationsPage correctly', () => {
        renderComponent()

        expect(screen.getByText('All Recommendations')).toBeInTheDocument()
        expect(screen.getByText('AI Generated Article 2')).toBeInTheDocument()
        expect(screen.getByText('ARCHIVED')).toBeInTheDocument()
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
})
