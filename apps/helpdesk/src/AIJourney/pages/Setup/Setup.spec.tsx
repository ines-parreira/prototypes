import { render, waitFor } from '@testing-library/react'

import { OrderStatusEnum } from '@gorgias/convert-client'

import { JOURNEY_TYPES } from 'AIJourney/constants'

import { Setup } from './Setup'

const mockReset = jest.fn()

jest.mock('react-hook-form', () => ({
    ...jest.requireActual('react-hook-form'),
    useFormContext: jest.fn(() => ({
        reset: mockReset,
    })),
}))

jest.mock('AIJourney/providers/JourneyProvider/JourneyProvider', () => ({
    ...jest.requireActual(
        'AIJourney/providers/JourneyProvider/JourneyProvider',
    ),
    useJourneyContext: jest.fn(),
}))

jest.mock('AIJourney/components', () => ({
    AudienceCard: jest.fn(() => <div>AudienceCard</div>),
    GeneralCard: jest.fn(() => <div>GeneralCard</div>),
    DiscountCodeCard: jest.fn(() => <div>DiscountCodeCard</div>),
    TimingCard: jest.fn(() => <div>TimingCard</div>),
}))

const mockUseJourneyContext =
    require('AIJourney/providers/JourneyProvider/JourneyProvider')
        .useJourneyContext as jest.Mock

const mockGeneralCard = require('AIJourney/components').GeneralCard as jest.Mock
const mockDiscountCodeCard = require('AIJourney/components')
    .DiscountCodeCard as jest.Mock
const mockTimingCard = require('AIJourney/components').TimingCard as jest.Mock
const mockAudienceCard = require('AIJourney/components')
    .AudienceCard as jest.Mock

describe('<Setup />', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseJourneyContext.mockReturnValue({
            isLoading: false,
            journeyData: undefined,
            journeyType: undefined,
        })
    })

    describe('form reset', () => {
        it('should reset form with journey configuration values when loaded', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        include_image: true,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sms_sender_integration_id: {
                            id: 1,
                            label: '+1 555-123-4567',
                        },
                        max_follow_up_messages: 3,
                        include_image: true,
                    }),
                )
            })
        })

        it('should set max_follow_up_messages to 1 when configuration value is null', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 2,
                        sms_sender_number: '+1 777-888-9999',
                        max_follow_up_messages: null,
                        include_image: false,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sms_sender_integration_id: {
                            id: 2,
                            label: '+1 777-888-9999',
                        },
                        max_follow_up_messages: 1,
                        include_image: false,
                    }),
                )
            })
        })

        it('should default include_image to false when it is undefined in configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sms_sender_integration_id: {
                            id: 1,
                            label: '+1 555-123-4567',
                        },
                        max_follow_up_messages: 3,
                        include_image: false,
                    }),
                )
            })
        })

        it('should default include_image to false when it is null in configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        include_image: null,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        sms_sender_integration_id: {
                            id: 1,
                            label: '+1 555-123-4567',
                        },
                        max_follow_up_messages: 3,
                        include_image: false,
                    }),
                )
            })
        })

        it('should not reset form when still loading', () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: true,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        include_image: false,
                    },
                },
            })

            render(<Setup />)

            expect(mockReset).not.toHaveBeenCalled()
        })

        it('should not reset form when there is no journey data', () => {
            render(<Setup />)

            expect(mockReset).not.toHaveBeenCalled()
        })

        it('should not reset form when journey data has no configuration', () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: { id: 'journey-123' },
            })

            render(<Setup />)

            expect(mockReset).not.toHaveBeenCalled()
        })
    })

    describe('Discount field', () => {
        it('should set discount_code_message_threshold from configuration when present', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        discount_code_message_threshold: 3,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        discount_code_message_threshold: 3,
                    }),
                )
            })
        })

        it('should set discount_code_message_threshold to undefined when not present in configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        discount_code_message_threshold: undefined,
                    }),
                )
            })
        })
    })

    describe('PostPurchase flow fields', () => {
        it('should set target_order_status from PostPurchase configuration when present', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        target_order_status: OrderStatusEnum.OrderPlaced,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        target_order_status: OrderStatusEnum.OrderPlaced,
                    }),
                )
            })
        })

        it('should default target_order_status to OrderFulfilled when not in PostPurchase configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        target_order_status: OrderStatusEnum.OrderFulfilled,
                    }),
                )
            })
        })

        it('should set post_purchase_wait_minutes from PostPurchase configuration when present', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        post_purchase_wait_minutes: 60,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        post_purchase_wait_minutes: 60,
                    }),
                )
            })
        })

        it('should set post_purchase_wait_minutes to undefined when not in PostPurchase configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        post_purchase_wait_minutes: undefined,
                    }),
                )
            })
        })
    })

    describe('Welcome flow fields', () => {
        it('should map wait_time_minutes from wait_time_minutes in Welcome configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.WELCOME,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        wait_time_minutes: 120,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        wait_time_minutes: 120,
                    }),
                )
            })
        })

        it('should set wait_time_minutes to undefined when wait_time_minutes is not in Welcome configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.WELCOME,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        wait_time_minutes: undefined,
                    }),
                )
            })
        })
    })

    describe('Winback flow fields', () => {
        it('should set cooldown_days from Winback configuration when present', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.WIN_BACK,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        cooldown_days: 30,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        cooldown_days: 30,
                    }),
                )
            })
        })

        it('should set cooldown_days to undefined when not in Winback configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.WIN_BACK,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        cooldown_days: undefined,
                    }),
                )
            })
        })

        it('should map inactive_days from inactive_days in Winback configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.WIN_BACK,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        inactive_days: 90,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        inactive_days: 90,
                    }),
                )
            })
        })

        it('should set inactive_days to undefined when inactive_days is not in Winback configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.WIN_BACK,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        inactive_days: undefined,
                    }),
                )
            })
        })
    })

    describe('Cart Abandon flow fields', () => {
        it('should set offer_discount from Cart Abandon configuration when present', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        offer_discount: true,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        offer_discount: true,
                    }),
                )
            })
        })

        it('should default offer_discount to false when not in Cart Abandon configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        offer_discount: false,
                    }),
                )
            })
        })

        it('should set max_discount_percent from Cart Abandon configuration when present', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                        max_discount_percent: 20,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        max_discount_percent: 20,
                    }),
                )
            })
        })

        it('should set max_discount_percent to undefined when not in Cart Abandon configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        max_discount_percent: undefined,
                    }),
                )
            })
        })
    })

    describe('Campaign fields', () => {
        it('should set included_audience_list_ids and excluded_audience_list_ids from Campaign configuration when present', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                journeyData: {
                    included_audience_list_ids: ['list-1', 'list-2'],
                    excluded_audience_list_ids: ['list-3'],
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        included_audience_list_ids: ['list-1', 'list-2'],
                        excluded_audience_list_ids: ['list-3'],
                    }),
                )
            })
        })

        it('should default included_audience_list_ids and excluded_audience_list_ids to undefined when not in Campaign configuration', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        included_audience_list_ids: undefined,
                        excluded_audience_list_ids: undefined,
                    }),
                )
            })
        })

        it('should set campaignTitle from journeyData.campaign.title when present', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                journeyData: {
                    campaign: { title: 'Black Friday Sale' },
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        campaignTitle: 'Black Friday Sale',
                    }),
                )
            })
        })

        it('should set campaignTitle to undefined when journeyData has no campaign title', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockReset).toHaveBeenCalledWith(
                    expect.objectContaining({
                        campaignTitle: undefined,
                    }),
                )
            })
        })
    })

    describe('isFormReady prop passing', () => {
        it('should pass isFormReady=false to all cards while data is loading', () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: true,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            expect(mockGeneralCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ isFormReady: false }),
                expect.anything(),
            )
            expect(mockDiscountCodeCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ isFormReady: false }),
                expect.anything(),
            )
            expect(mockTimingCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ isFormReady: false }),
                expect.anything(),
            )
        })

        it('should pass isFormReady=true to all cards after data has loaded', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.POST_PURCHASE,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockGeneralCard).toHaveBeenLastCalledWith(
                    expect.objectContaining({ isFormReady: true }),
                    expect.anything(),
                )
                expect(mockDiscountCodeCard).toHaveBeenLastCalledWith(
                    expect.objectContaining({ isFormReady: true }),
                    expect.anything(),
                )
                expect(mockTimingCard).toHaveBeenLastCalledWith(
                    expect.objectContaining({ isFormReady: true }),
                    expect.anything(),
                )
            })
        })

        it('should pass isFormReady=true to AudienceCard after campaign data has loaded', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            render(<Setup />)

            await waitFor(() => {
                expect(mockAudienceCard).toHaveBeenLastCalledWith(
                    expect.objectContaining({ isFormReady: true }),
                    expect.anything(),
                )
            })
        })
    })

    describe('TimingCard rendering', () => {
        it.each([
            JOURNEY_TYPES.POST_PURCHASE,
            JOURNEY_TYPES.WELCOME,
            JOURNEY_TYPES.WIN_BACK,
        ])('should render TimingCard for %s journey type', (journeyType) => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType,
                journeyData: undefined,
            })

            const { getByText } = render(<Setup />)

            expect(getByText('TimingCard')).toBeInTheDocument()
        })

        it.each([
            JOURNEY_TYPES.CART_ABANDONMENT,
            JOURNEY_TYPES.SESSION_ABANDONMENT,
            JOURNEY_TYPES.CAMPAIGN,
        ])(
            'should not render TimingCard for %s journey type',
            (journeyType) => {
                mockUseJourneyContext.mockReturnValue({
                    isLoading: false,
                    journeyType,
                    journeyData: undefined,
                })

                const { queryByText } = render(<Setup />)

                expect(queryByText('TimingCard')).not.toBeInTheDocument()
            },
        )

        it('should pass journeyType to TimingCard', () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.WELCOME,
                journeyData: undefined,
            })

            render(<Setup />)

            expect(mockTimingCard).toHaveBeenLastCalledWith(
                expect.objectContaining({ journeyType: JOURNEY_TYPES.WELCOME }),
                expect.anything(),
            )
        })
    })

    describe('AudienceCard rendering', () => {
        it('should render AudienceCard for campaign journey type', async () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CAMPAIGN,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            const { getByText } = render(<Setup />)

            await waitFor(() => {
                expect(getByText('AudienceCard')).toBeInTheDocument()
            })
        })

        it('should not render AudienceCard for non-campaign journey types', () => {
            mockUseJourneyContext.mockReturnValue({
                isLoading: false,
                journeyType: JOURNEY_TYPES.CART_ABANDONMENT,
                journeyData: {
                    configuration: {
                        sms_sender_integration_id: 1,
                        sms_sender_number: '+1 555-123-4567',
                        max_follow_up_messages: 2,
                    },
                },
            })

            const { queryByText } = render(<Setup />)

            expect(queryByText('AudienceCard')).not.toBeInTheDocument()
        })
    })
})
