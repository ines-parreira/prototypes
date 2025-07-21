import React, { useState } from 'react'

import css from 'domains/reporting/pages/voice/components/VoiceCallRecording/VoiceCallRecording.less'
import { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import IconButton from 'pages/common/components/button/IconButton'
import Modal from 'pages/common/components/modal/Modal'
import { useDownloadRecording } from 'pages/tickets/detail/components/PhoneEvent/DownloadableDeletableRecording'
import { replaceAttachmentURL } from 'utils'

type Props = {
    voiceCall: VoiceCallSummary
    isDownloadable?: boolean
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

const VoiceCallRecording = ({ voiceCall, isDownloadable = true }: Props) => {
    const { recordingUrl, isAvailable } = getRecordingData(voiceCall)
    const [isOpen, setOpen] = useState(false)
    const { downloadRecording, isRequestPending } =
        useDownloadRecording(recordingUrl)

    const togglePopover = () => {
        setOpen((isOpen) => !isOpen)
    }

    const handlePlayRecordingClick = (event: React.MouseEvent) => {
        event.stopPropagation()
        togglePopover()
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
                    onClick={handlePlayRecordingClick}
                >
                    play_arrow
                </IconButton>
                {isDownloadable && (
                    <IconButton
                        className={css.recordingButton}
                        intent="secondary"
                        fillStyle="ghost"
                        onClick={downloadRecording}
                        isDisabled={isRequestPending}
                    >
                        download
                    </IconButton>
                )}
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
