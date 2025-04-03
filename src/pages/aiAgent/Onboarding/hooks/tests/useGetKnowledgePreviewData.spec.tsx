import { renderHook as reactRenderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'

import { mockedAverageOrders } from 'pages/aiAgent/Onboarding/components/KnowledgePreview/constants'
import useTopProducts from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { useGetAverageOrderValue } from 'pages/aiAgent/Onboarding/hooks/useGetAverageOrderValue'
import { useGetRepeatRate } from 'pages/aiAgent/Onboarding/hooks/useGetRepeatRate'
import { useAverageDiscountPercentage } from 'pages/stats/automate/aiSalesAgent/useAverageDiscountPercentage'
import { useAverageOrdersPerDayTrend } from 'pages/stats/automate/aiSalesAgent/useAverageOrdersPerDayTrend'
import { assumeMock, mockStore } from 'utils/testing'

import { useGetKnowledgePreviewData } from '../useGetKnowledgePreviewData'

const store = mockStore({})

jest.mock('pages/stats/automate/aiSalesAgent/useAverageOrdersPerDayTrend')
const mockUseAverageOrdersPerDayTrend = assumeMock(useAverageOrdersPerDayTrend)

jest.mock('pages/stats/automate/aiSalesAgent/useAverageDiscountPercentage')
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

const renderHook = (hook: typeof useGetKnowledgePreviewData) => {
    return reactRenderHook(hook, {
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
        const { result } = renderHook(() =>
            useGetKnowledgePreviewData({ shopIntegrationId: 1 }),
        )

        expect(result.current.data.averageOrders).toEqual(mockedAverageOrders)
    })

    it('should return averageOrders as undefined if query returns undefined', () => {
        mockUseAverageOrdersPerDayTrend.mockReturnValue({
            data: undefined,
        } as any)

        const { result } = renderHook(() =>
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

        const { result } = renderHook(() =>
            useGetKnowledgePreviewData({ shopIntegrationId: 1 }),
        )

        expect(result.current.data.averageDiscount).toBeUndefined()
    })

    it('should return averageDiscountPercentage as 0 when no result', () => {
        useAverageDiscountPercentageMock.mockClear()
        useAverageDiscountPercentageMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: null,
            },
        })

        const { result } = renderHook(() =>
            useGetKnowledgePreviewData({ shopIntegrationId: 1 }),
        )

        expect(result.current.data.averageDiscount).toBe(0)
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

        const { result } = renderHook(() =>
            useGetKnowledgePreviewData({ shopIntegrationId: 1 }),
        )

        expect(result.current.data.averageDiscount).toBe(10)
    })
})
