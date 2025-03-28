import { renderHook as reactRenderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'

import { useAverageOrdersPerDayTrend } from 'pages/stats/automate/aiSalesAgent/useAverageOrdersPerDayTrend'
import { assumeMock, mockStore } from 'utils/testing'

import { mockedAverageOrders } from '../../components/KnowledgePreview/constants'
import { useGetKnowledgePreviewData } from '../useGetKnowledgePreviewData'

const store = mockStore({})

jest.mock('pages/stats/automate/aiSalesAgent/useAverageOrdersPerDayTrend')
const mockUseAverageOrdersPerDayTrend = assumeMock(useAverageOrdersPerDayTrend)

const mockAvarageOrdersPerDayRawData = () =>
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
        mockUseAverageOrdersPerDayTrend.mockReturnValue({
            data: [mockAvarageOrdersPerDayRawData()] as any,
        } as any)
    })

    it('should return averageOrders values if correctly returned by query', () => {
        const { result } = renderHook(() => useGetKnowledgePreviewData())

        expect(result.current.data.averageOrders).toEqual(mockedAverageOrders)
    })

    it('should return averageOrders as undefined if query returns undefiend', () => {
        mockUseAverageOrdersPerDayTrend.mockReturnValue({
            data: undefined,
        } as any)

        const { result } = renderHook(() => useGetKnowledgePreviewData())

        expect(result.current.data.averageOrders).toBeUndefined()
    })
})
