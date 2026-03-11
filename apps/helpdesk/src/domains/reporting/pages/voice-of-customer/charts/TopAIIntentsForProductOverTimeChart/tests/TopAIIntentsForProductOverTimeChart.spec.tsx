import { assumeMock } from '@repo/testing'

import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { TopAIIntentsForProductOverTimeGraph } from 'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsForProductOverTimeChart/TopAIIntentsForProductOverTimeGraph'
import { TopAIIntentsForProductOverTimeChart } from 'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsForProductOverTimeChart/TopAIIntentsOverTimeForProductChart'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsChartConfig'
import {
    initialState,
    sidePanelSlice,
} from 'domains/reporting/state/ui/stats/sidePanelSlice'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/pages/common/components/ChartCard')
const ChartCardMock = assumeMock(ChartCard)
jest.mock(
    'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsForProductOverTimeChart/TopAIIntentsForProductOverTimeGraph',
)
const TopAIIntentsForProductOverTimeGraphMock = assumeMock(
    TopAIIntentsForProductOverTimeGraph,
)
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
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
    const intentCustomFieldId = 123

    beforeEach(() => {
        ChartCardMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
        TopAIIntentsForProductOverTimeGraphMock.mockImplementation(() => (
            <div></div>
        ))
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: 123,
            intentCustomFieldId: intentCustomFieldId,
            outcomeCustomFieldId: 789,
            isLoading: false,
        })
    })

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
                intentCustomFieldId,
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
