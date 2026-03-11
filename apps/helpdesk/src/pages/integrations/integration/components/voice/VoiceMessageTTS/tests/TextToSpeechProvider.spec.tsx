import type React from 'react'

import { Form } from '@repo/forms'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useFormContext } from 'react-hook-form'

import type { DomainEvent } from '@gorgias/events'
import type { VoiceMessageTextToSpeech } from '@gorgias/helpdesk-types'
import { VoiceGender, VoiceLanguage } from '@gorgias/helpdesk-types'
import { useChannel } from '@gorgias/realtime-ably'

import useAppSelector from 'hooks/useAppSelector'

import { DEFAULT_TTS_GENDER, DEFAULT_TTS_LANGUAGE } from '../constants'
import { useTextToSpeechContext } from '../TextToSpeechContext'
import TextToSpeechProvider from '../TextToSpeechProvider'

jest.mock('@gorgias/realtime-ably')
const mockUseChannel = useChannel as jest.Mock

jest.mock('hooks/useAppSelector')
const mockUseAppSelector = useAppSelector as jest.Mock

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

jest.mock('state/currentAccount/selectors', () => ({
    getCurrentAccountId: jest.fn(),
}))

jest.mock('state/currentUser/selectors', () => ({
    getCurrentUserId: jest.fn(),
}))

function createDomainEvent(partial: {
    id?: string
    dataschema: DomainEvent['dataschema']
    data: Record<string, unknown>
}): DomainEvent {
    return {
        type: 'test',
        source: '//helpdesk',
        subject: 'test',
        ...partial,
        id: partial.id ?? 'test-event-id',
    } as DomainEvent
}

describe('TextToSpeechProvider', () => {
    const mockIntegrationId = 123

    const defaultFormValues = {
        testField: {
            text_to_speech_content: 'Hello world',
            text_to_speech_recording_file_path: null,
            language: VoiceLanguage.EnUs,
            gender: VoiceGender.Female,
        },
    }

    const createWrapper = (formValues: any = defaultFormValues) => {
        return ({ children }: { children: React.ReactNode }) => (
            <Form defaultValues={formValues} onValidSubmit={jest.fn()}>
                <TextToSpeechProvider integrationId={mockIntegrationId}>
                    {children}
                </TextToSpeechProvider>
            </Form>
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppSelector.mockImplementation(() => '1')
    })

    describe('context', () => {
        it('should provide integrationId in context', () => {
            const { result } = renderHook(() => useTextToSpeechContext(), {
                wrapper: createWrapper(),
            })

            expect(result.current.integrationId).toBe(mockIntegrationId)
            expect(result.current.lastSelectedLanguage).toBe(
                DEFAULT_TTS_LANGUAGE,
            )
            expect(result.current.lastSelectedGender).toBe(DEFAULT_TTS_GENDER)
            expect(result.current.setLastSelectedLanguage).toBeDefined()
            expect(result.current.setLastSelectedGender).toBeDefined()
        })

        it('should update lastSelectedLanguage when setLastSelectedLanguage is called', () => {
            const { result } = renderHook(() => useTextToSpeechContext(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.setLastSelectedLanguage(VoiceLanguage.FrFr)
            })
        })

        it('should update lastSelectedGender when setLastSelectedGender is called', () => {
            const { result } = renderHook(() => useTextToSpeechContext(), {
                wrapper: createWrapper(),
            })

            act(() => {
                result.current.setLastSelectedGender(VoiceGender.Male)
            })

            expect(result.current.lastSelectedGender).toBe(VoiceGender.Male)
        })
    })

    describe('channel subscription', () => {
        it('should subscribe to user channel with correct parameters', () => {
            renderHook(() => useTextToSpeechContext(), {
                wrapper: createWrapper(),
            })

            expect(mockUseChannel).toHaveBeenCalledWith({
                channel: {
                    name: 'user',
                    accountId: '1',
                    userId: '1',
                },
                onEvent: expect.any(Function),
            })
        })
    })

    describe('TTS event handling', () => {
        it('should handle integration-property-synthesized event and update form', async () => {
            const { result } = renderHook(
                () => ({
                    form: useFormContext(),
                    context: useTextToSpeechContext(),
                }),
                {
                    wrapper: createWrapper(),
                },
            )

            const onEventCallback = mockUseChannel.mock.calls[0][0].onEvent

            const event = createDomainEvent({
                dataschema:
                    '//helpdesk/phone.voice-tts.preview.integration-property-synthesized/1.0.1',
                data: {
                    tts_url: 'https://example.com/tts-audio.mp3',
                    text: 'Hello world',
                    property_url: 'testField',
                    language_code: VoiceLanguage.EnUs,
                    voice_gender: VoiceGender.Female,
                },
            })

            act(() => {
                onEventCallback(event)
            })

            await waitFor(() => {
                const currentValue = result.current.form.getValues('testField')
                expect(currentValue.text_to_speech_recording_file_path).toBe(
                    'https://example.com/tts-audio.mp3',
                )
            })
        })

        it('should handle step-property-synthesized event and update form', async () => {
            const { result } = renderHook(
                () => ({
                    form: useFormContext(),
                    context: useTextToSpeechContext(),
                }),
                {
                    wrapper: createWrapper(),
                },
            )

            const onEventCallback = mockUseChannel.mock.calls[0][0].onEvent

            const event = createDomainEvent({
                dataschema:
                    '//helpdesk/phone.voice-tts.preview.step-property-synthesized/1.0.1',
                data: {
                    tts_url: 'https://example.com/step-audio.mp3',
                    text: 'Hello world',
                    property_url: 'testField',
                    language_code: VoiceLanguage.EnUs,
                    voice_gender: VoiceGender.Female,
                },
            })

            act(() => {
                onEventCallback(event)
            })

            await waitFor(() => {
                const currentValue = result.current.form.getValues('testField')
                expect(currentValue.text_to_speech_recording_file_path).toBe(
                    'https://example.com/step-audio.mp3',
                )
            })
        })

        it('should show error notification when error_message is present', () => {
            renderHook(() => useTextToSpeechContext(), {
                wrapper: createWrapper(),
            })

            const onEventCallback = mockUseChannel.mock.calls[0][0].onEvent

            const event = createDomainEvent({
                dataschema:
                    '//helpdesk/phone.voice-tts.preview.integration-property-synthesized/1.0.1',
                data: {
                    error_message: 'Failed to synthesize speech',
                    property_url: 'testField',
                },
            })

            act(() => {
                onEventCallback(event)
            })

            expect(mockNotify.error).toHaveBeenCalledWith(
                'Failed to generate voice preview: Failed to synthesize speech',
            )
        })

        it('should not update form if error_message is present', () => {
            const { result } = renderHook(
                () => ({
                    form: useFormContext(),
                    context: useTextToSpeechContext(),
                }),
                {
                    wrapper: createWrapper(),
                },
            )

            const onEventCallback = mockUseChannel.mock.calls[0][0].onEvent

            const event = createDomainEvent({
                dataschema:
                    '//helpdesk/phone.voice-tts.preview.integration-property-synthesized/1.0.1',
                data: {
                    error_message: 'Failed to synthesize speech',
                    property_url: 'testField',
                    tts_url: 'https://example.com/tts-audio.mp3',
                    text: 'Hello world',
                    language_code: VoiceLanguage.EnUs,
                    voice_gender: VoiceGender.Female,
                },
            })

            act(() => {
                onEventCallback(event)
            })

            const currentValue = result.current.form.getValues('testField')
            expect(currentValue.text_to_speech_recording_file_path).toBeNull()
        })

        it('should ignore event if text content has changed', () => {
            const customFormValues = {
                testField: {
                    text_to_speech_content: 'Different text',
                    text_to_speech_recording_file_path: null,
                    language: VoiceLanguage.EnUs,
                    gender: VoiceGender.Female,
                },
            }

            const { result } = renderHook(
                () => ({
                    form: useFormContext(),
                    context: useTextToSpeechContext(),
                }),
                {
                    wrapper: createWrapper(customFormValues),
                },
            )

            const onEventCallback = mockUseChannel.mock.calls[0][0].onEvent

            const event = createDomainEvent({
                dataschema:
                    '//helpdesk/phone.voice-tts.preview.integration-property-synthesized/1.0.1',
                data: {
                    tts_url: 'https://example.com/tts-audio.mp3',
                    text: 'Hello world',
                    property_url: 'testField',
                    language_code: VoiceLanguage.EnUs,
                    voice_gender: VoiceGender.Female,
                },
            })

            act(() => {
                onEventCallback(event)
            })

            const currentValue = result.current.form.getValues('testField')
            expect(currentValue.text_to_speech_recording_file_path).toBeNull()
        })

        it('should ignore event if language has changed', () => {
            const customFormValues = {
                testField: {
                    text_to_speech_content: 'Hello world',
                    text_to_speech_recording_file_path: null,
                    language: VoiceLanguage.EsEs,
                    gender: VoiceGender.Female,
                } as VoiceMessageTextToSpeech,
            }

            const { result } = renderHook(
                () => ({
                    form: useFormContext(),
                    context: useTextToSpeechContext(),
                }),
                {
                    wrapper: createWrapper(customFormValues),
                },
            )

            const onEventCallback = mockUseChannel.mock.calls[0][0].onEvent

            const event = createDomainEvent({
                dataschema:
                    '//helpdesk/phone.voice-tts.preview.integration-property-synthesized/1.0.1',
                data: {
                    tts_url: 'https://example.com/tts-audio.mp3',
                    text: 'Hello world',
                    property_url: 'testField',
                    language_code: VoiceLanguage.EnUs,
                    voice_gender: VoiceGender.Female,
                },
            })

            act(() => {
                onEventCallback(event)
            })

            const currentValue = result.current.form.getValues('testField')
            expect(currentValue.text_to_speech_recording_file_path).toBeNull()
        })

        it('should ignore event if gender has changed', () => {
            const customFormValues = {
                testField: {
                    text_to_speech_content: 'Hello world',
                    text_to_speech_recording_file_path: null,
                    language: VoiceLanguage.EnUs,
                    gender: VoiceGender.Male,
                },
            }

            const { result } = renderHook(
                () => ({
                    form: useFormContext(),
                    context: useTextToSpeechContext(),
                }),
                {
                    wrapper: createWrapper(customFormValues),
                },
            )

            const onEventCallback = mockUseChannel.mock.calls[0][0].onEvent

            const event = createDomainEvent({
                dataschema:
                    '//helpdesk/phone.voice-tts.preview.integration-property-synthesized/1.0.1',
                data: {
                    tts_url: 'https://example.com/tts-audio.mp3',
                    text: 'Hello world',
                    property_url: 'testField',
                    language_code: VoiceLanguage.EnUs,
                    voice_gender: VoiceGender.Female,
                },
            })

            act(() => {
                onEventCallback(event)
            })

            const currentValue = result.current.form.getValues('testField')
            expect(currentValue.text_to_speech_recording_file_path).toBeNull()
        })

        it('should ignore events with unrelated dataschema', () => {
            const { result } = renderHook(
                () => ({
                    form: useFormContext(),
                    context: useTextToSpeechContext(),
                }),
                {
                    wrapper: createWrapper(),
                },
            )

            const onEventCallback = mockUseChannel.mock.calls[0][0].onEvent

            const event = createDomainEvent({
                dataschema:
                    '//helpdesk/phone.voice-call.inbound.ticket-associated/1.0.1',
                data: {},
            })

            act(() => {
                onEventCallback(event)
            })

            const currentValue = result.current.form.getValues('testField')
            expect(currentValue.text_to_speech_recording_file_path).toBeNull()
        })
    })

    describe('form integration', () => {
        it('should update correct nested field path', async () => {
            const nestedFormValues = {
                steps: [
                    {
                        greeting: {
                            text_to_speech_content: 'Test message',
                            text_to_speech_recording_file_path: null,
                            language: VoiceLanguage.FrFr,
                            gender: VoiceGender.Male,
                        },
                    },
                ],
            }

            const { result } = renderHook(
                () => ({
                    form: useFormContext(),
                    context: useTextToSpeechContext(),
                }),
                {
                    wrapper: createWrapper(nestedFormValues),
                },
            )

            const onEventCallback = mockUseChannel.mock.calls[0][0].onEvent

            const event = createDomainEvent({
                dataschema:
                    '//helpdesk/phone.voice-tts.preview.step-property-synthesized/1.0.1',
                data: {
                    tts_url: 'https://example.com/nested-audio.mp3',
                    text: 'Test message',
                    property_url: 'steps.0.greeting',
                    language_code: VoiceLanguage.FrFr,
                    voice_gender: VoiceGender.Male,
                },
            })

            act(() => {
                onEventCallback(event)
            })

            await waitFor(() => {
                const currentValue =
                    result.current.form.getValues('steps.0.greeting')
                expect(currentValue.text_to_speech_recording_file_path).toBe(
                    'https://example.com/nested-audio.mp3',
                )
            })
        })
    })
})
