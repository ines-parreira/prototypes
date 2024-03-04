import React, {useEffect, useState} from 'react'

import classNames from 'classnames'
import {PhoneIntegrationPreferences} from 'models/integration/types'
import settingsCss from 'pages/settings/settings.less'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'

import useVoiceMessageValidation from './hooks/useVoiceMessageValidation'
import VoiceRecordingInput from './VoiceRecordingInput'
import css from './VoiceIntegrationPreferences.less'

type Props = {
    preferences: PhoneIntegrationPreferences
    onPreferencesChange: (
        preferences: Partial<PhoneIntegrationPreferences>
    ) => void
}

enum HoldMusicSource {
    Default = 'default',
    Custom = 'custom',
}

export default function VoiceIntegrationPreferencesHoldMusic({
    preferences,
    onPreferencesChange,
}: Props): JSX.Element {
    const [holdMusicSource, setHoldMusicSource] = useState(
        preferences.custom_hold_music
            ? HoldMusicSource.Custom
            : HoldMusicSource.Default
    )
    const [selectedHoldMusicUrl, setSelectedHoldMusicUrl] = useState<
        string | undefined | null
    >(preferences.custom_hold_music?.voice_recording_file_path)

    const {validateVoiceRecordingUpload} = useVoiceMessageValidation()

    useEffect(() => {
        setHoldMusicSource(
            preferences.custom_hold_music?.voice_recording_file_path
                ? HoldMusicSource.Custom
                : HoldMusicSource.Default
        )
        setSelectedHoldMusicUrl(
            preferences.custom_hold_music?.voice_recording_file_path
        )
    }, [preferences.custom_hold_music?.voice_recording_file_path])

    const handleRecordingUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const voiceRecordingUpload = await validateVoiceRecordingUpload(event)

        if (voiceRecordingUpload) {
            const {url, newVoiceFields} = voiceRecordingUpload
            setSelectedHoldMusicUrl(url)
            onPreferencesChange({
                custom_hold_music: {
                    ...newVoiceFields,
                    voice_recording_file_path:
                        preferences.custom_hold_music
                            ?.voice_recording_file_path,
                },
            })
        }
    }

    return (
        <>
            <h2
                className={classNames(
                    settingsCss.headingSection,
                    css.sectionHeader
                )}
            >
                Hold music
            </h2>
            <div>
                <RadioFieldSet
                    options={[
                        {
                            value: HoldMusicSource.Default,
                            label: 'Default',
                        },
                        {
                            value: HoldMusicSource.Custom,
                            label: 'Insert recording',
                            caption: 'Max 2MB, mp3 only',
                        },
                    ]}
                    selectedValue={holdMusicSource}
                    onChange={(value) => {
                        setHoldMusicSource(value as HoldMusicSource)

                        if (value === HoldMusicSource.Default) {
                            onPreferencesChange({
                                custom_hold_music: null,
                            })
                            setSelectedHoldMusicUrl(null)
                        }
                    }}
                />

                {holdMusicSource === HoldMusicSource.Custom && (
                    <VoiceRecordingInput
                        voiceRecordingPath={selectedHoldMusicUrl}
                        onVoiceRecordingUpload={handleRecordingUpload}
                        className={css.recordingInput}
                    />
                )}
            </div>
        </>
    )
}
