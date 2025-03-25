import { useCallback, useEffect, useState } from 'react'

import { useMutation } from '@tanstack/react-query'
import _isEqual from 'lodash/isEqual'

import useAppSelector from 'hooks/useAppSelector'
import { transformToneOfVoice } from 'models/aiAgent/resources/transform-tone-of-voice'
import { TransformToneOfVoiceConversation } from 'models/aiAgent/types'
import { PreviewId } from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/constants'
import {
    ConversationExamples,
    conversationExamples,
} from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/conversationsExamples'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useGetOnboardingData } from './useGetOnboardingData'

export const useTransformToneOfVoiceConversations = (shopName: string) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const gorgiasDomain = currentAccount.get('domain')

    const [cacheResult, setCacheResult] = useState(false)
    const [outputConversations, setOutputConversations] =
        useState<ConversationExamples>()

    const { data, isLoading: isLoadingOnboardingData } =
        useGetOnboardingData(shopName)

    const { mutateAsync: transformConversation, isLoading } = useMutation(
        ({
            gorgiasDomain,
            toneOfVoice,
            conversations,
        }: {
            gorgiasDomain: string
            toneOfVoice: string
            conversations: TransformToneOfVoiceConversation[]
        }) => transformToneOfVoice(gorgiasDomain, toneOfVoice, conversations),
    )

    const inputConversations: TransformToneOfVoiceConversation[] =
        Object.entries(conversationExamples).map(
            ([conversationId, conversations]) => ({
                id: conversationId,
                messages: conversations.messages.map((message, index) => ({
                    id: index.toString(),
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

        if (gorgiasDomain && data?.customToneOfVoiceGuidance) {
            try {
                const response = await transformConversation({
                    gorgiasDomain,
                    toneOfVoice: data.customToneOfVoiceGuidance,
                    conversations: inputConversations,
                })

                const responseConversations =
                    response.data.conversations.reduce(
                        (acc, conversation) => ({
                            ...acc,
                            [conversation.id as PreviewId]: {
                                messages: conversation.messages.map(
                                    (message) => ({
                                        content: message.message,
                                        isHtml: true,
                                        fromAgent: message.from_agent,
                                        attachments: [],
                                    }),
                                ),
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
    }, [gorgiasDomain, transformConversation, inputConversations, data])

    useEffect(() => {
        if (!isLoadingOnboardingData) {
            void transformConversations()
        }
    }, [isLoadingOnboardingData])

    return {
        isLoading: isLoading || isLoadingOnboardingData,
        conversations: outputConversations,
        preview: cacheResult ? JSON.stringify(outputConversations) : undefined,
    }
}
