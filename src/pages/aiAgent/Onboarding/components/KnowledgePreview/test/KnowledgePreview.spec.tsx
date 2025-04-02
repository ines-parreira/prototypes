import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import {
    mockedAverageOrders,
    mockedCategories,
    mockedProducts,
} from 'pages/aiAgent/Onboarding/components/KnowledgePreview/constants'
import KnowledgePreview from 'pages/aiAgent/Onboarding/components/KnowledgePreview/KnowledgePreview'
import useTopProducts from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { useGetAverageOrderValueLastMonth } from 'pages/aiAgent/Onboarding/hooks/useGetAverageOrderValueLastMonth'
import { useGetKnowledgePreviewData } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgePreviewData'
import { useGetRepeatRateLastMonth } from 'pages/aiAgent/Onboarding/hooks/useGetRepeatRateLastMonth'
import { useTopLocations } from 'pages/aiAgent/Onboarding/hooks/useTopLocations'
import { assumeMock } from 'utils/testing'

const mockStore = configureMockStore([thunk])()

const defaultPreviewData = {
    products: mockedProducts,
    experienceScore: 50,
    categories: mockedCategories,
    averageDiscount: 10,
    averageOrders: mockedAverageOrders,
    repeatRate: 2,
}

jest.mock('pages/aiAgent/Onboarding/hooks/useGetKnowledgePreviewData')
const mockUseGetKnowledgePreviewData = assumeMock(useGetKnowledgePreviewData)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetAverageOrderValueLastMonth')
const mockUseGetAverageOrderValueLastMonth = assumeMock(
    useGetAverageOrderValueLastMonth,
)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetRepeatRateLastMonth')
const mockUseGetRepeatRateLastMonth = assumeMock(useGetRepeatRateLastMonth)

jest.mock('pages/aiAgent/Onboarding/components/TopProductsCard/hooks')
const useTopProductsMock = assumeMock(useTopProducts)

jest.mock('pages/aiAgent/Onboarding/hooks/useTopLocations')
const mockUseTopLocations = assumeMock(useTopLocations)

const renderComponent = () => {
    return render(
        <Provider store={mockStore}>
            <QueryClientProvider client={appQueryClient}>
                <KnowledgePreview shopName="shop-name" />
            </QueryClientProvider>
        </Provider>,
    )
}

describe('KnowledgePreview', () => {
    jest.useFakeTimers()

    beforeAll(() => {
        mockUseGetKnowledgePreviewData.mockReturnValue({
            data: defaultPreviewData,
        })
        useTopProductsMock.mockReturnValue({
            isLoading: false,
            data: [],
        })
        mockUseGetAverageOrderValueLastMonth.mockReturnValue({
            isLoading: false,
            data: 950,
        })
        mockUseGetRepeatRateLastMonth.mockReturnValue({
            isLoading: false,
            data: 2,
        })
        mockUseTopLocations.mockReturnValue({
            data: [],
            isLoading: false,
        })
    })

    it('should render without crashing', () => {
        renderComponent()

        expect(screen.getAllByText('Average order per day').length).toBe(4)
        expect(screen.getAllByText('Top Locations').length).toBe(4)
        expect(screen.getAllByText('Top Products').length).toBe(4)
        expect(screen.getAllByText('Average order value').length).toBe(4)
        expect(screen.getAllByText('Average discount given').length).toBe(4)
        expect(screen.getAllByText('Repeat Rate').length).toBe(4)
    })

    it('should render skeleton when averageOrders is undefined', () => {
        mockUseGetKnowledgePreviewData.mockReturnValue({
            data: {
                ...defaultPreviewData,
                averageOrders: undefined as any,
            },
        })

        const { container } = renderComponent()

        expect(
            container.querySelector('.react-loading-skeleton'),
        ).toBeInTheDocument()
    })
})
