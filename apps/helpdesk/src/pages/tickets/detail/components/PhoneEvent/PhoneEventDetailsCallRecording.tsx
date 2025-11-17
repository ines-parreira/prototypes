import type { Map } from 'immutable'

import { formatDuration } from 'domains/reporting/pages/common/utils'

import DownloadableDeletableRecording from './DownloadableDeletableRecording'

type OwnProps = {
    eventData: Map<string, any>
    customerName: string
    phoneNumber?: string
}

export default function PhoneEventDetailsCallRecording({
    eventData,
    customerName,
    phoneNumber,
}: OwnProps): JSX.Element {
    const callRecordingDuration = formatDuration(
        eventData.getIn(['recording', 'original', 'duration'], 0),
    )

    const callRecording = eventData.get('recording') as Map<string, any>
    const deletedBy = eventData.get('deleted_by') as string
    const callRecordingURL = callRecording
        ? callRecording.getIn(['file', 'url'])
        : null
    const publicURL = callRecording
        ? callRecording.getIn(['file', 'public'], true)
        : true

    const integrationID = eventData.getIn(['integration', 'id']) as string
    const callSid = eventData.getIn([
        'recording',
        'original',
        'call_sid',
    ]) as string
    const recordingSid = eventData.getIn([
        'recording',
        'original',
        'sid',
    ]) as string
    const deleteRecordingURL = `/api/integrations/${integrationID}/calls/${callSid}/recordings/${recordingSid}`

    return (
        <>
            {!deletedBy && callRecordingURL && (
                <>
                    <div>
                        <b>{customerName ? customerName : 'Phone number'}:</b>{' '}
                        {phoneNumber}
                    </div>
                    <div>
                        <b>Duration:</b> {callRecordingDuration}
                    </div>
                    <div className="d-flex flex-column">
                        <div className="mb-3">
                            <b>Recording:</b>
                        </div>
                        {publicURL ? (
                            <DownloadableDeletableRecording
                                downloadRecordingURL={callRecordingURL}
                                deleteRecordingURL={deleteRecordingURL}
                            />
                        ) : (
                            <span className="ml-2">
                                <span className="material-icons mr-1">
                                    warning
                                </span>
                                The call recording is not available.
                            </span>
                        )}
                    </div>
                </>
            )}
            {deletedBy && (
                <div>
                    Call recording manually deleted by <b>{deletedBy}</b>
                </div>
            )}
        </>
    )
}
