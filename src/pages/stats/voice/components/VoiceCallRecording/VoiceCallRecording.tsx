import React, {useState} from 'react'
import {replaceAttachmentURL} from 'utils'
import IconButton from 'pages/common/components/button/IconButton'
import Modal from 'pages/common/components/modal/Modal'
import {VoiceCallSummary} from 'pages/stats/voice/models/types'
import {useDownloadRecording} from 'pages/tickets/detail/components/PhoneEvent/DownloadableDeletableRecording'

import css from './VoiceCallRecording.less'

type Props = {
    voiceCall: VoiceCallSummary
}

const getRecordingData = (voiceCall: VoiceCallSummary) => {
    if (voiceCall) {
        if (voiceCall.callRecordingUrl) {
            return {
                recordingUrl: replaceAttachmentURL(voiceCall.callRecordingUrl),
                isAvailable: voiceCall.callRecordingAvailable,
            }
        }
        if (voiceCall.voicemailUrl) {
            return {
                recordingUrl: replaceAttachmentURL(voiceCall.voicemailUrl),
                isAvailable: voiceCall.voicemailAvailable,
            }
        }
    }
    return {
        recordingUrl: '',
        isAvailable: false,
    }
}

const VoiceCallRecording = ({voiceCall}: Props) => {
    const {recordingUrl, isAvailable} = getRecordingData(voiceCall)
    const [isOpen, setOpen] = useState(false)
    const {downloadRecording, isRequestPending} =
        useDownloadRecording(recordingUrl)

    const togglePopover = () => {
        setOpen((isOpen) => !isOpen)
    }

    if (!recordingUrl || !isAvailable) {
        return <span>-</span>
    }

    return (
        <>
            <div className={css.recordingButtons}>
                <IconButton
                    className={css.recordingButton}
                    intent={'secondary'}
                    onClick={togglePopover}
                >
                    play_arrow
                </IconButton>
                <IconButton
                    className={css.recordingButton}
                    intent="secondary"
                    fillStyle="ghost"
                    onClick={downloadRecording}
                    disabled={isRequestPending}
                >
                    download
                </IconButton>
            </div>

            {isOpen && <div className={css.backdrop} />}
            <Modal
                isOpen={isOpen}
                onClose={togglePopover}
                classNameContent={css.modal}
            >
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <audio
                    controls
                    src={recordingUrl}
                    className={css['recording-player']}
                    data-testid="audio-player"
                    autoPlay
                />
            </Modal>
        </>
    )
}

export default VoiceCallRecording
