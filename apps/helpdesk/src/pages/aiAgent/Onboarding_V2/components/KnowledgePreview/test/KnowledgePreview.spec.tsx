import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import {
    mockedAverageOrders,
    mockedCategories,
    mockedProducts,
} from 'pages/aiAgent/Onboarding_V2/components/KnowledgePreview/constants'
import { KnowledgePreview } from 'pages/aiAgent/Onboarding_V2/components/KnowledgePreview/KnowledgePreview'
import useTopProducts from 'pages/aiAgent/Onboarding_V2/components/TopProductsCard/hooks'
import { useGetAverageOrderValue } from 'pages/aiAgent/Onboarding_V2/hooks/useGetAverageOrderValue'
import { useGetKnowledgePreviewData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetKnowledgePreviewData'
import { useGetRepeatRate } from 'pages/aiAgent/Onboarding_V2/hooks/useGetRepeatRate'
import { useTopLocations } from 'pages/aiAgent/Onboarding_V2/hooks/useTopLocations'

const defaultPreviewData = {
    topProducts: mockedProducts,
    isTopProductsLoading: false,
    experienceScore: 50,
    categories: mockedCategories,
    averageDiscount: 10,
    averageOrders: mockedAverageOrders,
    repeatRate: 2,
    averageOrderValue: 950,
    isAverageOrderValueLoading: false,
    isRepeatRateLoading: false,
}
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetKnowledgePreviewData')
const mockUseGetKnowledgePreviewData = assumeMock(useGetKnowledgePreviewData)
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetAverageOrderValue')
const mockUseGetAverageOrderValue = assumeMock(useGetAverageOrderValue)
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useGetRepeatRate')
const mockUseGetRepeatRate = assumeMock(useGetRepeatRate)
jest.mock('pages/aiAgent/Onboarding_V2/components/TopProductsCard/hooks')
const useTopProductsMock = assumeMock(useTopProducts)
jest.mock('pages/aiAgent/Onboarding_V2/hooks/useTopLocations')
const mockUseTopLocations = assumeMock(useTopLocations)
jest.mock('pages/aiAgent/Onboarding_V2/components/TopProductsCard/hooks')
const mockUseTopProducts = assumeMock(useTopProducts)
const renderComponent = () => {
    return render(<KnowledgePreview shopName="shop-name" />, {})
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
        mockUseGetAverageOrderValue.mockReturnValue({
            isLoading: false,
            data: 950,
        })
        mockUseGetRepeatRate.mockReturnValue({
            isLoading: false,
            data: 2,
        })
        mockUseTopLocations.mockReturnValue({
            data: [],
            isLoading: false,
        })
        mockUseTopProducts.mockReturnValue({
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
