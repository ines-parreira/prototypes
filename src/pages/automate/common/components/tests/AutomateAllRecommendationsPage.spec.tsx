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
import {useTopQuestionsFilters} from '../TopQuestions/useTopQuestionsFilters'
import AutomateAllRecommendationsPage from '../AutomateAllRecommendationsPage'
import {useAIArticleRecommendationItems} from '../../hooks/useAIArticleRecommendationItems'
import {useLocalStorageTopQuestions} from '../../hooks/useLocalStorageTopQuestions'

const storeOptionsFixture = [
    {
        name: 'Store 1',
        id: 1,
    },
    {
        name: 'Store 2',
        id: 2,
    },
    {
        name: 'Store 3',
        id: 3,
    },
    {
        name: 'Store 4',
        id: 4,
    },
    {
        name: 'Store 5',
        id: 5,
    },
]

const helpCenterOptionsFixture = [
    {
        name: 'Help Center 1',
        id: 11,
    },
    {
        name: 'Help Center 2',
        id: 22,
    },
]

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
    const param1 = 'store_integration_id'
    const value1 = '1'
    const param2 = 'help_center_id'
    const value2 = '11'
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
            search: `${param1}=${value1}&${param2}=${value2}`,
            state: undefined,
            hash: '',
        })
        mockUseSearchParam.mockReturnValue([null, jest.fn()])
        mockUseTopQuestionsFilters.mockReturnValue({
            isLoading: false,
            selectedStore: storeOptionsFixture[0],
            setSelectedStore: jest.fn(),
            selectedHelpCenter: helpCenterOptionsFixture[0],
            setSelectedHelpCenter: jest.fn(),
            storeOptions: storeOptionsFixture,
            helpCentersOptions: helpCenterOptionsFixture,
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
            setSelectedStore: jest.fn(),
            selectedHelpCenter: undefined,
            setSelectedHelpCenter: jest.fn(),
            storeOptions: [],
            helpCentersOptions: [],
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
        renderComponent()

        fireEvent.click(screen.getByText('Store 4'))

        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith({
                pathname: '/app/automation/ai-recommendations',
                search: `${param1}=4&${param2}=${value2}`,
            })
        })
    })
    it('updates query params when Help Center changes', async () => {
        renderComponent()

        fireEvent.click(screen.getByText('Help Center 2'))

        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith({
                pathname: '/app/automation/ai-recommendations',
                search: `${param1}=${value1}&${param2}=22`,
            })
        })
    })
})
