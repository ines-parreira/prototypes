import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { useReportChartRestrictions } from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import { TopAIIntentsForProductOverTimeChart } from 'pages/stats/voice-of-customer/product-insights/components/TopAIIntentsOverTimeForProductChart'
import { NegativeSentimentsPerProductKpiChart } from 'pages/stats/voice-of-customer/side-panel/NegativeSentimentsPerProductKpiChart'
import { PositiveSentimentsPerProductKpiChart } from 'pages/stats/voice-of-customer/side-panel/PositiveSentimentsPerProductKpiChart'
import { ProductHeader } from 'pages/stats/voice-of-customer/TrendOverview/ProductHeader'
import { TrendOverviewReport } from 'pages/stats/voice-of-customer/TrendOverview/TrendOverviewReport'
import { defaultStatsFilters } from 'state/stats/statsSlice'
import { RootState } from 'state/types'
import {
    initialState as filterSliceInitialState,
    filtersSlice,
} from 'state/ui/stats/filtersSlice'
import {
    initialState,
    sidePanelSlice,
    SidePanelTab,
} from 'state/ui/stats/sidePanelSlice'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('pages/stats/report-chart-restrictions/useReportChartRestrictions')
const useReportChartRestrictionsMock = assumeMock(useReportChartRestrictions)
jest.mock(
    'pages/stats/voice-of-customer/product-insights/components/TopAIIntentsOverTimeForProductChart',
)
const TopAIIntentsForProductOverTimeChartMock = assumeMock(
    TopAIIntentsForProductOverTimeChart,
)
jest.mock(
    'pages/stats/voice-of-customer/side-panel/NegativeSentimentsPerProductKpiChart',
)
const PositiveSentimentsPerProductKpiChartMock = assumeMock(
    PositiveSentimentsPerProductKpiChart,
)
jest.mock(
    'pages/stats/voice-of-customer/side-panel/PositiveSentimentsPerProductKpiChart',
)
const NegativeSentimentsPerProductKpiChartMock = assumeMock(
    NegativeSentimentsPerProductKpiChart,
)
jest.mock('pages/stats/voice-of-customer/TrendOverview/ProductHeader')
const ProductTrendHeaderMock = assumeMock(ProductHeader)

describe('TrendOverviewReport', () => {
    const productId = 'productId'
    const productName = 'Some product name'

    const defaultState = {
        currentUser: fromJS({ role: { name: UserRole.Admin } }),
        stats: {
            filters: defaultStatsFilters,
        },
        ui: {
            stats: {
                [filtersSlice.name]: filterSliceInitialState,
                [sidePanelSlice.name]: {
                    ...initialState,
                    product: {
                        id: productId,
                        name: productName,
                        thumbnail_url: '',
                    },
                    activeTab: SidePanelTab.TrendOverview,
                },
            },
        },
    } as RootState

    beforeEach(() => {
        useReportChartRestrictionsMock.mockImplementation(() => ({
            isRouteRestrictedToCurrentUser: () => false,
            isChartRestrictedToCurrentUser: () => false,
            isModuleRestrictedToCurrentUser: () => false,
        }))
        ProductTrendHeaderMock.mockImplementation(() => <div />)
        TopAIIntentsForProductOverTimeChartMock.mockImplementation(() => (
            <div />
        ))
        PositiveSentimentsPerProductKpiChartMock.mockImplementation(() => (
            <div />
        ))
        NegativeSentimentsPerProductKpiChartMock.mockImplementation(() => (
            <div />
        ))
    })

    it('should render the Product Header', () => {
        renderWithStore(<TrendOverviewReport />, defaultState)

        expect(ProductTrendHeaderMock).toHaveBeenCalled()
    })

    it('should render Charts', () => {
        renderWithStore(<TrendOverviewReport />, defaultState)

        expect(TopAIIntentsForProductOverTimeChartMock).toHaveBeenCalled()
        expect(PositiveSentimentsPerProductKpiChartMock).toHaveBeenCalled()
        expect(NegativeSentimentsPerProductKpiChartMock).toHaveBeenCalled()
    })
})
