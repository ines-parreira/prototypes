import React, { useCallback, useEffect, useState } from 'react'

import { WaitMusicType } from '@gorgias/api-queries'

import { MAX_WAIT_MUSIC_CUSTOM_RECORDING_FILE_SIZE_MB } from 'models/integration/constants'
import { LocalWaitMusicPreferences } from 'models/integration/types'
import { PhoneCountry } from 'models/phoneNumber/types'
import RadioButton from 'pages/common/components/RadioButton'

import useVoiceMessageValidation from './hooks/useVoiceMessageValidation'
import VoiceRecordingInput from './VoiceRecordingInput'
import WaitMusicLibrarySelect from './WaitMusicLibrarySelect'

import css from './WaitMusicField.less'

type Props = {
    preferences: LocalWaitMusicPreferences
    onChange: (value: LocalWaitMusicPreferences) => void
    integrationCountry: PhoneCountry
}

const WaitMusicField = ({
    preferences,
    onChange,
    integrationCountry,
}: Props) => {
    const { validateVoiceRecordingUpload } = useVoiceMessageValidation()
    const [customRecordingPath, setCustomRecordingPath] = useState<
        string | undefined
    >()

    useEffect(() => {
        if (
            !customRecordingPath &&
            preferences?.type === WaitMusicType.CustomRecording &&
            preferences?.custom_recording?.audio_file_path
        ) {
            setCustomRecordingPath(
                preferences?.custom_recording?.audio_file_path,
            )
        }
    }, [preferences, customRecordingPath, setCustomRecordingPath])

    const handleCustomRecordingUpload = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const voiceRecordingUpload = await validateVoiceRecordingUpload(
                event,
                undefined,
                MAX_WAIT_MUSIC_CUSTOM_RECORDING_FILE_SIZE_MB,
                true,
            )
            if (voiceRecordingUpload) {
                const { url, newVoiceFields } = voiceRecordingUpload
                setCustomRecordingPath(url)

                const newValue: LocalWaitMusicPreferences = {
                    ...preferences,
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
        },
        [preferences, onChange, validateVoiceRecordingUpload],
    )

    return (
        <>
            <div className={css.horizontalRadioButtons}>
                <WaitMusicRadioButton
                    waitMusicType={WaitMusicType.Library}
                    selectedWaitMusicType={preferences.type}
                    label="Choose from library"
                    onChange={(waitMusicType) => {
                        onChange({ ...preferences, type: waitMusicType })
                    }}
                />
                <WaitMusicRadioButton
                    waitMusicType={WaitMusicType.CustomRecording}
                    selectedWaitMusicType={preferences.type}
                    label="Custom recording"
                    onChange={(waitMusicType) => {
                        onChange({ ...preferences, type: waitMusicType })
                    }}
                />
            </div>
            {preferences.type === WaitMusicType.CustomRecording && (
                <VoiceRecordingInput
                    voiceRecordingPath={customRecordingPath}
                    onVoiceRecordingUpload={handleCustomRecordingUpload}
                    className={css.optionContentHorizontal}
                    replaceLabel={'Replace File'}
                    uploadLabel={'Upload File'}
                    maxSizeInMB={MAX_WAIT_MUSIC_CUSTOM_RECORDING_FILE_SIZE_MB}
                />
            )}
            {preferences.type === WaitMusicType.Library && (
                <WaitMusicLibrarySelect
                    library={preferences.library}
                    onChange={(selectedLibrary) =>
                        onChange({
                            ...preferences,
                            type: WaitMusicType.Library,
                            library: selectedLibrary,
                        })
                    }
                    integrationCountry={integrationCountry}
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
