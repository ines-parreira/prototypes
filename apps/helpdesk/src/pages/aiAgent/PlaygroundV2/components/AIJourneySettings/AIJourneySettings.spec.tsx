import { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { JourneyApiDTO, JourneyTypeEnum } from '@gorgias/convert-client'

import { useAIJourneyProductList } from 'AIJourney/hooks'
import { Product } from 'constants/integrations/types/shopify'
import { shopifyProductResult } from 'fixtures/shopify'

import {
    AI_JOURNEY_DEFAULT_STATE,
    useAIJourneyContext,
} from '../../contexts/AIJourneyContext'
import { AIJourneySettings } from './AIJourneySettings'

jest.mock('AIJourney/hooks', () => ({
    useAIJourneyProductList: jest.fn(),
}))

jest.mock('../../contexts/AIJourneyContext', () => ({
    ...jest.requireActual('../../contexts/AIJourneyContext'),
    useAIJourneyContext: jest.fn(),
}))

const mockUseAIJourneyProductList = assumeMock(useAIJourneyProductList)
const mockUseAIJourneyContext = assumeMock(useAIJourneyContext)

const mockProducts = shopifyProductResult().map(
    (product) => product.data,
) as Product[]

const mockJourneys: JourneyApiDTO[] = [
    {
        id: 'journey-1',
        type: JourneyTypeEnum.CartAbandoned,
        account_id: 123,
        store_integration_id: 123,
        store_name: 'test-shop',
        store_type: 'shopify',
        state: 'active' as const,
        created_datetime: '2024-01-01T00:00:00Z',
    },
    {
        id: 'journey-2',
        type: JourneyTypeEnum.SessionAbandoned,
        account_id: 123,
        store_integration_id: 123,
        store_name: 'test-shop',
        store_type: 'shopify',
        state: 'active' as const,
        created_datetime: '2024-01-01T00:00:00Z',
    },
]

const renderComponent = (
    props?: Partial<ComponentProps<typeof AIJourneySettings>>,
) => {
    return render(<AIJourneySettings {...props} />)
}

describe('AIJourneySettings', () => {
    let mockSetAIJourneySettings: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()

        mockSetAIJourneySettings = jest.fn()

        mockUseAIJourneyContext.mockReturnValue({
            shopifyIntegration: 123,
            shopName: 'test-shop',
            journeys: mockJourneys,
            isLoadingJourneys: false,
            aiJourneySettings: AI_JOURNEY_DEFAULT_STATE,
            setAIJourneySettings: mockSetAIJourneySettings,
            resetAIJourneySettings: jest.fn(),
            saveAIJourneySettings: jest.fn(),
            isLoadingJourneyData: false,
            isSavingJourneyData: false,
        })

        mockUseAIJourneyProductList.mockReturnValue({
            productList: mockProducts,
            isLoading: false,
        })
    })

    describe('Journey selection', () => {
        it('should render Campaign / Flow select field', () => {
            renderComponent()

            const selectField = screen.getByRole('textbox', {
                name: /campaign \/ flow/i,
            })
            expect(selectField).toBeInTheDocument()
        })

        it('should allow changing journey type', async () => {
            renderComponent()

            const selectButton = screen.getByRole('button', {
                name: /campaign \/ flow/i,
            })
            fireEvent.click(selectButton)

            const sessionAbandonedOption = await screen.findByRole('option', {
                name: /session abandoned/i,
            })
            fireEvent.click(sessionAbandonedOption)

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    journeyType: JourneyTypeEnum.SessionAbandoned,
                })
            })
        })
    })

    describe('Product selection', () => {
        it('should render product select field', () => {
            renderComponent()

            expect(
                screen.getByRole('textbox', { name: /product/i }),
            ).toBeInTheDocument()
        })

        it('should auto-select first product when available', async () => {
            renderComponent()

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    selectedProduct: mockProducts[0],
                })
            })
        })

        it('should allow changing selected product', async () => {
            const mockProductsMultiple: Product[] = [
                ...mockProducts,
                {
                    ...mockProducts[0],
                    id: 999,
                    title: 'Another Product',
                    image: {
                        ...mockProducts[0].image,
                        id: 123,
                        src: 'https://example.com/product.jpg',
                        alt: 'Product image',
                        variant_ids: [],
                    },
                },
            ]

            mockUseAIJourneyProductList.mockReturnValue({
                productList: mockProductsMultiple,
                isLoading: false,
            })

            renderComponent()

            const selectButton = screen.getByRole('button', {
                name: /product/i,
            })
            fireEvent.click(selectButton)

            const anotherProductOption = await screen.findByRole('option', {
                name: /another product/i,
            })

            expect(anotherProductOption).toBeInTheDocument()
        })
    })

    describe('Message settings', () => {
        it('should render message settings section', () => {
            renderComponent()

            expect(screen.getByText('Message settings')).toBeInTheDocument()
        })

        it('should render follow-up messages select with default value', () => {
            renderComponent()

            const followUpSelect = screen.getByRole('textbox', {
                name: /total follow-up messages/i,
            })
            expect(followUpSelect).toBeInTheDocument()
            expect(followUpSelect).toHaveValue('1')
        })

        it('should allow changing total follow-up messages', async () => {
            renderComponent()

            const selectButton = screen.getByRole('button', {
                name: /total follow-up messages/i,
            })
            fireEvent.click(selectButton)

            const option3 = await screen.findByRole('option', {
                name: '3',
            })
            fireEvent.click(option3)

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    totalFollowUp: 3,
                })
            })
        })
    })

    describe('Toggle fields', () => {
        it('should render product image toggle', () => {
            renderComponent()

            expect(
                screen.getByText('Include product image in first message'),
            ).toBeInTheDocument()
        })

        it('should render discount code toggle', () => {
            renderComponent()

            expect(
                screen.getByText('Include discount code'),
            ).toBeInTheDocument()
        })

        it('should toggle product image setting', async () => {
            renderComponent()

            const toggles = screen.getAllByRole('switch')
            const productImageToggle = toggles[0]

            expect(productImageToggle).toBeChecked()

            fireEvent.click(productImageToggle)

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    includeProductImage: false,
                })
            })
        })

        it('should toggle discount code setting', async () => {
            renderComponent()

            const toggles = screen.getAllByRole('switch')
            const discountCodeToggle = toggles[1]

            expect(discountCodeToggle).toBeChecked()

            fireEvent.click(discountCodeToggle)

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    includeDiscountCode: false,
                })
            })
        })
    })

    describe('Discount code settings', () => {
        it('should render discount code value field', () => {
            renderComponent()

            expect(
                screen.getByRole('textbox', { name: /discount code value/i }),
            ).toBeInTheDocument()
        })

        it('should render discount code message index field', () => {
            renderComponent()

            expect(
                screen.getByText(
                    'In which message should the discount code be sent',
                ),
            ).toBeInTheDocument()
        })

        it('should allow changing discount code value', async () => {
            renderComponent()

            const discountInput = screen.getByRole('textbox', {
                name: /discount code value/i,
            })

            fireEvent.change(discountInput, { target: { value: '15' } })

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    discountCodeValue: 15,
                })
            })
        })

        it('should handle empty discount code value', async () => {
            renderComponent()

            const discountInput = screen.getByRole('textbox', {
                name: /discount code value/i,
            })

            fireEvent.change(discountInput, { target: { value: '' } })

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    discountCodeValue: 0,
                })
            })
        })

        it('should reject non-numeric discount code values', async () => {
            renderComponent()

            const discountInput = screen.getByRole('textbox', {
                name: /discount code value/i,
            })

            const initialValue = discountInput.getAttribute('value')

            fireEvent.change(discountInput, { target: { value: 'abc' } })

            await waitFor(() => {
                expect(discountInput).toHaveValue(initialValue)
            })
        })
    })

    describe('Message instructions', () => {
        it('should render message instructions textarea', () => {
            renderComponent()

            expect(
                screen.getByRole('textbox', { name: /message instructions/i }),
            ).toBeInTheDocument()
        })

        it('should allow entering message instructions', async () => {
            renderComponent()

            const textarea = screen.getByRole('textbox', {
                name: /message instructions/i,
            })

            fireEvent.change(textarea, {
                target: { value: 'Custom message instructions' },
            })

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    outboundMessageInstructions: 'Custom message instructions',
                })
            })
        })
    })

    describe('Product loading states', () => {
        it('should handle loading products', () => {
            mockUseAIJourneyProductList.mockReturnValue({
                productList: [],
                isLoading: true,
            })

            renderComponent()

            expect(screen.getByText('Message settings')).toBeInTheDocument()
        })

        it('should handle empty product list', () => {
            mockUseAIJourneyProductList.mockReturnValue({
                productList: [],
                isLoading: false,
            })

            renderComponent()

            expect(screen.getByText('Message settings')).toBeInTheDocument()
        })
    })

    describe('Journey loading states', () => {
        it('should display loading spinner while journeys are loading', () => {
            mockUseAIJourneyContext.mockReturnValue({
                shopifyIntegration: 123,
                shopName: 'test-shop',
                journeys: [],
                isLoadingJourneys: true,
                aiJourneySettings: AI_JOURNEY_DEFAULT_STATE,
                setAIJourneySettings: jest.fn(),
                resetAIJourneySettings: jest.fn(),
                saveAIJourneySettings: jest.fn(),
                isLoadingJourneyData: false,
                isSavingJourneyData: false,
            })

            renderComponent()

            expect(screen.getByRole('status')).toBeInTheDocument()
            expect(
                screen.queryByText('Campaign / Flow'),
            ).not.toBeInTheDocument()
        })
    })

    describe('No journeys configured', () => {
        it('should display banner when no journeys are available', () => {
            mockUseAIJourneyContext.mockReturnValue({
                shopifyIntegration: 123,
                shopName: 'test-shop',
                journeys: [],
                isLoadingJourneys: false,
                aiJourneySettings: AI_JOURNEY_DEFAULT_STATE,
                setAIJourneySettings: jest.fn(),
                resetAIJourneySettings: jest.fn(),
                saveAIJourneySettings: jest.fn(),
                isLoadingJourneyData: false,
                isSavingJourneyData: false,
            })

            renderComponent()

            expect(
                screen.getByText('No journeys configured.'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/You need to configure at least one journey/i),
            ).toBeInTheDocument()
        })

        it('should display link to configure journeys', () => {
            mockUseAIJourneyContext.mockReturnValue({
                shopifyIntegration: 123,
                shopName: 'test-shop',
                journeys: [],
                isLoadingJourneys: false,
                aiJourneySettings: AI_JOURNEY_DEFAULT_STATE,
                setAIJourneySettings: jest.fn(),
                resetAIJourneySettings: jest.fn(),
                saveAIJourneySettings: jest.fn(),
                isLoadingJourneyData: false,
                isSavingJourneyData: false,
            })

            renderComponent()

            const configureLink = screen.getByRole('link', {
                name: /configure journeys/i,
            })
            expect(configureLink).toBeInTheDocument()
            expect(configureLink).toHaveAttribute(
                'href',
                '/app/ai-journey/test-shop',
            )
        })

        it('should not display form fields when no journeys are available', () => {
            mockUseAIJourneyContext.mockReturnValue({
                shopifyIntegration: 123,
                shopName: 'test-shop',
                journeys: [],
                isLoadingJourneys: false,
                aiJourneySettings: AI_JOURNEY_DEFAULT_STATE,
                setAIJourneySettings: jest.fn(),
                resetAIJourneySettings: jest.fn(),
                saveAIJourneySettings: jest.fn(),
                isLoadingJourneyData: false,
                isSavingJourneyData: false,
            })

            renderComponent()

            expect(
                screen.queryByRole('textbox', { name: /campaign \/ flow/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('textbox', { name: /product/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Message settings'),
            ).not.toBeInTheDocument()
        })
    })
})
