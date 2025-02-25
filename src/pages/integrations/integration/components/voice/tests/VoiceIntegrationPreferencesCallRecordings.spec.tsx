import React from 'react'

import { render, RenderResult } from '@testing-library/react'
import { mockFlags } from 'jest-launchdarkly-mock'
import { useFormContext } from 'react-hook-form'

import { VoiceMessageType } from '@gorgias/api-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { FormField } from 'core/forms'
import { assumeMock } from 'utils/testing'

import VoiceIntegrationPreferencesCallRecordings from '../VoiceIntegrationPreferencesCallRecordings'
import VoiceMessageField from '../VoiceMessageField'

jest.mock('core/forms')
const FormFieldMock = assumeMock(FormField)

jest.mock('pages/integrations/integration/components/voice/VoiceMessageField')

const VoiceMessageFieldMock = assumeMock(VoiceMessageField)

const watchMock = jest.fn()
const mockUseFormContextReturnValue = {
    watch: watchMock,
    formState: { defaultValues: {} },
} as unknown as ReturnType<typeof useFormContext>

jest.mock('react-hook-form')
const useFormContextMock = assumeMock(useFormContext)

describe('<VoiceIntegrationPreferencesCallRecordings />', () => {
    beforeEach(() => {
        mockFlags({
            [FeatureFlagKey.CustomRecordingNotification]: true,
        })
        VoiceMessageFieldMock.mockReturnValue(<div>VoiceMessageField</div>)
        watchMock.mockReturnValue([false, false] as [boolean, boolean])
        useFormContextMock.mockReturnValue(mockUseFormContextReturnValue)
        FormFieldMock.mockImplementation(({ label, children }: any) => (
            <div>{label ?? children}</div>
        ))
    })

    const renderComponent = (): RenderResult => {
        return render(<VoiceIntegrationPreferencesCallRecordings />)
    }

    it('should render call recording preferences', () => {
        watchMock.mockReturnValue([true, true] as [boolean, boolean])

        const { getByText, getAllByText } = renderComponent()

        expect(getByText('Call Recording')).toBeInTheDocument()
        expect(
            getByText('Automatically record and store all customer calls.'),
        ).toBeInTheDocument()
        expect(getByText('Inbound calls')).toBeInTheDocument()
        expect(getByText('Outbound calls')).toBeInTheDocument()

        const callToggles = getAllByText('Start recording automatically')
        expect(callToggles).toHaveLength(2)
    })

    describe('recording notification settings', () => {
        it('should not render recording notification settings when FF is off', () => {
            mockFlags({
                [FeatureFlagKey.CustomRecordingNotification]: false,
            })

            const { queryByText } = renderComponent()

            expect(
                queryByText('Call recording notifications'),
            ).not.toBeInTheDocument()
            expect(queryByText('VoiceMessageField')).not.toBeInTheDocument()
        })

        it('should render recording notification settings', () => {
            const { getByText } = renderComponent()

            expect(
                getByText('Call recording notifications'),
            ).toBeInTheDocument()
        })

        it('should disable recording notification settings when both call recording settings are disabled', () => {
            const { getByText } = renderComponent()

            expect(
                getByText('Call recording notifications'),
            ).toBeInTheDocument()
            expect(FormFieldMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    name: 'meta.recording_notification',
                    isDisabled: true,
                }),
                {},
            )
        })
    })

    describe('validation', () => {
        describe('recording notification validation', () => {
            const getValidateObj = () => {
                const recordingNotificationFormFieldCall =
                    FormFieldMock.mock.calls.find(
                        (call) =>
                            call[0].name === 'meta.recording_notification',
                    )

                return (
                    recordingNotificationFormFieldCall?.[0]?.validation as {
                        validate: Record<
                            'textToSpeech' | 'voiceRecording',
                            (value: any) => string | undefined
                        >
                    }
                )?.validate
            }

            it('should consider recording notification settings as valid when recording is disabled', () => {
                renderComponent()

                const validate = getValidateObj()

                expect(validate.textToSpeech('')).toBeUndefined()
                expect(validate.voiceRecording('')).toBeUndefined()
            })

            it('should consider recording notification settings as invalid when content is missing', () => {
                watchMock.mockReturnValue([false, true] as [boolean, boolean])
                renderComponent()
                const validate = getValidateObj()

                expect(
                    validate.textToSpeech({
                        voice_message_type: VoiceMessageType.TextToSpeech,
                    }),
                ).toBe('Text to speech content is required')
            })

            it('should consider recording notification settings as invalid when voice recording is missing', () => {
                watchMock.mockReturnValue([false, true] as [boolean, boolean])
                renderComponent()
                const validate = getValidateObj()

                expect(
                    validate.voiceRecording({
                        voice_message_type: VoiceMessageType.VoiceRecording,
                    }),
                ).toBe('Voice recording is required')
            })
        })
    })
})
