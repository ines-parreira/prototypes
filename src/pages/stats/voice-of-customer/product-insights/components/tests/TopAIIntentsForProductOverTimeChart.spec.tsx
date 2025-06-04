import ChartCard from 'pages/stats/common/components/ChartCard'
import { TopAIIntentsForProductOverTimeGraph } from 'pages/stats/voice-of-customer/product-insights/components/TopAIIntentsForProductOverTimeGraph'
import { TopAIIntentsForProductOverTimeChart } from 'pages/stats/voice-of-customer/product-insights/components/TopAIIntentsOverTimeForProductChart'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'pages/stats/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { RootState } from 'state/types'
import { initialState, sidePanelSlice } from 'state/ui/stats/sidePanelSlice'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('pages/stats/common/components/ChartCard')
const ChartCardMock = assumeMock(ChartCard)
jest.mock(
    'pages/stats/voice-of-customer/product-insights/components/TopAIIntentsForProductOverTimeGraph',
)
const TopAIIntentsForProductOverTimeGraphMock = assumeMock(
    TopAIIntentsForProductOverTimeGraph,
)

describe('TopAIIntentsForProductOverTimeChart', () => {
    const defaultState = {
        ui: {
            stats: {
                [sidePanelSlice.name]: initialState,
            },
        },
    } as RootState
    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TopAIIntentsOverTimeChart
        ]

    const productId = '123'

    ChartCardMock.mockImplementation(({ children }) => <div>{children}</div>)
    TopAIIntentsForProductOverTimeGraphMock.mockImplementation(() => (
        <div></div>
    ))

    it('should not render the chart when no productId', () => {
        renderWithStore(<TopAIIntentsForProductOverTimeChart />, defaultState)

        expect(
            TopAIIntentsForProductOverTimeGraphMock,
        ).not.toHaveBeenCalledWith(
            {
                productId,
            },
            {},
        )
    })

    it('should render the chart', () => {
        const stateWithProductInSidePanel = {
            ui: {
                stats: {
                    [sidePanelSlice.name]: {
                        ...initialState,
                        product: { id: productId, name: 'some name' },
                    },
                },
            },
        } as RootState
        renderWithStore(
            <TopAIIntentsForProductOverTimeChart />,
            stateWithProductInSidePanel,
        )

        expect(TopAIIntentsForProductOverTimeGraphMock).toHaveBeenCalledWith(
            {
                productId,
            },
            {},
        )
    })

    it('should render title & tooltip', () => {
        renderWithStore(<TopAIIntentsForProductOverTimeChart />, defaultState)

        expect(ChartCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: title,
                hint: hint,
            }),
            {},
        )
    })
})
