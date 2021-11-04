import React from 'react'
import {Map} from 'immutable'

import {formatDuration} from '../../../../stats/common/utils'

import DownloadableDeletableRecording from './DownloadableDeletableRecording'

type OwnProps = {
    eventData: Map<string, any>
    customerName: string
    phoneNumber?: string
}

export default function PhoneEventDetailsVoicemail({
    eventData,
    customerName,
    phoneNumber,
}: OwnProps): JSX.Element {
    const recordingDuration = formatDuration(
        eventData.getIn(['call', 'recording_duration'], 0)
    )
    const recordingURL = eventData.getIn(['call', 'recording_url']) as string
    const fullRecordingURL = recordingURL ? `${recordingURL}.mp3` : null
    const deletedBy = eventData.get('deleted_by') as string

    const integrationID = eventData.getIn(['integration', 'id']) as string
    const callSid = eventData.getIn(['call', 'call_sid']) as string
    const recordingSid = eventData.getIn(['call', 'recording_sid']) as string
    const deleteRecordingURL = `/api/integrations/${integrationID}/calls/${callSid}/voicemail-recordings/${recordingSid}`

    return (
        <>
            {!deletedBy && fullRecordingURL && (
                <>
                    <div>
                        <b>{customerName ? customerName : 'Phone number'}:</b>{' '}
                        {phoneNumber}
                    </div>
                    <div>
                        <b>Duration:</b> {recordingDuration}
                    </div>
                    <div className="d-flex flex-column">
                        <div className="mb-3">
                            <b>Voicemail:</b>
                        </div>
                        <DownloadableDeletableRecording
                            downloadRecordingURL={fullRecordingURL}
                            deleteRecordingURL={deleteRecordingURL}
                        />
                    </div>
                </>
            )}
            {deletedBy && (
                <div>
                    Voicemail recording manually deleted by <b>{deletedBy}</b>
                </div>
            )}
        </>
    )
}
