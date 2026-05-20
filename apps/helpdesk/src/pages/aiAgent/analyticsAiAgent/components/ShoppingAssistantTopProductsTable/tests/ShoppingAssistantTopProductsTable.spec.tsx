import { ReportingMetricBreakdownTable } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import type { ShoppingAssistantTopProductRow } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'
import { useShoppingAssistantTopProductsMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'

import { SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS } from '../columns'
import { ShoppingAssistantTopProductsTable } from '../ShoppingAssistantTopProductsTable'

jest.mock('@repo/reporting')
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantTopProductsTable/DownloadShoppingAssistantTopProductsButton',
    () => ({
        DownloadShoppingAssistantTopProductsButton: () => (
            <div>Download Shopping Assistant Top Products</div>
        ),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics',
)

const mockReportingMetricBreakdownTable = assumeMock(
    ReportingMetricBreakdownTable,
)
const mockUseShoppingAssistantTopProductsMetrics = assumeMock(
    useShoppingAssistantTopProductsMetrics,
)

const defaultFlatData: ShoppingAssistantTopProductRow[] = [
    {
        entity: '1',
        [ProductTableKeys.NumberOfRecommendations]: 100,
        [ProductTableKeys.CTR]: 0.25,
        [ProductTableKeys.BTR]: 0.1,
    },
    {
        entity: '2',
        [ProductTableKeys.NumberOfRecommendations]: 50,
        [ProductTableKeys.CTR]: 0.15,
        [ProductTableKeys.BTR]: 0.05,
    },
]

const defaultMockReturn = {
    flatData: defaultFlatData,
    productNameMap: { '1': 'Test Product 1', '2': 'Test Product 2' },
    productUrlMap: {
        '1': 'https://example.com/product/1',
        '2': undefined,
    },
    productImageMap: {
        '1': 'https://example.com/img1.jpg',
        '2': undefined,
    },
    isFetching: false,
    isError: false,
}

const renderComponent = (overrides: Partial<typeof defaultMockReturn> = {}) => {
    mockUseShoppingAssistantTopProductsMetrics.mockReturnValue({
        ...defaultMockReturn,
        ...overrides,
    })
    return render(<ShoppingAssistantTopProductsTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: ShoppingAssistantTopProductRow[]
        metricColumns: typeof SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS
        loadingStates: Record<string, boolean>
        getRowKey: (row: ShoppingAssistantTopProductRow) => string
        DownloadButton: React.ReactNode
        actionMenu?: React.ReactNode
        nameColumns: {
            accessor: string
            label: string
            formatName: (id: string) => string
            getHref: (id: string) => string | undefined
            getAvatarProps: (id: string) => {
                name: string
                url: string | undefined
            }
        }[]
    }

describe('ShoppingAssistantTopProductsTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockReportingMetricBreakdownTable.mockImplementation(
            ({ DownloadButton }) => <div>{DownloadButton}</div>,
        )
    })

    it('passes flat data to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toEqual(defaultFlatData)
    })

    it('passes SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            SHOPPING_ASSISTANT_TOP_PRODUCTS_COLUMNS,
        )
    })

    it('passes loadingStates reflecting isFetching for each metric', () => {
        renderComponent({ isFetching: true })

        expect(getLastCallProps().loadingStates).toEqual({
            [ProductTableKeys.NumberOfRecommendations]: true,
            [ProductTableKeys.CTR]: true,
            [ProductTableKeys.BTR]: true,
        })
    })

    it('passes nameColumns with product name accessor and label', () => {
        renderComponent()

        const { nameColumns } = getLastCallProps()

        expect(nameColumns[0].accessor).toBe('entity')
        expect(nameColumns[0].label).toBe('Product name')
    })

    it('passes formatName that maps product id to title', () => {
        renderComponent()

        const { formatName } = getLastCallProps().nameColumns[0]

        expect(formatName('1')).toBe('Test Product 1')
        expect(formatName('2')).toBe('Test Product 2')
        expect(formatName('999')).toBe('999')
    })

    it('passes getHref that maps product id to url', () => {
        renderComponent()

        const { getHref } = getLastCallProps().nameColumns[0]

        expect(getHref('1')).toBe('https://example.com/product/1')
        expect(getHref('2')).toBeUndefined()
    })

    it('passes getAvatarProps that maps product id to name and image url', () => {
        renderComponent()

        const { getAvatarProps } = getLastCallProps().nameColumns[0]

        expect(getAvatarProps('1')).toEqual({
            name: 'Test Product 1',
            url: 'https://example.com/img1.jpg',
        })
        expect(getAvatarProps('2')).toEqual({
            name: 'Test Product 2',
            url: undefined,
        })
        expect(getAvatarProps('999')).toEqual({
            name: '999',
            url: undefined,
        })
    })

    it('renders DownloadShoppingAssistantTopProductsButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download Shopping Assistant Top Products'),
        ).toBeInTheDocument()
    })

    it('passes an empty data array when the hook returns no data', () => {
        renderComponent({ flatData: [] })

        expect(getLastCallProps().data).toEqual([])
    })

    it('passes actionMenu to ReportingMetricBreakdownTable when chartId and withChartMenu are provided', () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue(
            defaultMockReturn,
        )
        render(
            <ShoppingAssistantTopProductsTable
                chartId="shopping_assistant_top_products_table"
                withChartMenu
            />,
        )

        expect(getLastCallProps().actionMenu).toBeDefined()
    })

    it('does not pass actionMenu to ReportingMetricBreakdownTable when chartId is not provided', () => {
        renderComponent()

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })

    it('does not pass actionMenu to ReportingMetricBreakdownTable when chartId is provided but withChartMenu is false', () => {
        mockUseShoppingAssistantTopProductsMetrics.mockReturnValue(
            defaultMockReturn,
        )
        render(
            <ShoppingAssistantTopProductsTable
                chartId="shopping_assistant_top_products_table"
                withChartMenu={false}
            />,
        )

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })
})
