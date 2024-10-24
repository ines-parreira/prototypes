import {Map} from 'immutable'
import React from 'react'

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
    const twilioRecordingURL = eventData.getIn([
        'call',
        'recording_url',
    ]) as string
    const gorgiasRecordingURL = eventData.getIn([
        'call',
        'gorgias_recording_url',
    ]) as string
    const fullRecordingURL = gorgiasRecordingURL
        ? gorgiasRecordingURL
        : twilioRecordingURL
          ? `${twilioRecordingURL}.mp3`
          : null
    const publicURL = eventData.getIn(['recording', 'file', 'public'], true)
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
                        {publicURL ? (
                            <DownloadableDeletableRecording
                                downloadRecordingURL={fullRecordingURL}
                                deleteRecordingURL={deleteRecordingURL}
                            />
                        ) : (
                            <span className="ml-2">
                                <span className="material-icons mr-1">
                                    warning
                                </span>
                                The voicemail recording is not available.
                            </span>
                        )}
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
