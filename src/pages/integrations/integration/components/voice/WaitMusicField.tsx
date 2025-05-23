import React, { useCallback, useEffect, useState } from 'react'

import _get from 'lodash/get'

import {
    useUploadCustomVoiceRecording,
    WaitMusicType,
} from '@gorgias/helpdesk-queries'
import { CustomRecordingType } from '@gorgias/helpdesk-types'

import { useNotify } from 'hooks/useNotify'
import { GorgiasApiResponseDataError } from 'models/api/types'
import { MAX_WAIT_MUSIC_CUSTOM_RECORDING_FILE_SIZE_MB } from 'models/integration/constants'
import { LocalWaitMusicPreferences } from 'models/integration/types'
import RadioButton from 'pages/common/components/RadioButton'

import useVoiceMessageValidation from './hooks/useVoiceMessageValidation'
import VoiceRecordingInput from './VoiceRecordingInput'
import WaitMusicLibrarySelect from './WaitMusicLibrarySelect'

import css from './WaitMusicField.less'

type Props = {
    value: LocalWaitMusicPreferences
    shouldUpload?: boolean
    onChange: (value: LocalWaitMusicPreferences) => void
}

const WaitMusicField = ({ value, onChange, shouldUpload = false }: Props) => {
    const { validateVoiceRecordingUpload } = useVoiceMessageValidation()
    const [customRecordingPath, setCustomRecordingPath] = useState<
        string | undefined
    >()
    const notify = useNotify()

    const { mutate: uploadFile, isLoading } = useUploadCustomVoiceRecording({
        mutation: {
            onSuccess: (response) => {
                const newValue: LocalWaitMusicPreferences = {
                    ...value,
                    type: WaitMusicType.CustomRecording,
                    custom_recording: {
                        audio_file_path: response.data.url,
                        audio_file_name: response.data.name,
                        audio_file_type: response.data.content_type,
                    },
                }
                setCustomRecordingPath(response.data.url)
                onChange(newValue)
            },
            onError: (err) => {
                const error = _get(err, 'response.data.error', '') as
                    | GorgiasApiResponseDataError
                    | undefined
                notify.error(error?.msg || 'Failed to upload custom recording')
            },
        },
    })

    useEffect(() => {
        if (
            !customRecordingPath &&
            value?.type === WaitMusicType.CustomRecording &&
            value?.custom_recording?.audio_file_path
        ) {
            setCustomRecordingPath(value?.custom_recording?.audio_file_path)
        }
    }, [value, customRecordingPath, setCustomRecordingPath])

    const handleCustomRecordingUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const voiceRecordingUpload = await validateVoiceRecordingUpload(
                event,
                undefined,
                MAX_WAIT_MUSIC_CUSTOM_RECORDING_FILE_SIZE_MB,
                true,
            )
            if (voiceRecordingUpload) {
                if (
                    shouldUpload &&
                    value.type === WaitMusicType.CustomRecording
                ) {
                    const { uploadedFile } = voiceRecordingUpload
                    const params = {
                        type: CustomRecordingType.WaitMusic,
                        ...(value.custom_recording?.audio_file_path
                            ? {
                                  replaces:
                                      value.custom_recording.audio_file_path,
                              }
                            : {}),
                    }
                    uploadFile({ data: { file: uploadedFile }, params })
                } else {
                    const { url, newVoiceFields } = voiceRecordingUpload
                    setCustomRecordingPath(url)

                    const newValue: LocalWaitMusicPreferences = {
                        ...value,
                        custom_recording: {
                            audio_file: newVoiceFields.new_voice_recording_file,
                            audio_file_name:
                                newVoiceFields.new_voice_recording_file_name,
                            audio_file_type:
                                newVoiceFields.new_voice_recording_file_type,
                        },
                    }
                    onChange(newValue)
                }
            }
        },
        [
            value,
            onChange,
            validateVoiceRecordingUpload,
            shouldUpload,
            uploadFile,
        ],
    )

    return (
        <>
            <div className={css.horizontalRadioButtons}>
                <WaitMusicRadioButton
                    waitMusicType={WaitMusicType.Library}
                    selectedWaitMusicType={value.type}
                    label="Choose from library"
                    onChange={(waitMusicType) => {
                        onChange({
                            ...value,
                            type: waitMusicType,
                        })
                    }}
                />
                <WaitMusicRadioButton
                    waitMusicType={WaitMusicType.CustomRecording}
                    selectedWaitMusicType={value.type}
                    label="Custom recording"
                    onChange={(waitMusicType) => {
                        onChange({ ...value, type: waitMusicType })
                    }}
                />
            </div>
            {value.type === WaitMusicType.CustomRecording && (
                <VoiceRecordingInput
                    voiceRecordingPath={customRecordingPath}
                    onVoiceRecordingUpload={handleCustomRecordingUpload}
                    className={css.optionContentHorizontal}
                    replaceLabel={'Replace File'}
                    uploadLabel={'Upload File'}
                    maxSizeInMB={MAX_WAIT_MUSIC_CUSTOM_RECORDING_FILE_SIZE_MB}
                    isLoading={isLoading}
                />
            )}
            {value.type === WaitMusicType.Library && (
                <WaitMusicLibrarySelect
                    library={value.library}
                    onChange={(selectedLibrary) =>
                        onChange({
                            ...value,
                            type: WaitMusicType.Library,
                            library: selectedLibrary,
                        })
                    }
                />
            )}
        </>
    )
}

type WaitMusicRadioButtonProps = {
    waitMusicType: WaitMusicType
    selectedWaitMusicType: WaitMusicType
    onChange: (value: WaitMusicType) => void
    label: string
    caption?: string
    id?: string
}

const WaitMusicRadioButton = ({
    waitMusicType,
    selectedWaitMusicType,
    onChange,
    label,
    caption,
    id = '',
}: WaitMusicRadioButtonProps) => {
    return (
        <RadioButton
            className={css.radioButtonOption}
            label={label}
            caption={caption}
            value={waitMusicType}
            isSelected={selectedWaitMusicType === waitMusicType}
            onChange={(__value) => onChange(waitMusicType)}
            id={`${id}${waitMusicType}`}
        />
    )
}

export default WaitMusicField
