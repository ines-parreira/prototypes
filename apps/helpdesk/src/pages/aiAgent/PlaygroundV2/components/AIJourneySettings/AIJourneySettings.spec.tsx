import type { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { JourneyApiDTO } from '@gorgias/convert-client'
import { JourneyTypeEnum } from '@gorgias/convert-client'

import type { Product } from 'constants/integrations/types/shopify'
import { shopifyProductResult } from 'fixtures/shopify'

import {
    AI_JOURNEY_DEFAULT_STATE,
    useAIJourneyContext,
} from '../../contexts/AIJourneyContext'
import { useEvents } from '../../contexts/EventsContext'
import { PlaygroundEvent } from '../../types'
import { AIJourneySettings } from './AIJourneySettings'

jest.mock('../../contexts/AIJourneyContext', () => ({
    ...jest.requireActual('../../contexts/AIJourneyContext'),
    useAIJourneyContext: jest.fn(),
}))

jest.mock('../../contexts/EventsContext', () => ({
    ...jest.requireActual('../../contexts/EventsContext'),
    useEvents: jest.fn(),
}))

jest.mock('AIJourney/pages/Setup/fields/AudienceSelect/AudienceSelect', () => ({
    AudienceSelect: ({ label, value, onChange }: any) => (
        <div>
            <label>{label}</label>
            <select
                aria-label={label}
                value={value[0] || ''}
                onChange={(e) => onChange([e.target.value])}
            >
                <option value="">Select audience</option>
                <option value="audience-1">Audience 1</option>
            </select>
        </div>
    ),
}))

const mockUseAIJourneyContext = assumeMock(useAIJourneyContext)
const mockUseEvents = assumeMock(useEvents)

const mockProducts = shopifyProductResult().map(
    (product) => product.data,
) as Product[]

const mockFlows: JourneyApiDTO[] = [
    {
        id: 'flow-1',
        type: JourneyTypeEnum.CartAbandoned,
        account_id: 123,
        store_integration_id: 123,
        store_name: 'test-shop',
        store_type: 'shopify',
        state: 'active' as const,
        created_datetime: '2024-01-01T00:00:00Z',
    },
    {
        id: 'flow-2',
        type: JourneyTypeEnum.SessionAbandoned,
        account_id: 123,
        store_integration_id: 123,
        store_name: 'test-shop',
        store_type: 'shopify',
        state: 'active' as const,
        created_datetime: '2024-01-01T00:00:00Z',
    },
    {
        id: 'flow-3',
        type: JourneyTypeEnum.WinBack,
        account_id: 123,
        store_integration_id: 123,
        store_name: 'test-shop',
        store_type: 'shopify',
        state: 'active' as const,
        created_datetime: '2024-01-01T00:00:00Z',
    },
    {
        id: 'flow-4',
        type: JourneyTypeEnum.PostPurchase,
        account_id: 123,
        store_integration_id: 123,
        store_name: 'test-shop',
        store_type: 'shopify',
        state: 'active' as const,
        created_datetime: '2024-01-01T00:00:00Z',
    },
    {
        id: 'flow-5',
        type: JourneyTypeEnum.Welcome,
        account_id: 123,
        store_integration_id: 123,
        store_name: 'test-shop',
        store_type: 'shopify',
        state: 'active' as const,
        created_datetime: '2024-01-01T00:00:00Z',
    },
]

const mockCampaigns: JourneyApiDTO[] = [
    {
        id: 'campaign-1',
        type: JourneyTypeEnum.Campaign,
        account_id: 456,
        store_integration_id: 123,
        store_name: 'test-shop',
        store_type: 'shopify',
        state: 'active' as const,
        created_datetime: '2024-01-01T00:00:00Z',
        campaign: {
            title: 'campaign-1 name',
            state: 'draft',
        },
    },
    {
        id: 'campaign-2',
        type: JourneyTypeEnum.Campaign,
        account_id: 123,
        store_integration_id: 123,
        store_name: 'test-shop',
        store_type: 'shopify',
        state: 'active' as const,
        created_datetime: '2024-01-01T00:00:00Z',
        campaign: {
            title: 'campaign-2 name',
            state: 'active',
        },
    },
]

const renderComponent = (
    props?: Partial<ComponentProps<typeof AIJourneySettings>>,
) => {
    return render(<AIJourneySettings {...props} />)
}

const mockShopifyIntegration = {
    id: 123,
    name: 'test-shop',
} as any

const createMockAIJourneyContextValue = (
    overrides?: Partial<ReturnType<typeof useAIJourneyContext>>,
): ReturnType<typeof useAIJourneyContext> => ({
    shopifyIntegration: mockShopifyIntegration,
    shopName: 'test-shop',
    flows: mockFlows,
    campaigns: mockCampaigns,
    isLoadingJourneys: false,
    aiJourneySettings: AI_JOURNEY_DEFAULT_STATE,
    setAIJourneySettings: jest.fn(),
    resetAIJourneySettings: jest.fn(),
    saveAIJourneySettings: jest.fn(),
    isLoadingJourneyData: false,
    isSavingJourneyData: false,
    productList: mockProducts,
    isLoadingProducts: false,
    followUpMessagesSent: 0,
    setFollowUpMessagesSent: jest.fn(),
    currentJourney: undefined,
    journeyConfiguration: undefined,
    hasInvalidFields: false,
    ...overrides,
})

describe('AIJourneySettings', () => {
    let mockSetAIJourneySettings: jest.Mock
    let mockEmit: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()

        mockSetAIJourneySettings = jest.fn()
        mockEmit = jest.fn()

        mockUseEvents.mockReturnValue({
            emit: mockEmit,
            on: jest.fn(),
        })

        mockUseAIJourneyContext.mockReturnValue(
            createMockAIJourneyContextValue({
                setAIJourneySettings: mockSetAIJourneySettings,
            }),
        )
    })

    describe('Journey selection', () => {
        it('should render Campaign / Flow select field', () => {
            renderComponent()

            const selectField = screen.getByRole('textbox', {
                name: /campaign \/ flow/i,
            })
            expect(selectField).toBeInTheDocument()
        })

        it('should allow changing journey Id', async () => {
            renderComponent()

            const selectField = screen.getByRole('textbox', {
                name: /campaign \/ flow/i,
            })
            fireEvent.click(selectField)

            const sessionAbandonedOption = await screen.findByRole('option', {
                name: /campaign-1 name/i,
            })
            fireEvent.click(sessionAbandonedOption)

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    journeyId: 'campaign-1',
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

        it('should not auto-select product (handled by context)', async () => {
            renderComponent()

            expect(mockSetAIJourneySettings).not.toHaveBeenCalledWith({
                selectedProduct: expect.anything(),
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

            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    setAIJourneySettings: mockSetAIJourneySettings,
                    productList: mockProductsMultiple,
                }),
            )

            renderComponent()

            const selectField = screen.getByRole('textbox', {
                name: /product/i,
            })
            fireEvent.click(selectField)

            const anotherProductOption = await screen.findByRole('option', {
                name: /another product/i,
            })

            expect(anotherProductOption).toBeInTheDocument()
        })

        describe('Product image rendering', () => {
            it('should render product image when selectedProduct has an image', () => {
                const productWithImage = mockProducts[0]

                mockUseAIJourneyContext.mockReturnValue(
                    createMockAIJourneyContextValue({
                        aiJourneySettings: {
                            ...AI_JOURNEY_DEFAULT_STATE,
                            selectedProduct: productWithImage,
                        },
                    }),
                )

                renderComponent()

                const productImage = screen.getByAltText('selected product')
                expect(productImage).toBeInTheDocument()
                expect(productImage).toHaveAttribute(
                    'src',
                    productWithImage.image?.src,
                )
            })

            it('should render image element when selectedProduct is undefined', () => {
                mockUseAIJourneyContext.mockReturnValue(
                    createMockAIJourneyContextValue({
                        aiJourneySettings: {
                            ...AI_JOURNEY_DEFAULT_STATE,
                            selectedProduct: null,
                        },
                    }),
                )

                renderComponent()

                const productImage = screen.getByAltText('selected product')
                expect(productImage).toBeInTheDocument()
                expect(productImage).toHaveAttribute('src', '')
            })

            it('should render image element when selectedProduct.image is null', () => {
                const productWithoutImage: Product = {
                    ...mockProducts[0],
                    image: null as any,
                }

                mockUseAIJourneyContext.mockReturnValue(
                    createMockAIJourneyContextValue({
                        aiJourneySettings: {
                            ...AI_JOURNEY_DEFAULT_STATE,
                            selectedProduct: productWithoutImage,
                        },
                    }),
                )

                renderComponent()

                const productImage = screen.getByAltText('selected product')
                expect(productImage).toBeInTheDocument()
                expect(productImage).toHaveAttribute('src', '')
            })

            it('should render image element when selectedProduct.image.src is undefined', () => {
                const productWithImageNoSrc: Product = {
                    ...mockProducts[0],
                    image: {
                        id: 123,
                        alt: 'test',
                        variant_ids: [],
                    } as any,
                }

                mockUseAIJourneyContext.mockReturnValue(
                    createMockAIJourneyContextValue({
                        aiJourneySettings: {
                            ...AI_JOURNEY_DEFAULT_STATE,
                            selectedProduct: productWithImageNoSrc,
                        },
                    }),
                )

                renderComponent()

                const productImage = screen.getByAltText('selected product')
                expect(productImage).toBeInTheDocument()
                expect(productImage).toHaveAttribute('src', '')
            })
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
                name: /total number of messages to send/i,
            })
            expect(followUpSelect).toBeInTheDocument()
            expect(followUpSelect).toHaveValue('2')
        })

        it('should allow changing total follow-up messages', async () => {
            renderComponent()

            const selectField = screen.getByRole('textbox', {
                name: /total number of messages to send/i,
            })
            fireEvent.click(selectField)

            const option3 = await screen.findByRole('option', {
                name: '3',
            })
            fireEvent.click(option3)

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    totalFollowUp: 2,
                    discountCodeMessageIdx: 1,
                })
            })
        })

        it('should cap discount value at 100', async () => {
            renderComponent()

            const discountInput = screen.getByRole('textbox', {
                name: /discount code value/i,
            })

            fireEvent.change(discountInput, { target: { value: '150' } })

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    discountCodeValue: 100,
                })
            })
        })

        it('should adjust discountCodeMessageIdx when reducing totalFollowUp below current value', async () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    setAIJourneySettings: mockSetAIJourneySettings,
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                        totalFollowUp: 4,
                        discountCodeMessageIdx: 3,
                    },
                }),
            )

            const user = userEvent.setup()
            renderComponent()

            const selectField = screen.getByRole('textbox', {
                name: /total number of messages to send/i,
            })
            await act(async () => {
                await user.click(selectField)
            })

            const option2 = await screen.findByRole('option', {
                name: '2',
            })
            await act(async () => {
                await user.click(option2)
            })

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    totalFollowUp: 1,
                    discountCodeMessageIdx: 2,
                })
            })
        })

        it('should not adjust discountCodeMessageIdx when reducing totalFollowUp above current value', async () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    setAIJourneySettings: mockSetAIJourneySettings,
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                        totalFollowUp: 4,
                        discountCodeMessageIdx: 1,
                    },
                }),
            )

            const user = userEvent.setup()
            renderComponent()

            const selectField = screen.getByRole('textbox', {
                name: /total number of messages to send/i,
            })
            await act(async () => {
                await user.click(selectField)
            })

            const option3 = await screen.findByRole('option', {
                name: '3',
            })
            await act(async () => {
                await user.click(option3)
            })

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    totalFollowUp: 2,
                    discountCodeMessageIdx: 1,
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

        it('should display value casted to string when discountCodeValue is valid', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                        discountCodeValue: 10,
                    },
                }),
            )

            renderComponent()

            const discountInput = screen.getByRole('textbox', {
                name: /discount code value/i,
            })
            expect(discountInput).toHaveValue('10')
        })

        it('should display "0" when discountCodeValue is undefined', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                        discountCodeValue: undefined,
                    },
                }),
            )

            renderComponent()

            const discountInput = screen.getByRole('textbox', {
                name: /discount code value/i,
            })
            expect(discountInput).toHaveValue('0')
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
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    productList: [],
                    isLoadingProducts: true,
                }),
            )

            renderComponent()

            expect(screen.getByText('Message settings')).toBeInTheDocument()
        })

        it('should handle empty product list', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    productList: [],
                }),
            )

            renderComponent()

            expect(screen.getByText('Message settings')).toBeInTheDocument()
        })
    })

    describe('Journey loading states', () => {
        it('should display loading spinner while journeys are loading', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    flows: [],
                    isLoadingJourneys: true,
                    productList: [],
                }),
            )

            renderComponent()

            expect(screen.getByRole('status')).toBeInTheDocument()
            expect(
                screen.queryByText('Campaign / Flow'),
            ).not.toBeInTheDocument()
        })
    })

    describe('No journeys configured', () => {
        it('should display banner when no journeys are available', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    flows: [],
                    campaigns: [],
                    productList: [],
                }),
            )

            renderComponent()

            expect(
                screen.getByText('No journeys configured.'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /You need to configure at least one flow or campaign/i,
                ),
            ).toBeInTheDocument()
        })

        it('should display link to configure journeys', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    flows: [],
                    campaigns: [],
                    productList: [],
                }),
            )

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

        it('should not display form fields when no journeys nor campaigns are available', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    flows: [],
                    campaigns: [],
                    productList: [],
                }),
            )

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

    describe('Audience selection', () => {
        beforeEach(() => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: mockCampaigns[0],
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    setAIJourneySettings: mockSetAIJourneySettings,
                }),
            )
        })

        it('should render audience to include field', () => {
            renderComponent()

            expect(
                screen.getByLabelText('Audience to include'),
            ).toBeInTheDocument()
        })

        it('should render audience to exclude field', () => {
            renderComponent()

            expect(
                screen.getByLabelText('Audience to exclude'),
            ).toBeInTheDocument()
        })

        it('should allow selecting audience to include', async () => {
            const user = userEvent.setup()
            renderComponent()

            const includeSelect = screen.getByLabelText('Audience to include')
            await act(async () => {
                await user.selectOptions(includeSelect, 'audience-1')
            })
            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    includedAudienceListIds: ['audience-1'],
                })
            })
        })

        it('should allow selecting audience to exclude', async () => {
            const user = userEvent.setup()
            renderComponent()

            const excludeSelect = screen.getByLabelText('Audience to exclude')
            await act(async () => {
                await user.selectOptions(excludeSelect, 'audience-1')
            })

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    excludedAudienceListIds: ['audience-1'],
                })
            })
        })

        it('should display selected included audience', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: mockCampaigns[0],
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                        includedAudienceListIds: ['audience-1'],
                    },
                    setAIJourneySettings: mockSetAIJourneySettings,
                }),
            )

            renderComponent()

            const includeSelect = screen.getByLabelText('Audience to include')
            expect(includeSelect).toHaveValue('audience-1')
        })

        it('should display selected excluded audience', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: mockCampaigns[0],
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                        excludedAudienceListIds: ['audience-1'],
                    },
                    setAIJourneySettings: mockSetAIJourneySettings,
                }),
            )

            renderComponent()

            const excludeSelect = screen.getByLabelText('Audience to exclude')
            expect(excludeSelect).toHaveValue('audience-1')
        })
    })

    describe('Fields rendering', () => {
        it('should show flows fields', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: mockFlows[0],
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                }),
            )

            renderComponent()

            expect(screen.queryByText('Product')).toBeInTheDocument()
            expect(
                screen.queryByText('Total number of messages to send'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Include discount code'),
            ).toBeInTheDocument()
            expect(screen.getByText('Discount code value')).toBeInTheDocument()
            expect(
                screen.queryByText('Include product image in first message'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(
                    'In which message should the discount code be sent',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Audience to include'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Audience to exclude'),
            ).not.toBeInTheDocument()
        })

        it('should show campaigns fields', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: mockCampaigns[0],
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                }),
            )

            renderComponent()

            expect(screen.queryByText('Product')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Total number of messages to send'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Include discount code'),
            ).toBeInTheDocument()
            expect(screen.getByText('Discount code value')).toBeInTheDocument()
            expect(
                screen.queryByText('Include product image in first message'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(
                    'In which message should the discount code be sent',
                ),
            ).not.toBeInTheDocument()
            expect(screen.getByText('Audience to include')).toBeInTheDocument()
            expect(screen.getByText('Audience to exclude')).toBeInTheDocument()
        })

        describe('Win-back flow', () => {
            it('should render inactive days and cooldown fields', () => {
                mockUseAIJourneyContext.mockReturnValue(
                    createMockAIJourneyContextValue({
                        currentJourney: mockFlows[2], // winback flow
                        flows: mockFlows,
                        campaigns: mockCampaigns,
                    }),
                )

                renderComponent()

                expect(screen.queryByText('Product')).toBeInTheDocument()
                expect(
                    screen.queryByText('Total number of messages to send'),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText('Include discount code'),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Discount code value'),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText(
                        'Include product image in first message',
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText(
                        'In which message should the discount code be sent',
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.queryByText('Audience to include'),
                ).not.toBeInTheDocument()
                expect(
                    screen.queryByText('Audience to exclude'),
                ).not.toBeInTheDocument()
                expect(screen.queryByText('Inactive days')).toBeInTheDocument()
                expect(
                    screen.queryByText('Cooldown period'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('Post purchase flow', () => {
        it('should render trigger event and wait time fields', () => {
            const postPurchaseFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.PostPurchase,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: postPurchaseFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                }),
            )

            renderComponent()

            expect(screen.queryByText('Product')).toBeInTheDocument()
            expect(
                screen.queryByText('Total number of messages to send'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Include discount code'),
            ).toBeInTheDocument()
            expect(screen.getByText('Discount code value')).toBeInTheDocument()
            expect(
                screen.queryByText('Include product image in first message'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(
                    'In which message should the discount code be sent',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Audience to include'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Audience to exclude'),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Trigger event')).toBeInTheDocument()
            expect(
                screen.queryByText('Wait time after trigger (in minutes)'),
            ).toBeInTheDocument()
        })

        it('should allow changing wait time after trigger', async () => {
            const postPurchaseFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.PostPurchase,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: postPurchaseFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    setAIJourneySettings: mockSetAIJourneySettings,
                }),
            )

            const user = userEvent.setup()
            renderComponent()

            const waitTimeInput = screen.getByRole('textbox', {
                name: /wait time after trigger \(in minutes\)/i,
            })

            await act(async () => {
                await user.clear(waitTimeInput)
                await user.type(waitTimeInput, '60')
                await user.tab()
            })

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    postPurchaseWaitInMinutes: 60,
                })
            })
        })

        it('should display empty wait time when value is undefined', () => {
            const postPurchaseFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.PostPurchase,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: postPurchaseFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                        postPurchaseWaitInMinutes: undefined,
                    },
                }),
            )

            renderComponent()

            const waitTimeInput = screen.getByRole('textbox', {
                name: /wait time after trigger \(in minutes\)/i,
            })
            expect(waitTimeInput).toHaveValue('')
        })

        it('should display error when wait time exceeds maximum', () => {
            const MAX_WAIT_TIME = 10080
            const postPurchaseFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.PostPurchase,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: postPurchaseFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                        postPurchaseWaitInMinutes: 15000,
                    },
                }),
            )

            renderComponent()

            expect(
                screen.getByText(
                    `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`,
                ),
            ).toBeInTheDocument()
        })

        it('should allow changing target order status', async () => {
            const postPurchaseFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.PostPurchase,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: postPurchaseFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    setAIJourneySettings: mockSetAIJourneySettings,
                }),
            )

            renderComponent()

            const triggerEventField = screen.getByRole('textbox', {
                name: /trigger event/i,
            })
            fireEvent.click(triggerEventField)

            const orderFulfilledOption = await screen.findByRole('option', {
                name: /order fulfilled/i,
            })
            fireEvent.click(orderFulfilledOption)

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    targetOrderStatus: 'order_fulfilled',
                })
            })
        })
    })

    describe('Welcome flow', () => {
        it('should render trigger event and wait time fields', () => {
            const welcomeFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.Welcome,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: welcomeFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                }),
            )

            renderComponent()

            expect(screen.queryByText('Product')).toBeInTheDocument()
            expect(
                screen.queryByText('Total number of messages to send'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Include discount code'),
            ).toBeInTheDocument()
            expect(screen.getByText('Discount code value')).toBeInTheDocument()
            expect(
                screen.queryByText('Include product image in first message'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText(
                    'In which message should the discount code be sent',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Audience to include'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Audience to exclude'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Wait time before trigger (in minutes)'),
            ).toBeInTheDocument()
        })

        it('should allow changing wait time after trigger', async () => {
            const welcomeFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.Welcome,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: welcomeFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    setAIJourneySettings: mockSetAIJourneySettings,
                }),
            )

            const user = userEvent.setup()
            renderComponent()

            const waitTimeInput = screen.getByRole('textbox', {
                name: /wait time before trigger \(in minutes\)/i,
            })

            await act(async () => {
                await user.clear(waitTimeInput)
                await user.type(waitTimeInput, '60')
                await user.tab()
            })

            await waitFor(() => {
                expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                    waitTimeMinutes: 60,
                })
            })
        })

        it('should display default wait time value of 1', () => {
            const welcomeFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.Welcome,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: welcomeFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                    },
                }),
            )

            renderComponent()

            const waitTimeInput = screen.getByRole('textbox', {
                name: /wait time before trigger \(in minutes\)/i,
            })
            expect(waitTimeInput).toHaveValue('1')
        })

        it('should display error when wait time exceeds maximum', () => {
            const MAX_WAIT_TIME = 10080
            const welcomeFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.Welcome,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: welcomeFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                        waitTimeMinutes: 15000,
                    },
                }),
            )

            renderComponent()

            expect(
                screen.getByText(
                    `Please enter wait time between 0 and ${MAX_WAIT_TIME} minutes (7 days)`,
                ),
            ).toBeInTheDocument()
        })

        it('should render the returning customer toggle', () => {
            const welcomeFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.Welcome,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: welcomeFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                }),
            )

            renderComponent()

            expect(
                screen.getByRole('switch', { name: /returning customer/i }),
            ).toBeInTheDocument()
        })

        it('should not render the returning customer toggle for non-welcome journeys', () => {
            const cartAbandonedFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.CartAbandoned,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: cartAbandonedFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                }),
            )

            renderComponent()

            expect(
                screen.queryByRole('switch', { name: /returning customer/i }),
            ).not.toBeInTheDocument()
        })

        it('should toggle the returning customer setting', async () => {
            const welcomeFlow = mockFlows.find(
                (f) => f.type === JourneyTypeEnum.Welcome,
            )
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: welcomeFlow,
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                    setAIJourneySettings: mockSetAIJourneySettings,
                    aiJourneySettings: {
                        ...AI_JOURNEY_DEFAULT_STATE,
                        returningCustomer: false,
                    },
                }),
            )

            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('switch', { name: /returning customer/i }),
            )

            expect(mockSetAIJourneySettings).toHaveBeenCalledWith({
                returningCustomer: true,
            })
        })
    })

    describe('RESET_CONVERSATION event', () => {
        it('should emit RESET_CONVERSATION on mount when a journey is selected', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: mockFlows[0],
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                }),
            )

            renderComponent()

            expect(mockEmit).toHaveBeenCalledWith(
                PlaygroundEvent.RESET_CONVERSATION,
            )
        })

        it('should emit RESET_CONVERSATION when the selected journey changes', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: mockFlows[0],
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                }),
            )

            const { rerender } = renderComponent()
            mockEmit.mockClear()

            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: mockFlows[1],
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                }),
            )
            rerender(<AIJourneySettings />)

            expect(mockEmit).toHaveBeenCalledWith(
                PlaygroundEvent.RESET_CONVERSATION,
            )
        })

        it('should not emit RESET_CONVERSATION again when the journey id does not change', () => {
            mockUseAIJourneyContext.mockReturnValue(
                createMockAIJourneyContextValue({
                    currentJourney: mockFlows[0],
                    flows: mockFlows,
                    campaigns: mockCampaigns,
                }),
            )

            const { rerender } = renderComponent()
            mockEmit.mockClear()

            rerender(<AIJourneySettings />)

            expect(mockEmit).not.toHaveBeenCalled()
        })
    })
})
