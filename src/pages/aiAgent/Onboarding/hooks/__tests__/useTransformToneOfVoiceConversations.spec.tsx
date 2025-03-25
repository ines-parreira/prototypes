import { waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { transformToneOfVoice } from 'models/aiAgent/resources/transform-tone-of-voice'
import { OnboardingData } from 'models/aiAgent/types'
import { conversationExamples } from 'pages/aiAgent/Onboarding/components/steps/PersonalityPreviewStep/conversationsExamples'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { assumeMock } from 'utils/testing'

import { useTransformToneOfVoiceConversations } from '../useTransformToneOfVoiceConversations'

jest.mock('models/aiAgent/resources/transform-tone-of-voice')
const transformToneOfVoiceMock = assumeMock(transformToneOfVoice)

jest.mock('pages/aiAgent/Onboarding/hooks/useGetOnboardingData')
const useGetOnboardingDataMock = assumeMock(useGetOnboardingData)

describe('useTransformToneOfVoiceConversations', () => {
    beforeEach(() => {
        transformToneOfVoiceMock.mockResolvedValue(
            axiosSuccessResponse({
                conversations: [
                    {
                        id: 'test',
                        messages: [
                            {
                                id: 'message-test',
                                message: 'Test message',
                                from_agent: true,
                            },
                        ],
                    },
                ],
            }),
        )
        useGetOnboardingDataMock.mockReturnValue({
            data: {
                preview: '',
                customToneOfVoiceGuidance: 'Be smart',
            } as OnboardingData,
            isLoading: false,
        })
    })

    it('should call transformToneOfVoice with correct params', async () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useTransformToneOfVoiceConversations('test-store'),
            {
                currentAccount: fromJS(account),
            },
        )

        await waitFor(() => {
            expect(result.current.isLoading).toStrictEqual(false)
            expect(result.current.preview).toBe(
                '{"test":{"messages":[{"content":"Test message","isHtml":true,"fromAgent":true,"attachments":[]}]}}',
            )
            expect(result.current.conversations).toStrictEqual({
                test: {
                    messages: [
                        {
                            attachments: [],
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
            () => useTransformToneOfVoiceConversations('test-store'),
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
            () => useTransformToneOfVoiceConversations('test-store'),
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
