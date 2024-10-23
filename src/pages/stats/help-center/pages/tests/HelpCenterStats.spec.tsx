import {fromJS} from 'immutable'
import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import userEvent from '@testing-library/user-event'
import {UseQueryResult} from '@tanstack/react-query'
import {mockFlags} from 'jest-launchdarkly-mock'
import {withDefaultLogicalOperator} from 'models/reporting/queryFactories/utils'
import {FeatureFlagKey} from 'config/featureFlags'
import {useHelpCenterList} from 'pages/settings/helpCenter/hooks/useHelpCenterList'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {initialState} from 'state/stats/statsSlice'
import {RootState} from 'state/types'
import configureStore from 'store/configureStore.prod'
import {SegmentEvent, logEvent} from 'common/segment'
import {useArticleViewTimeSeries} from 'pages/stats/help-center/hooks/useArticleViewTimeSeries'
import {InitialRootState} from 'types'
import HelpCenterStats from 'pages/stats/help-center/pages/HelpCenterStats'
import {HELP_CENTER_STATS_TEST_IDS} from 'pages/stats/help-center/pages/tests/constants'
import {getSortByName} from 'utils/getSortByName'
import {assumeMock, renderWithStore} from 'utils/testing'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'

jest.mock('common/segment')

jest.mock('pages/stats/help-center/hooks/useHelpCenterTrend', () => ({
    useHelpCenterTrend: () => ({data: {value: 1}, isFetching: false}),
}))
jest.mock('pages/stats/help-center/hooks/useArticleViewTimeSeries', () => ({
    useArticleViewTimeSeries: jest.fn(),
}))
jest.mock('pages/stats/help-center/hooks/useSearchTermsMetrics', () => ({
    useSearchTermsMetrics: () => ({data: [], isFetching: false}),
}))

jest.mock(
    'pages/stats/help-center/hooks/usePerformanceByArticleMetrics',
    () => ({
        usePerformanceByArticleMetrics: () => ({data: [], isFetching: false}),
    })
)
jest.mock('pages/stats/help-center/hooks/useNoSearchResultsMetrics', () => ({
    useNoSearchResultsMetrics: () => ({data: [], isFetching: false}),
}))
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList', () => ({
    useHelpCenterList: jest.fn(),
}))
jest.mock('pages/stats/help-center/hooks/useSearchResultRange', () => ({
    useSearchResultRange: () => ({data: [], isLoading: true}),
}))
jest.mock('pages/stats/DrillDownModal.tsx', () => ({
    DrillDownModal: () => null,
}))

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    useSupportedLocales: jest.fn(() => [
        {code: 'en-US', name: 'English'},
        {code: 'fr-FR', name: 'French'},
    ]),
}))

jest.mock(
    'pages/settings/helpCenter/components/AIArticlesLibraryView/hooks/useHelpCenterAIArticlesLibrary',
    () => ({
        useHelpCenterAIArticlesLibrary: () => ({hasNewArticles: false}),
    })
)

jest.mock('pages/stats/common/filters/FiltersPanel')
const filtersPanelMock = assumeMock(FiltersPanel)

const mockUseHelpCenterList = jest.mocked(useHelpCenterList)
const mockUseArticleViewTimeSeries = jest.mocked(useArticleViewTimeSeries)
const mockedLogEvent = jest.mocked(logEvent)

const helpCenters = getHelpCentersResponseFixture.data

const renderComponent = () => {
    const store = configureStore({} as InitialRootState)
    render(
        <Provider store={store}>
            <HelpCenterStats />
        </Provider>
    )
}

describe('<HelpCenterStats />', () => {
    beforeEach(() => {
        const mockedDate = new Date(1999, 10, 1)

        jest.useFakeTimers()
        jest.setSystemTime(mockedDate)

        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters,
            hasMore: false,
            fetchMore: jest.fn(),
        })
        mockUseArticleViewTimeSeries.mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as UseQueryResult<TimeSeriesDataItem[][]>)

        filtersPanelMock.mockImplementation(() => <div>FiltersPanelMock</div>)
        mockFlags({
            [FeatureFlagKey.AnalyticsNewFiltersHelpCenter]: false,
        })
    })

    it('should render page with title and sections', () => {
        renderComponent()

        expect(mockedLogEvent.mock.calls[0][0]).toEqual(
            SegmentEvent.HelpCenterStatisticsPageViewed
        )
        expect(mockedLogEvent).toHaveBeenCalledTimes(1)
        expect(screen.getByText('Help Center')).toBeInTheDocument()
        expect(screen.getByText('Overview')).toBeInTheDocument()
        expect(screen.getByText('Performance')).toBeInTheDocument()
        expect(screen.getByText('Help Center searches')).toBeInTheDocument()
        expect(
            screen.getByText('Analytics are using UTC timezone')
        ).toBeInTheDocument()
    })

    it('should show loading state', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: true,
            helpCenters: getHelpCentersResponseFixture.data,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByTestId(HELP_CENTER_STATS_TEST_IDS.LOADER)
        ).toBeInTheDocument()
    })

    it('should show empty state when help center deactivated', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [
                {
                    ...getHelpCentersResponseFixture.data[0],
                    deactivated_datetime: '2021-01-01T00:00:00Z',
                },
            ],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByTestId(HELP_CENTER_STATS_TEST_IDS.EMPTY_STATE)
        ).toBeInTheDocument()
    })

    it('should show empty state when help center list is empty', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByTestId(HELP_CENTER_STATS_TEST_IDS.EMPTY_STATE)
        ).toBeInTheDocument()
    })

    it('should show alert when selected help center unpublished', () => {
        const unpublishedHelpCenter = {
            ...getHelpCentersResponseFixture.data[0],
            deactivated_datetime: '2021-01-01T00:00:00.000Z',
        }
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [
                unpublishedHelpCenter,
                getHelpCentersResponseFixture.data[0],
            ],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByText(
                'Set your Help Center back to live in order to view performance insights.'
            )
        ).toBeInTheDocument()
    })

    it('should change help center when filter changed', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: getHelpCentersResponseFixture.data,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(mockUseArticleViewTimeSeries).toHaveBeenCalledWith(
            expect.objectContaining({
                helpCenters: withDefaultLogicalOperator([helpCenters[0].id]),
            }),
            expect.anything(),
            expect.anything()
        )

        userEvent.click(screen.getByText(helpCenters[0].name))
        userEvent.click(screen.getByText(helpCenters[1].name))

        expect(mockUseArticleViewTimeSeries).toHaveBeenLastCalledWith(
            expect.objectContaining({
                helpCenters: withDefaultLogicalOperator([helpCenters[1].id]),
            }),
            expect.anything(),
            expect.anything()
        )
    })

    it('should set initial help center filter by sorted help center list', () => {
        const helpCenterFixture = getHelpCentersResponseFixture.data[0]
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [
                {...helpCenterFixture, name: 'B', id: 3},
                {...helpCenterFixture, name: 'A', id: 1},
                {...helpCenterFixture, name: 'C', id: 2},
                {...helpCenterFixture, name: 'D', id: 4},
            ],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(
            screen.getByTestId(HELP_CENTER_STATS_TEST_IDS.FILTER)
        ).toHaveTextContent('A')
    })

    it('should set initial help center filter with first help center from the list', async () => {
        const helpCenterFixture = getHelpCentersResponseFixture.data[0]
        const helpCenters = [
            {...helpCenterFixture, name: 'B', id: 3},
            {...helpCenterFixture, name: 'A', id: 1},
            {...helpCenterFixture, name: 'C', id: 2},
            {...helpCenterFixture, name: 'D', id: 4},
        ]
        const state = {
            stats: {
                filters: {
                    ...initialState.filters,
                    helpCenters: withDefaultLogicalOperator<number>([]),
                    localeCodes: withDefaultLogicalOperator<string>([]),
                },
            },
            ui: {
                stats: {
                    filters: {
                        cleanStatsFilters: {
                            ...initialState.filters,
                            helpCenters: withDefaultLogicalOperator<number>([]),
                            localeCodes: withDefaultLogicalOperator<string>([]),
                        },
                    },
                },
            },
            integrations: fromJS({
                integrations: [],
            }),
        } as RootState
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: helpCenters,
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderWithStore(<HelpCenterStats />, state)

        await waitFor(() => {
            expect(
                screen.getByTestId(HELP_CENTER_STATS_TEST_IDS.FILTER)
            ).toHaveTextContent(helpCenters.sort(getSortByName)[0].name)
        })
    })

    it('should set initial help center filter with selected help center', async () => {
        const helpCenterFixture = getHelpCentersResponseFixture.data[0]
        const selectedHelpCenter = {...helpCenterFixture, name: 'D', id: 4}
        const state = {
            stats: {
                filters: {
                    ...initialState.filters,
                    helpCenters: withDefaultLogicalOperator([
                        selectedHelpCenter.id,
                    ]),
                    localeCodes: withDefaultLogicalOperator<string>([]),
                },
            },
            ui: {
                stats: {
                    filters: {
                        cleanStatsFilters: {
                            ...initialState.filters,
                            helpCenters: withDefaultLogicalOperator([
                                selectedHelpCenter.id,
                            ]),
                            localeCodes: withDefaultLogicalOperator<string>([]),
                        },
                    },
                },
            },
            integrations: fromJS({
                integrations: [],
            }),
        } as RootState
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [
                {...helpCenterFixture, name: 'B', id: 3},
                {...helpCenterFixture, name: 'A', id: 1},
                {...helpCenterFixture, name: 'C', id: 2},
                selectedHelpCenter,
            ],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderWithStore(<HelpCenterStats />, state)

        await waitFor(() => {
            expect(
                screen.getByTestId(HELP_CENTER_STATS_TEST_IDS.FILTER)
            ).toHaveTextContent(selectedHelpCenter.name)
        })
    })

    it('should change language when filter changed', () => {
        mockUseHelpCenterList.mockReturnValue({
            isLoading: false,
            helpCenters: [
                {
                    ...getHelpCentersResponseFixture.data[0],
                    supported_locales: ['en-US', 'fr-FR'],
                },
            ],
            hasMore: false,
            fetchMore: jest.fn(),
        })

        renderComponent()

        expect(mockUseArticleViewTimeSeries).toHaveBeenCalledWith(
            expect.objectContaining({
                localeCodes: withDefaultLogicalOperator(['en-US', 'fr-FR']),
            }),
            expect.anything(),
            expect.anything()
        )

        // Open dropdown
        userEvent.click(screen.getByText('2 languages'))
        // Select language
        userEvent.click(screen.getByText('English'))
        // Close dropdown
        userEvent.click(document.body)

        expect(mockUseArticleViewTimeSeries).toHaveBeenLastCalledWith(
            expect.objectContaining({
                localeCodes: withDefaultLogicalOperator(['fr-FR']),
            }),
            expect.anything(),
            expect.anything()
        )
    })

    describe('FilterPanel', () => {
        beforeEach(() => {
            mockFlags({
                [FeatureFlagKey.AnalyticsNewFiltersHelpCenter]: true,
            })
        })

        it('should show New Filters Panel', () => {
            renderComponent()

            expect(filtersPanelMock).toHaveBeenCalled()
        })
    })
})
