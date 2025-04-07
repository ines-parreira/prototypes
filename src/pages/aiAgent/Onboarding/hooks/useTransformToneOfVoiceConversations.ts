import { useCallback, useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import { useFlags } from 'launchdarkly-react-client-sdk'
import _isEqual from 'lodash/isEqual'
import moment from 'moment/moment'

import { AttachmentEnum } from 'common/types'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { transformToneOfVoice } from 'models/aiAgent/resources/transform-tone-of-voice'
import { TransformToneOfVoiceConversation } from 'models/aiAgent/types'
import { StatsFilters } from 'models/stat/types'
import {
    PreviewId,
    PRODUCT_RECOMMENDATION_MESSAGE_ID,
} from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/constants'
import {
    ConversationExamples,
    conversationExamples,
} from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/conversationsExamples'
import useTopProducts from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { Product } from 'pages/aiAgent/Onboarding/components/TopProductsCard/types'
import { ProductCardAttachment } from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import { LogicalOperatorEnum } from 'pages/stats/common/components/Filter/constants'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getTimezone } from 'state/currentUser/selectors'

import { useGetOnboardingData } from './useGetOnboardingData'

const transformProductToAttachment = (
    product: Product,
): ProductCardAttachment => ({
    content_type: AttachmentEnum.Product,
    size: 1,
    url: product.featuredImage,
    name: product.title,
    extra: {
        product_id: product.id,
        variant_id: product.id,
        variant_name: product.title,
        product_link: product.featuredImage,
        featured_image: product.featuredImage,
        price: product.price.toString(),
    },
})

export const useTransformToneOfVoiceConversations = (
    shopIntegrationId: number,
    shopName: string,
) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const timezone = useAppSelector(getTimezone) ?? 'UTC'
    const gorgiasDomain = currentAccount.get('domain')

    const isMlPreviewEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingMLPreview]

    const [cacheResult, setCacheResult] = useState(false)
    const [outputConversations, setOutputConversations] =
        useState<ConversationExamples>()

    const { data, isLoading: isLoadingOnboardingData } =
        useGetOnboardingData(shopName)

    const filters: StatsFilters = {
        period: {
            start_datetime: moment()
                .subtract(1, 'month')
                .startOf('day')
                .format(),
            end_datetime: moment().endOf('day').format(),
        },
        storeIntegrations: {
            operator: LogicalOperatorEnum.ONE_OF,
            values: [shopIntegrationId],
        },
    }
    const { data: products, isLoading: isProductDataLoading } = useTopProducts({
        filters,
        timezone,
    })

    const { mutateAsync: transformConversation, isLoading } = useMutation(
        ({
            gorgiasDomain,
            toneOfVoice,
            conversations,
            product,
        }: {
            gorgiasDomain: string
            toneOfVoice: string
            conversations: TransformToneOfVoiceConversation[]
            product?: { title: string; description: string }
        }) =>
            transformToneOfVoice(
                gorgiasDomain,
                toneOfVoice,
                conversations,
                product,
            ),
    )

    const inputConversations: TransformToneOfVoiceConversation[] =
        Object.entries(conversationExamples).map(
            ([conversationId, conversations]) => ({
                id: conversationId,
                messages: conversations.messages.map((message, index) => ({
                    id: message.id || index.toString(),
                    message: message.content,
                    from_agent: message.fromAgent,
                })),
            }),
        )

    const transformConversations = useCallback(async () => {
        if (data?.preview) {
            let cachedConversations = {} as ConversationExamples
            try {
                cachedConversations = JSON.parse(data.preview) || {}
            } catch (e) {
                console.error('Failed to parse cached conversations', e)
            }

            if (
                _isEqual(
                    Object.keys(cachedConversations),
                    Object.keys(conversationExamples),
                )
            ) {
                setOutputConversations(cachedConversations)
                return
            }
        }

        if (!isMlPreviewEnabled) {
            setOutputConversations(conversationExamples)
            return
        }

        const product = products.length > 0 ? products[0] : undefined

        if (gorgiasDomain && data?.customToneOfVoiceGuidance) {
            try {
                const response = await transformConversation({
                    gorgiasDomain,
                    toneOfVoice: data.customToneOfVoiceGuidance,
                    conversations: inputConversations,
                    product: product,
                })

                const responseConversations = response.reduce(
                    (acc, conversation) => ({
                        ...acc,
                        [conversation.id as PreviewId]: {
                            messages: conversation.messages.map((message) => {
                                let attachments: ProductCardAttachment[] = []
                                if (
                                    product &&
                                    message.id ===
                                        PRODUCT_RECOMMENDATION_MESSAGE_ID
                                ) {
                                    attachments = [
                                        transformProductToAttachment(product),
                                    ]
                                }

                                return {
                                    content: message.message,
                                    isHtml: true,
                                    fromAgent: message.from_agent,
                                    attachments: attachments,
                                }
                            }),
                        },
                    }),
                    {} as ConversationExamples,
                )

                setCacheResult(true)
                setOutputConversations(responseConversations)
                return
            } catch (error) {
                console.error('Failed to transform conversations', error)
            }
        }

        setOutputConversations(conversationExamples)
    }, [
        gorgiasDomain,
        transformConversation,
        inputConversations,
        data,
        products,
        isMlPreviewEnabled,
    ])

    useEffect(() => {
        if (!isLoadingOnboardingData && !isProductDataLoading) {
            void transformConversations()
        }
    }, [isLoadingOnboardingData, isProductDataLoading])

    return {
        isLoading:
            (isLoading || isLoadingOnboardingData || isProductDataLoading) &&
            outputConversations === undefined,
        conversations: outputConversations,
        preview: cacheResult ? JSON.stringify(outputConversations) : undefined,
    }
}
