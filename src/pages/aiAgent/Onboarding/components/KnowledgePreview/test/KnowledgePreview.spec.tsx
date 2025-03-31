import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { appQueryClient } from 'api/queryClient'
import useTopProducts from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { useGetKnowledgePreviewData } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgePreviewData'
import { assumeMock } from 'utils/testing'

import {
    mockedAverageOrders,
    mockedCategories,
    mockedLocations,
    mockedProducts,
} from '../constants'
import KnowledgePreview from '../KnowledgePreview'

jest.mock('pages/aiAgent/Onboarding/components/TopProductsCard/hooks')
const useTopProductsMock = assumeMock(useTopProducts)

const mockStore = configureMockStore([thunk])()

const defaultPreviewData = {
    locations: mockedLocations,
    products: mockedProducts,
    experienceScore: 50,
    categories: mockedCategories,
    averageDiscount: 10,
    averageOrders: mockedAverageOrders,
    repeatRate: 2,
}

jest.mock('pages/aiAgent/Onboarding/hooks/useGetKnowledgePreviewData')
const mockUseGetKnowledgePreviewData = assumeMock(useGetKnowledgePreviewData)

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
