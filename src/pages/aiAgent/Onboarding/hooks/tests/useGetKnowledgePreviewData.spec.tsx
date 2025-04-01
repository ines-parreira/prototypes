import { renderHook as reactRenderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'

import { useAverageDiscountPercentage } from 'pages/stats/automate/aiSalesAgent/useAverageDiscountPercentage'
import { useAverageOrdersPerDayTrend } from 'pages/stats/automate/aiSalesAgent/useAverageOrdersPerDayTrend'
import { assumeMock, mockStore } from 'utils/testing'

import { mockedAverageOrders } from '../../components/KnowledgePreview/constants'
import { useGetKnowledgePreviewData } from '../useGetKnowledgePreviewData'

const store = mockStore({})

jest.mock('pages/stats/automate/aiSalesAgent/useAverageOrdersPerDayTrend')
const mockUseAverageOrdersPerDayTrend = assumeMock(useAverageOrdersPerDayTrend)

jest.mock('pages/stats/automate/aiSalesAgent/useAverageDiscountPercentage')
const useAverageDiscountPercentageMock = assumeMock(
    useAverageDiscountPercentage,
)

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

        useAverageDiscountPercentageMock.mockReturnValue({
            isFetching: true,
            isError: false,
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
