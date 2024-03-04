import React from 'react'
import classnames from 'classnames'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {replaceAttachmentURL} from 'utils'
import css from './VoiceMessageField.less'

type PropsVoiceRecordingInput = {
    voiceRecordingPath: Maybe<string>
    onVoiceRecordingUpload: (
        event: React.ChangeEvent<HTMLInputElement>
    ) => Promise<void>
    uploadLabel?: string
    replaceLabel?: string
    className?: string
}

export default function VoiceRecordingInput({
    voiceRecordingPath,
    onVoiceRecordingUpload,
    uploadLabel = 'Select file',
    replaceLabel = 'Select file',
    className = css.optionContent,
}: PropsVoiceRecordingInput) {
    const voiceRecordingFileInput = React.useRef<HTMLInputElement>(null)

    const handleUploadButtonClick = () => {
        voiceRecordingFileInput?.current?.click()
    }
    return (
        <div className={className}>
            {voiceRecordingPath && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio
                    controls
                    src={replaceAttachmentURL(voiceRecordingPath)}
                    aria-label={'voice-recording'}
                />
            )}

            <div>
                <input
                    className={'d-none'}
                    type="file"
                    accept=".mp3"
                    ref={voiceRecordingFileInput}
                    onChange={onVoiceRecordingUpload}
                />
                <Button
                    intent="secondary"
                    onClick={handleUploadButtonClick}
                    className={classnames({
                        [css.replaceFileButton]: !!voiceRecordingPath,
                    })}
                >
                    <ButtonIconLabel icon="backup">
                        {voiceRecordingPath ? replaceLabel : uploadLabel}
                    </ButtonIconLabel>
                </Button>
            </div>
        </div>
    )
}
