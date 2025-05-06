import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
    previewId?: PreviewId,
) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const timezone = useAppSelector(getTimezone) ?? 'UTC'
    const gorgiasDomain = currentAccount.get('domain')

    const isMlPreviewEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingMLPreview]

    const [cacheResult, setCacheResult] = useState(false)
    const [outputConversations, setOutputConversations] =
        useState<Partial<ConversationExamples>>()
    const outputConversationRef = useRef(outputConversations)
    const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>()
    const [isAllConversationsLoading, setIsAllConversationsLoading] =
        useState(false)

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

    const { mutateAsync: transformConversation } = useMutation(
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

    const transformConversations = useCallback(
        async (
            conversations: TransformToneOfVoiceConversation[],
            onSuccess: (conversations: ConversationExamples) => void,
        ) => {
            if (data?.preview) {
                let cachedConversations = {} as ConversationExamples
                try {
                    cachedConversations = JSON.parse(data.preview) || {}
                } catch (e) {
                    console.error('Failed to parse cached conversations', e)
                }

                if (
                    _isEqual(
                        Object.keys(cachedConversations).sort(),
                        Object.keys(conversationExamples).sort(),
                    )
                ) {
                    onSuccess(cachedConversations)
                    return
                }
            }

            if (!isMlPreviewEnabled) {
                onSuccess(conversationExamples)
                return
            }

            if (gorgiasDomain && data?.customToneOfVoiceGuidance) {
                try {
                    const response = await transformConversation({
                        gorgiasDomain,
                        toneOfVoice: data.customToneOfVoiceGuidance,
                        conversations,
                        product: products.length > 0 ? products[0] : undefined,
                    })

                    const responseConversations = response.reduce(
                        (acc, conversation) => ({
                            ...acc,
                            [conversation.id as PreviewId]: {
                                messages: conversation.messages.map(
                                    (message) => {
                                        let attachments: ProductCardAttachment[] =
                                            []
                                        if (
                                            products.length > 0 &&
                                            message.id ===
                                                PRODUCT_RECOMMENDATION_MESSAGE_ID
                                        ) {
                                            attachments = [
                                                transformProductToAttachment(
                                                    products[0],
                                                ),
                                            ]
                                        }

                                        return {
                                            content: message.message,
                                            isHtml: true,
                                            fromAgent: message.from_agent,
                                            attachments: attachments,
                                        }
                                    },
                                ),
                            },
                        }),
                        {} as ConversationExamples,
                    )

                    setCacheResult(true)
                    onSuccess(responseConversations)
                } catch {
                    // Failed to transform conversations, fallback to examples
                    onSuccess(conversationExamples)
                }
            } else {
                onSuccess(conversationExamples)
            }
        },
        [
            gorgiasDomain,
            transformConversation,
            data,
            products,
            isMlPreviewEnabled,
        ],
    )

    const updateResult = useCallback(
        (transformedConversations: Partial<ConversationExamples>) => {
            // Merge the transformed conversations with the existing ones
            const finalConversations = outputConversationRef.current
                ? {
                      ...outputConversationRef.current,
                      ...transformedConversations,
                  }
                : transformedConversations

            setOutputConversations(finalConversations)
            outputConversationRef.current = finalConversations
            setIsAllConversationsLoading(
                _isEqual(
                    Object.keys(finalConversations),
                    Object.keys(conversationExamples),
                ),
            )
        },
        [],
    )

    // Effect for handling preview conversation
    useEffect(() => {
        if (
            !isLoadingOnboardingData &&
            !isProductDataLoading &&
            !isPreviewLoading &&
            isMlPreviewEnabled !== undefined &&
            previewId &&
            (!outputConversations?.[previewId] ||
                isPreviewLoading === undefined)
        ) {
            setIsPreviewLoading(true)
            const singleConversation = inputConversations.find(
                (c) => c.id === previewId,
            )
            if (singleConversation) {
                void transformConversations(
                    [singleConversation],
                    (conversations) => updateResult(conversations),
                )
            }
        }
    }, [
        isLoadingOnboardingData,
        isProductDataLoading,
        isPreviewLoading,
        previewId,
        transformConversations,
        outputConversations,
        inputConversations,
        isMlPreviewEnabled,
    ])

    // Effect for transforming all conversations
    useEffect(() => {
        if (
            !isLoadingOnboardingData &&
            !isProductDataLoading &&
            isMlPreviewEnabled !== undefined &&
            !outputConversations &&
            !isAllConversationsLoading
        ) {
            setIsAllConversationsLoading(true)
            const conversationsToTransform = previewId
                ? inputConversations.filter((conv) => conv.id !== previewId)
                : inputConversations

            const chunkSize = 4
            for (
                let i = 0;
                i < conversationsToTransform.length;
                i += chunkSize
            ) {
                const chunk = conversationsToTransform.slice(i, i + chunkSize)
                void transformConversations(chunk, (conversations) =>
                    updateResult(conversations),
                )
            }
        }
    }, [
        isLoadingOnboardingData,
        isProductDataLoading,
        transformConversations,
        previewId,
        inputConversations,
        isAllConversationsLoading,
        outputConversations,
        isMlPreviewEnabled,
    ])

    useEffect(() => {
        if (isPreviewLoading) {
            setIsPreviewLoading(
                !!previewId &&
                    (!outputConversations || !outputConversations[previewId]),
            )
        }
    }, [outputConversations, previewId, isPreviewLoading])

    const previewConversation = useMemo(
        () =>
            !isPreviewLoading && outputConversations && previewId
                ? outputConversations[previewId]
                : undefined,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isPreviewLoading, previewId],
    )

    return {
        isLoading: previewId
            ? isPreviewLoading && isAllConversationsLoading
            : isAllConversationsLoading,
        isPreviewLoading: isPreviewLoading ?? true,
        previewConversation: previewConversation,
        preview: cacheResult ? JSON.stringify(outputConversations) : undefined,
    }
}
