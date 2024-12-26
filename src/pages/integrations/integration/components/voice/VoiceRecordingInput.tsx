import classnames from 'classnames'
import React from 'react'

import Button from 'pages/common/components/button/Button'
import Caption from 'pages/common/forms/Caption/Caption'
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
    maxSizeInMB?: number
    isDisabled?: boolean
}

export default function VoiceRecordingInput({
    voiceRecordingPath,
    onVoiceRecordingUpload,
    uploadLabel = 'Select file',
    replaceLabel = 'Select file',
    className = css.optionContent,
    maxSizeInMB,
    isDisabled = false,
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
                    disabled={isDisabled}
                />
                <Button
                    intent="secondary"
                    onClick={handleUploadButtonClick}
                    className={classnames({
                        [css.replaceFileButton]: !!voiceRecordingPath,
                    })}
                    leadingIcon="backup"
                    isDisabled={isDisabled}
                >
                    {voiceRecordingPath ? replaceLabel : uploadLabel}
                </Button>
                <Caption className={css.caption}>
                    Supported file: .mp3{' '}
                    {maxSizeInMB && ` (Max ${maxSizeInMB}MB)`}
                </Caption>
            </div>
        </div>
    )
}
