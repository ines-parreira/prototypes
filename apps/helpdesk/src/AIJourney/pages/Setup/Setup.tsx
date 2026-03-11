import { useEffect, useState } from 'react'

import { useFormContext } from 'react-hook-form'

import { Box } from '@gorgias/axiom'
import type {
    PostPurchaseJourneyConfigurationApiDTO,
    WelcomeFlowConfigurationApiDTO,
    WinbackJourneyConfigurationApiDTO,
} from '@gorgias/convert-client'
import { OrderStatusEnum } from '@gorgias/convert-client'

import {
    AudienceCard,
    DiscountCodeCard,
    GeneralCard,
    TimingCard,
} from 'AIJourney/components'
import type { UploadedImageAttachment } from 'AIJourney/components/ImageDropzone/ImageDropzone'
import { JOURNEY_TYPES } from 'AIJourney/constants'
import { useJourneyContext } from 'AIJourney/providers'

export type SetupFormValues = {
    sms_sender_integration_id: {
        id: number | null | undefined
        label: string | null | undefined
    }
    max_follow_up_messages: number
    include_image?: boolean
    uploaded_image_attachment?: UploadedImageAttachment[]
    offer_discount?: boolean
    max_discount_percent?: number
    discount_code_message_threshold?: number
    target_order_status: OrderStatusEnum
    post_purchase_wait_minutes?: number
    wait_time_minutes?: number
    cooldown_days?: number
    inactive_days?: number
    message_instructions?: string
    included_audience_list_ids?: string[]
    excluded_audience_list_ids?: string[]
    campaignTitle?: string
}

export const Setup = () => {
    const {
        isLoading: isLoadingJourneyData,
        journeyData,
        journeyType,
    } = useJourneyContext()
    const { configuration: journeyParams } = journeyData || {}

    const { reset } = useFormContext<SetupFormValues>()
    const [isFormReady, setIsFormReady] = useState(false)

    const isCampaign = journeyType === JOURNEY_TYPES.CAMPAIGN
    const shouldRenderTimingCard = ![
        JOURNEY_TYPES.CART_ABANDONMENT,
        JOURNEY_TYPES.SESSION_ABANDONMENT,
        JOURNEY_TYPES.CAMPAIGN,
    ].includes(journeyType)

    useEffect(() => {
        if (!isLoadingJourneyData) {
            if (journeyParams) {
                const hasCustomImage =
                    'media_urls' in journeyParams &&
                    journeyParams.media_urls &&
                    journeyParams.media_urls.length > 0
                reset({
                    sms_sender_integration_id: {
                        id: journeyParams.sms_sender_integration_id,
                        label: journeyParams.sms_sender_number,
                    },
                    max_follow_up_messages:
                        (journeyParams.max_follow_up_messages ?? 0) + 1,
                    include_image: journeyParams.include_image ?? false,
                    uploaded_image_attachment: hasCustomImage
                        ? [
                              {
                                  url: journeyParams.media_urls![0].url,
                                  name: journeyParams.media_urls![0].name,
                                  content_type:
                                      journeyParams.media_urls![0].content_type,
                              },
                          ]
                        : undefined,
                    offer_discount: journeyParams.offer_discount ?? false,
                    max_discount_percent:
                        journeyParams.max_discount_percent ?? undefined,
                    discount_code_message_threshold:
                        journeyParams.discount_code_message_threshold ??
                        undefined,
                    target_order_status:
                        (
                            journeyParams as PostPurchaseJourneyConfigurationApiDTO
                        ).target_order_status ?? OrderStatusEnum.OrderFulfilled,
                    post_purchase_wait_minutes:
                        (
                            journeyParams as PostPurchaseJourneyConfigurationApiDTO
                        ).post_purchase_wait_minutes ?? undefined,
                    wait_time_minutes:
                        (journeyParams as WelcomeFlowConfigurationApiDTO)
                            .wait_time_minutes ?? undefined,
                    cooldown_days:
                        (journeyParams as WinbackJourneyConfigurationApiDTO)
                            .cooldown_days ?? undefined,
                    inactive_days:
                        (journeyParams as WinbackJourneyConfigurationApiDTO)
                            .inactive_days ?? undefined,
                    included_audience_list_ids:
                        journeyData?.included_audience_list_ids ?? undefined,
                    excluded_audience_list_ids:
                        journeyData?.excluded_audience_list_ids ?? undefined,
                    campaignTitle: journeyData?.campaign?.title ?? undefined,
                })
            }
            setIsFormReady(true)
        }
    }, [isLoadingJourneyData, journeyData, journeyParams, reset])

    return (
        <Box flexDirection="column" gap="lg">
            <GeneralCard isFormReady={isFormReady} />
            <DiscountCodeCard isFormReady={isFormReady} />
            {shouldRenderTimingCard && (
                <TimingCard
                    isFormReady={isFormReady}
                    journeyType={journeyType}
                />
            )}
            {isCampaign && <AudienceCard isFormReady={isFormReady} />}
        </Box>
    )
}
