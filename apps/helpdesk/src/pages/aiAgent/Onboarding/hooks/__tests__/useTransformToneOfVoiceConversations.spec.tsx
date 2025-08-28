import { FeatureFlagKey } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { account } from 'fixtures/account'
import { transformToneOfVoice } from 'models/aiAgent/resources/transform-tone-of-voice'
import { OnboardingData } from 'models/aiAgent/types'
import { PRODUCT_RECOMMENDATION_MESSAGE_ID } from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/constants'
import { conversationExamples } from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/conversationsExamples'
import useTopProducts from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'

import { useTransformToneOfVoiceConversations } from '../useTransformToneOfVoiceConversations'

jest.mock('models/aiAgent/resources/transform-tone-of-voice')
const transformToneOfVoiceMock = assumeMock(transformToneOfVoice)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

jest.mock('pages/aiAgent/Onboarding/components/TopProductsCard/hooks')
const useTopProductsMock = assumeMock(useTopProducts)

jest.mock('launchdarkly-react-client-sdk')
const useFlagsMock = assumeMock(useFlags)

describe('useTransformToneOfVoiceConversations', () => {
    beforeEach(() => {
        transformToneOfVoiceMock.mockResolvedValue([
            {
                id: 'productRecommendations',
                messages: [
                    {
                        id: PRODUCT_RECOMMENDATION_MESSAGE_ID,
                        message: 'Test message',
                        from_agent: true,
                    },
                ],
            },
        ])
        useGetOnboardingDataMock.mockReturnValue({
            data: {
                preview: '',
                customToneOfVoiceGuidance: 'Be smart',
            } as OnboardingData,
            isLoading: false,
        })
        useTopProductsMock.mockReturnValue({
            data: [
                {
                    id: 1,
                    title: 'Test product',
                    description: 'Test description',
                    price: 12,
                    featuredImage: 'https://test.com/image.jpg',
                },
            ],
            isLoading: false,
        })
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentOnboardingMLPreview]: true,
        } as any)
    })

    it('should call transformToneOfVoice with correct params', async () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useTransformToneOfVoiceConversations(
                    1,
                    'test-store',
                    'productRecommendations',
                ),
            {
                currentAccount: fromJS(account),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.isPreviewLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(
                '{"productRecommendations":{"messages":[{"content":"Test message","isHtml":true,"fromAgent":true,"attachments":[{"content_type":"application/productCard","size":1,"url":"https://test.com/image.jpg","name":"Test product","extra":{"product_id":1,"variant_id":1,"variant_name":"Test product","product_link":"https://test.com/image.jpg","featured_image":"https://test.com/image.jpg","price":"12"}}]}]}}',
            )
            expect(result.current.previewConversation).toStrictEqual({
                messages: [
                    {
                        attachments: [
                            {
                                content_type: 'application/productCard',
                                extra: {
                                    featured_image:
                                        'https://test.com/image.jpg',
                                    product_id: 1,
                                    product_link: 'https://test.com/image.jpg',
                                    variant_id: 1,
                                    variant_name: 'Test product',
                                    price: '12',
                                },
                                name: 'Test product',
                                size: 1,
                                url: 'https://test.com/image.jpg',
                            },
                        ],
                        content: 'Test message',
                        fromAgent: true,
                        isHtml: true,
                    },
                ],
            })
        })

        expect(transformToneOfVoiceMock).toHaveBeenCalledWith(
            'acme',
            'Be smart',
            expect.anything(),
            expect.objectContaining({
                title: 'Test product',
                description: 'Test description',
            }),
        )
    })

    it('should use cache', async () => {
        useGetOnboardingDataMock.mockReturnValue({
            data: {
                preview: JSON.stringify({
                    ...conversationExamples,
                    default: {
                        messages: [
                            {
                                attachments: [],
                                content: 'Test cache message',
                                fromAgent: true,
                                isHtml: true,
                            },
                        ],
                    },
                }),
                customToneOfVoiceGuidance: 'Be smart',
            } as OnboardingData,
            isLoading: false,
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useTransformToneOfVoiceConversations(
                    1,
                    'test-store',
                    'default',
                ),
            {
                currentAccount: fromJS(account),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.isPreviewLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(undefined)
            expect(result.current.previewConversation).toEqual(
                expect.objectContaining({
                    messages: [
                        {
                            attachments: [],
                            content: 'Test cache message',
                            fromAgent: true,
                            isHtml: true,
                        },
                    ],
                }),
            )
        })

        expect(transformToneOfVoiceMock).not.toHaveBeenCalled()
    })

    it("should use friendly tone of voice when there's no customToneOfVoiceGuidance in data", async () => {
        useGetOnboardingDataMock.mockReturnValue({
            data: {
                preview: '',
                customToneOfVoiceGuidance: '',
            } as OnboardingData,
            isLoading: false,
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useTransformToneOfVoiceConversations(
                    1,
                    'test-store',
                    'productRecommendations',
                ),
            {
                currentAccount: fromJS(account),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.isPreviewLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(
                '{"productRecommendations":{"messages":[{"content":"Test message","isHtml":true,"fromAgent":true,"attachments":[{"content_type":"application/productCard","size":1,"url":"https://test.com/image.jpg","name":"Test product","extra":{"product_id":1,"variant_id":1,"variant_name":"Test product","product_link":"https://test.com/image.jpg","featured_image":"https://test.com/image.jpg","price":"12"}}]}]}}',
            )
            expect(result.current.previewConversation).toStrictEqual({
                messages: [
                    {
                        attachments: [
                            {
                                content_type: 'application/productCard',
                                extra: {
                                    featured_image:
                                        'https://test.com/image.jpg',
                                    product_id: 1,
                                    product_link: 'https://test.com/image.jpg',
                                    variant_id: 1,
                                    variant_name: 'Test product',
                                    price: '12',
                                },
                                name: 'Test product',
                                size: 1,
                                url: 'https://test.com/image.jpg',
                            },
                        ],
                        content: 'Test message',
                        fromAgent: true,
                        isHtml: true,
                    },
                ],
            })
        })

        expect(transformToneOfVoiceMock).toHaveBeenCalledWith(
            'acme',
            'Friendly',
            expect.anything(),
            expect.objectContaining({
                title: 'Test product',
                description: 'Test description',
            }),
        )
    })

    it('should use friendly tone of voice when data is missing', async () => {
        useGetOnboardingDataMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useTransformToneOfVoiceConversations(
                    1,
                    'test-store',
                    'productRecommendations',
                ),
            {
                currentAccount: fromJS(account),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.isPreviewLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(
                '{"productRecommendations":{"messages":[{"content":"Test message","isHtml":true,"fromAgent":true,"attachments":[{"content_type":"application/productCard","size":1,"url":"https://test.com/image.jpg","name":"Test product","extra":{"product_id":1,"variant_id":1,"variant_name":"Test product","product_link":"https://test.com/image.jpg","featured_image":"https://test.com/image.jpg","price":"12"}}]}]}}',
            )
            expect(result.current.previewConversation).toStrictEqual({
                messages: [
                    {
                        attachments: [
                            {
                                content_type: 'application/productCard',
                                extra: {
                                    featured_image:
                                        'https://test.com/image.jpg',
                                    product_id: 1,
                                    product_link: 'https://test.com/image.jpg',
                                    variant_id: 1,
                                    variant_name: 'Test product',
                                    price: '12',
                                },
                                name: 'Test product',
                                size: 1,
                                url: 'https://test.com/image.jpg',
                            },
                        ],
                        content: 'Test message',
                        fromAgent: true,
                        isHtml: true,
                    },
                ],
            })
        })

        expect(transformToneOfVoiceMock).toHaveBeenCalledWith(
            'acme',
            'Friendly',
            expect.anything(),
            expect.objectContaining({
                title: 'Test product',
                description: 'Test description',
            }),
        )
    })

    it('should return hardcoded when FF is deactivated', async () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentOnboardingMLPreview]: false,
        } as any)

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () =>
                useTransformToneOfVoiceConversations(
                    1,
                    'test-store',
                    'default',
                ),
            {
                currentAccount: fromJS(account),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(undefined)
            expect(result.current.previewConversation).toBe(
                conversationExamples.default,
            )
        })

        expect(transformToneOfVoiceMock).not.toHaveBeenCalled()
    })

    it('should return hardcoded when account domain is undefined', async () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(() =>
            useTransformToneOfVoiceConversations(1, 'test-store', 'default'),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(undefined)
            expect(result.current.previewConversation).toBe(
                conversationExamples.default,
            )
        })

        expect(transformToneOfVoiceMock).not.toHaveBeenCalled()
    })
})
