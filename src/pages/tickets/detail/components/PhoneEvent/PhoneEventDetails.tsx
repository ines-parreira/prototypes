import React from 'react'
import {fromJS, Map} from 'immutable'
import parsePhoneNumber from 'libphonenumber-js'

import moment from 'moment'

import {PhoneIntegrationEvent} from '../../../../../constants/integrations/types/event'

import css from './PhoneEventDetails.less'

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
            const recordingDuration = getDuration(
                eventData.getIn(['call', 'recording_duration'], 0)
            )
            const recordingUrl = eventData.getIn(['call', 'recording_url'])

            content = (
                <>
                    <div>
                        <b>{customerName ? customerName : 'Phone number'}:</b>{' '}
                        {formattedCustomerPhoneNumber}
                    </div>
                    <div>
                        <b>Duration:</b> {recordingDuration}
                    </div>
                    <div className="d-flex flex-column">
                        <div className="mb-3">
                            <b>Voicemail:</b>
                        </div>
                        <div>
                            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                            <audio controls src={recordingUrl} />
                        </div>
                    </div>
                </>
            )
            break
        }
        case PhoneIntegrationEvent.CompletedPhoneCall: {
            const callDuration = getDuration(
                eventData.getIn(['call', 'call_duration'], 0)
            )

            const callRecording = eventData.get('recording') as Map<string, any>
            const callRecordingPath = callRecording
                ? callRecording.getIn(['file', 'url'])
                : null
            const callRecordingMessage = callRecordingPath
                ? callRecording.get('message')
                : null
            content = (
                <>
                    <div>
                        <b>{customerName ? customerName : 'Phone number'}:</b>{' '}
                        {formattedCustomerPhoneNumber}
                    </div>
                    <div>
                        <b>Duration:</b> {callDuration}
                    </div>

                    {callRecording && (
                        <div>
                            <b>Recording: </b>
                            {callRecordingMessage && (
                                <span>{callRecordingMessage}</span>
                            )}

                            {callRecordingPath && (
                                <>
                                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                                    <audio controls src={callRecordingPath} />
                                </>
                            )}
                        </div>
                    )}
                </>
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
