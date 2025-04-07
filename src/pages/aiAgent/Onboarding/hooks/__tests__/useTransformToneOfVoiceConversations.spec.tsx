import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { account } from 'fixtures/account'
import { transformToneOfVoice } from 'models/aiAgent/resources/transform-tone-of-voice'
import { OnboardingData } from 'models/aiAgent/types'
import { PRODUCT_RECOMMENDATION_MESSAGE_ID } from 'pages/aiAgent/Onboarding/components/PersonalityPreviewGroup/constants'
import { conversationExamples } from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/conversationsExamples'
import useTopProducts from 'pages/aiAgent/Onboarding/components/TopProductsCard/hooks'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { assumeMock } from 'utils/testing'

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
                id: 'test',
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
            () => useTransformToneOfVoiceConversations(1, 'test-store'),
            {
                currentAccount: fromJS(account),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(
                '{"test":{"messages":[{"content":"Test message","isHtml":true,"fromAgent":true,"attachments":[{"content_type":"application/productCard","size":1,"url":"https://test.com/image.jpg","name":"Test product","extra":{"product_id":1,"variant_id":1,"variant_name":"Test product","product_link":"https://test.com/image.jpg","featured_image":"https://test.com/image.jpg","price":"12"}}]}]}}',
            )
            expect(result.current.conversations).toStrictEqual({
                test: {
                    messages: [
                        {
                            attachments: [
                                {
                                    content_type: 'application/productCard',
                                    extra: {
                                        featured_image:
                                            'https://test.com/image.jpg',
                                        product_id: 1,
                                        product_link:
                                            'https://test.com/image.jpg',
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
                },
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
            () => useTransformToneOfVoiceConversations(1, 'test-store'),
            {
                currentAccount: fromJS(account),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(undefined)
            expect(result.current.conversations).toEqual(
                expect.objectContaining({
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
            )
        })

        expect(transformToneOfVoiceMock).not.toHaveBeenCalled()
    })

    it("should return hardcoded when there's no customToneOfVoiceGuidance", async () => {
        useGetOnboardingDataMock.mockReturnValue({
            data: {
                preview: '',
                customToneOfVoiceGuidance: '',
            } as OnboardingData,
            isLoading: false,
        })

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useTransformToneOfVoiceConversations(1, 'test-store'),
            {
                currentAccount: fromJS(account),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(undefined)
            expect(result.current.conversations).toBe(conversationExamples)
        })

        expect(transformToneOfVoiceMock).not.toHaveBeenCalled()
    })

    it('should return hardcoded when FF is deactivated', async () => {
        useFlagsMock.mockReturnValue({
            [FeatureFlagKey.AiAgentOnboardingMLPreview]: false,
        } as any)

        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useTransformToneOfVoiceConversations(1, 'test-store'),
            {
                currentAccount: fromJS(account),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(undefined)
            expect(result.current.conversations).toBe(conversationExamples)
        })

        expect(transformToneOfVoiceMock).not.toHaveBeenCalled()
    })
})
