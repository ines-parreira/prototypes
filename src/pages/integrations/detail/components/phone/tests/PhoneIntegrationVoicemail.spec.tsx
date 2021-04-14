import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import {
    PhoneIntegrationVoicemail,
    VoiceMailType,
} from '../PhoneIntegrationVoicemail'

describe('<PhoneIntegrationVoicemail/>', () => {
    let updatePhoneVoicemailConfiguration: jest.MockedFunction<(
        formData: FormData
    ) => Promise<unknown>>
    let integration: Map<string, any>
    const notify = jest.fn()

    beforeEach(() => {
        updatePhoneVoicemailConfiguration = jest.fn()

        integration = fromJS({
            id: 1,
            name: 'Fake phone integration',
            meta: {
                emoji: '🍏',
                twilio: {
                    incoming_phone_number: {
                        friendly_name: '(415) 111-2222',
                    },
                },
                voicemail: {
                    voice_recording_file_path: null,
                    voicemail_type: VoiceMailType.TextToSpeech,
                    text_to_speech_content: 'Hello world!',
                    allow_to_leave_voicemail: true,
                },
            },
        })
    })

    describe('render()', () => {
        function getFormData(payload: Map<string, string | Blob>): FormData {
            const formData = new FormData()
            payload.forEach((value, key) => {
                formData.append(key as string, value as string | Blob)
            })
            return formData
        }

        it('should render with default values', () => {
            const {container} = render(
                <PhoneIntegrationVoicemail
                    integration={integration}
                    updatePhoneVoicemailConfiguration={
                        updatePhoneVoicemailConfiguration
                    }
                    notify={notify}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render with TTS type', () => {
            const newText = 'Updated text.'
            const {container, getByText} = render(
                <PhoneIntegrationVoicemail
                    integration={integration}
                    updatePhoneVoicemailConfiguration={
                        updatePhoneVoicemailConfiguration
                    }
                    notify={notify}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
            const input = getByText(
                integration.getIn([
                    'meta',
                    'voicemail',
                    'text_to_speech_content',
                ])
            )
            fireEvent.change(input, {target: {value: newText}})
            getByText('Save changes').click()

            expect(updatePhoneVoicemailConfiguration).toHaveBeenCalledWith(
                getFormData(
                    fromJS({
                        voicemail_type: VoiceMailType.TextToSpeech,
                        allow_to_leave_voicemail: true,
                        text_to_speech_content: newText,
                    })
                )
            )
        })

        it('should render with voice recording type', () => {
            const expectedCall = {
                voicemail_type: VoiceMailType.VoiceRecording,
                allow_to_leave_voicemail: true,
            }

            integration = integration.setIn(
                ['meta', 'voicemail'],
                fromJS({
                    text_to_speech_content: null,
                    voice_recording_file_path: 'test_file.mp3',
                    ...expectedCall,
                })
            )
            const {container, getByText} = render(
                <PhoneIntegrationVoicemail
                    integration={integration}
                    updatePhoneVoicemailConfiguration={
                        updatePhoneVoicemailConfiguration
                    }
                    notify={notify}
                />
            )

            expect(container.firstChild).toMatchSnapshot()
            getByText('Save changes').click()
            expect(updatePhoneVoicemailConfiguration).toHaveBeenCalledWith(
                getFormData(fromJS(expectedCall))
            )
        })
    })
})
