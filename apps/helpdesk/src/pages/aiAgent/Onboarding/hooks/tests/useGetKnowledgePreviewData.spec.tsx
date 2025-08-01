import { assumeMock, renderHook } from '@repo/testing'
import { Provider } from 'react-redux'

import { useAverageDiscountPercentage } from 'domains/reporting/pages/automate/aiSalesAgent/useAverageDiscountPercentage'
import { useAverageOrdersPerDayTrend } from 'domains/reporting/pages/automate/aiSalesAgent/useAverageOrdersPerDayTrend'
import { mockedAverageOrders } from 'pages/aiAgent/Onboarding/components/KnowledgePreview/constants'
import useTopProducts from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { useGetAverageOrderValue } from 'pages/aiAgent/Onboarding/hooks/useGetAverageOrderValue'
import { useGetRepeatRate } from 'pages/aiAgent/Onboarding/hooks/useGetRepeatRate'
import { mockStore } from 'utils/testing'

import { useGetKnowledgePreviewData } from '../useGetKnowledgePreviewData'

const store = mockStore({})

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/useAverageOrdersPerDayTrend',
)
const mockUseAverageOrdersPerDayTrend = assumeMock(useAverageOrdersPerDayTrend)

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/useAverageDiscountPercentage',
)
const useAverageDiscountPercentageMock = assumeMock(
    useAverageDiscountPercentage,
)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetAverageOrderValue')
const mockUseGetAverageOrderValue = assumeMock(useGetAverageOrderValue)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetRepeatRate')
const mockUseGetRepeatRate = assumeMock(useGetRepeatRate)

jest.mock('pages/aiAgent/Onboarding/components/TopProductsCard/hooks')
const mockUseTopProducts = assumeMock(useTopProducts)

const mockAverageOrdersPerDayRawData = () =>
    mockedAverageOrders[0].values.map((item) => ({
        value: item.y,
        dateTime: item.x,
    }))

const renderHookWithWrapper = (hook: typeof useGetKnowledgePreviewData) => {
    return renderHook(hook, {
        wrapper: ({ children }) => (
            <Provider store={store}>{children}</Provider>
        ),
    })
}

describe('useGetKnowledgePreviewData', () => {
    beforeAll(() => {
        jest.clearAllMocks()

        mockUseAverageOrdersPerDayTrend.mockReturnValue({
            data: [mockAverageOrdersPerDayRawData()] as any,
        } as any)

        mockUseGetAverageOrderValue.mockReturnValue({
            isLoading: false,
            data: 950,
        })
        mockUseGetRepeatRate.mockReturnValue({
            isLoading: false,
            data: 2,
        })

        useAverageDiscountPercentageMock.mockReturnValue({
            isFetching: true,
            isError: false,
        })

        mockUseTopProducts.mockReturnValue({
            data: [],
            isLoading: false,
        })
    })

    it('should return averageOrders values if correctly returned by query', () => {
        const { result } = renderHookWithWrapper(() =>
            useGetKnowledgePreviewData({ shopIntegrationId: 1 }),
        )

        expect(result.current.data.averageOrders).toEqual(mockedAverageOrders)
    })

    it('should return averageOrders as undefined if query returns undefined', () => {
        mockUseAverageOrdersPerDayTrend.mockReturnValue({
            data: undefined,
        } as any)

        const { result } = renderHookWithWrapper(() =>
            useGetKnowledgePreviewData({ shopIntegrationId: 1 }),
        )

        expect(result.current.data.averageOrders).toBeUndefined()
    })

    it('should return averageDiscountPercentage as undefined when loading', () => {
        useAverageDiscountPercentageMock.mockClear()
        useAverageDiscountPercentageMock.mockReturnValue({
            isFetching: true,
            isError: false,
        })

        const { result } = renderHookWithWrapper(() =>
            useGetKnowledgePreviewData({ shopIntegrationId: 1 }),
        )

        expect(result.current.data.averageDiscount).toBeUndefined()
    })

    it('should return averageDiscountPercentage as 10 when no result', () => {
        useAverageDiscountPercentageMock.mockClear()
        useAverageDiscountPercentageMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
            },
        })

        const { result } = renderHookWithWrapper(() =>
            useGetKnowledgePreviewData({ shopIntegrationId: 1 }),
        )

        expect(result.current.data.averageDiscount).toBe(10)
    })

    it('should return averageDiscountPercentage as 10 when data is undefined', () => {
        useAverageDiscountPercentageMock.mockClear()
        useAverageDiscountPercentageMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: undefined,
        })

        const { result } = renderHookWithWrapper(() =>
            useGetKnowledgePreviewData({ shopIntegrationId: 1 }),
        )

        expect(result.current.data.averageDiscount).toBe(10)
    })

    it('should return averageDiscountPercentage when has a result', () => {
        useAverageDiscountPercentageMock.mockClear()
        useAverageDiscountPercentageMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 10,
            },
        })

        const { result } = renderHookWithWrapper(() =>
            useGetKnowledgePreviewData({ shopIntegrationId: 1 }),
        )

        expect(result.current.data.averageDiscount).toBe(10)
    })
})
