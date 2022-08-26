import React from 'react'
import {fromJS, Map} from 'immutable'
import parsePhoneNumber from 'libphonenumber-js'

import moment from 'moment'

import {PhoneIntegrationEvent} from '../../../../../constants/integrations/types/event'

import {VoiceMessageType} from '../../../../../models/integration/constants'
import css from './PhoneEventDetails.less'
import PhoneEventDetailsVoicemail from './PhoneEventDetailsVoicemail'
import PhoneEventDetailsCallRecording from './PhoneEventDetailsCallRecording'

type PhoneEventDetailsProps = {
    event: Map<string, any>
}

export default function PhoneEventDetails({
    event,
}: PhoneEventDetailsProps): JSX.Element {
    const getDuration = (durationInSeconds: string | number): string => {
        const duration = moment.duration(Number(durationInSeconds), 'seconds')
        const minutes = duration.minutes()
        const seconds = duration.seconds()

        return `${minutes}min ${seconds}s`
    }
    const eventType = event.get('type')
    const eventData = event.get('data', fromJS({})) as Map<string, any>
    const formattedCustomerPhoneNumber = parsePhoneNumber(
        eventData.getIn(['customer', 'phone_number'], '')
    )?.formatInternational()
    const customerName = eventData.getIn(['customer', 'name'])

    let content: JSX.Element

    switch (eventType) {
        case PhoneIntegrationEvent.VoicemailRecording: {
            content = (
                <PhoneEventDetailsVoicemail
                    eventData={eventData}
                    customerName={customerName}
                    phoneNumber={formattedCustomerPhoneNumber}
                />
            )
            break
        }
        case PhoneIntegrationEvent.CompletedPhoneCall: {
            const callDuration = getDuration(
                eventData.getIn(['call', 'call_duration'], 0)
            )

            content = (
                <>
                    <div>
                        <b>{customerName ? customerName : 'Phone number'}:</b>{' '}
                        {formattedCustomerPhoneNumber}
                    </div>
                    <div>
                        <b>Duration:</b> {callDuration}
                    </div>
                </>
            )
            break
        }
        case PhoneIntegrationEvent.PhoneCallForwardedToExternalNumber:
        case PhoneIntegrationEvent.PhoneCallForwardedToGorgiasNumber: {
            const forwardCallPhoneNumber = eventData.getIn([
                'call',
                'selected_menu_option',
                'forward_call',
                'phone_number',
            ])

            const formattedForwardCallPhoneNumber = forwardCallPhoneNumber
                ? parsePhoneNumber(
                      forwardCallPhoneNumber
                  )?.formatInternational()
                : null

            content = (
                <div>
                    <b>Forwarded to:</b> {formattedForwardCallPhoneNumber}
                </div>
            )
            break
        }
        case PhoneIntegrationEvent.MessagePlayed: {
            const voiceMessageType = eventData.getIn([
                'call',
                'selected_menu_option',
                'voice_message',
                'voice_message_type',
            ])
            const MessagePlayedPath =
                voiceMessageType === VoiceMessageType.VoiceRecording
                    ? [
                          'call',
                          'selected_menu_option',
                          'voice_message',
                          'new_voice_recording_file_name',
                      ]
                    : [
                          'call',
                          'selected_menu_option',
                          'voice_message',
                          'text_to_speech_content',
                      ]
            const textToSpeechContent = eventData.getIn(MessagePlayedPath)

            content = (
                <div>
                    <b>
                        {voiceMessageType === VoiceMessageType.VoiceRecording
                            ? 'Audio recording'
                            : 'Text'}
                        :
                    </b>{' '}
                    {textToSpeechContent}
                </div>
            )
            break
        }
        case PhoneIntegrationEvent.CallRecording: {
            content = (
                <PhoneEventDetailsCallRecording
                    eventData={eventData}
                    customerName={customerName}
                    phoneNumber={formattedCustomerPhoneNumber}
                />
            )
            break
        }
        default: {
            const formattedForwardedPhoneNumber = parsePhoneNumber(
                eventData.get('forwarded_to', '')
            )?.formatInternational()
            content = (
                <>
                    <div>
                        <b>{customerName ? customerName : 'Phone number'}:</b>{' '}
                        {formattedCustomerPhoneNumber}
                    </div>
                    {formattedForwardedPhoneNumber && (
                        <div>
                            <b>Forwarded to: </b>{' '}
                            {formattedForwardedPhoneNumber}
                        </div>
                    )}
                </>
            )
        }
    }

    return (
        <div className={css.eventDetails}>
            <div className={css.content}>{content}</div>
        </div>
    )
}
