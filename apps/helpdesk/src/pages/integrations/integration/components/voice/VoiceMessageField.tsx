import type { ReactNode } from 'react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

import _get from 'lodash/get'
import { DropdownItem } from 'reactstrap'

import { Box, Label } from '@gorgias/axiom'
import { useUploadCustomVoiceRecording } from '@gorgias/helpdesk-queries'
import type {
    VoiceMessage as ApiVoiceMessage,
    CustomRecordingType,
    VoiceMessageType as VoiceMessageTypeType,
} from '@gorgias/helpdesk-types'
import { VoiceMessageType } from '@gorgias/helpdesk-types'

import useAppDispatch from 'hooks/useAppDispatch'
import type { GorgiasApiResponseDataError } from 'models/api/types'
import { MAX_VOICE_RECORDING_FILE_SIZE_MB } from 'models/integration/constants'
import type { VoiceMessage } from 'models/integration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import Caption from 'pages/common/forms/Caption/Caption'
import SelectInputBox from 'pages/common/forms/input/SelectInputBox'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import useVoiceMessageValidation from './hooks/useVoiceMessageValidation'
import TextToSpeechRecordingInput from './TextToSpeechRecordingInput'
import VoiceMessageTTSPreviewFields from './VoiceMessageTTS/VoiceMessageTTSPreviewFields'
import VoiceRecordingInput from './VoiceRecordingInput'

import css from './VoiceMessageField.less'

type Props = {
    value: VoiceMessage
    onChange: (value: VoiceMessage) => void
    allowNone?: boolean
    maxRecordingDuration?: number
    isDisabled?: boolean
    customRecordingType: CustomRecordingType
    label?: string
    name?: string
    caption?: ReactNode
    noneValueAlertBanner?: ReactNode
}

const LABELS = {
    [VoiceMessageType.None]: 'None',
    [VoiceMessageType.TextToSpeech]: 'Text-to-speech',
    [VoiceMessageType.VoiceRecording]: 'Custom recording',
}

const VoiceMessageField = ({
    name,
    value,
    onChange,
    allowNone,
    maxRecordingDuration,
    isDisabled = false,
    customRecordingType,
    label,
    caption,
    noneValueAlertBanner,
}: Props): JSX.Element => {
    const floatingRef = useRef<HTMLDivElement>(null)
    const targetRef = useRef<HTMLDivElement>(null)

    const dispatch = useAppDispatch()
    const { validateVoiceRecordingUpload } = useVoiceMessageValidation()
    const [voiceRecordingPath, setVoiceRecordingPath] = useState<
        string | undefined | null
    >()
    const [isDropdownOpened, setIsDropdownOpened] = useState(false)
    const options: VoiceMessageType[] = [
        VoiceMessageType.TextToSpeech,
        VoiceMessageType.VoiceRecording,
        ...(allowNone ? [VoiceMessageType.None] : []),
    ]

    useEffect(() => {
        if (
            !voiceRecordingPath &&
            value?.voice_message_type === VoiceMessageType.VoiceRecording &&
            value?.voice_recording_file_path
        ) {
            setVoiceRecordingPath(value?.voice_recording_file_path)
        }
    }, [value, voiceRecordingPath, setVoiceRecordingPath])

    const handleVoiceMessageTypeChange = (type: VoiceMessageTypeType) => {
        setIsDropdownOpened(false)
        onChange({
            text_to_speech_content: value.text_to_speech_content,
            voice_recording_file_path: value.voice_recording_file_path,
            voice_message_type: type,
        })
    }

    const { mutate: uploadFile, isLoading } = useUploadCustomVoiceRecording({
        mutation: {
            onSuccess: (response) => {
                const newValue: ApiVoiceMessage = {
                    voice_recording_file_path: response.data.url,
                    voice_message_type: VoiceMessageType.VoiceRecording,
                }
                setVoiceRecordingPath(newValue.voice_recording_file_path)
                onChange(newValue)
            },
            onError: (err) => {
                const error = _get(err, 'response.data.error', '') as
                    | GorgiasApiResponseDataError
                    | undefined
                void dispatch(
                    notify({
                        title:
                            error?.msg || 'Failed to upload custom recording',
                        status: NotificationStatus.Error,
                    }),
                )
            },
        },
    })

    const handleVoiceRecordingUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const voiceRecordingUpload = await validateVoiceRecordingUpload(
            event,
            maxRecordingDuration,
            MAX_VOICE_RECORDING_FILE_SIZE_MB,
            true,
        )
        if (voiceRecordingUpload) {
            const { uploadedFile } = voiceRecordingUpload
            const params = {
                type: customRecordingType,
            }
            uploadFile({ data: { file: uploadedFile }, params })
        }
    }

    return (
        <div>
            <div className={css.dropdownSelect}>
                <Box flexDirection="column">
                    {label && <Label>{label}</Label>}
                    {caption && (
                        <Caption className={css.complianceCaption}>
                            {caption}
                        </Caption>
                    )}
                </Box>
                <SelectInputBox
                    floating={floatingRef}
                    label={LABELS[value.voice_message_type]}
                    onToggle={setIsDropdownOpened}
                    onClick={() => {
                        setIsDropdownOpened((prev) => !prev)
                    }}
                    ref={targetRef}
                    aria-expanded={isDropdownOpened}
                    aria-controls="voice-message-type-selector"
                >
                    <Dropdown
                        id="voice-message-type-selector"
                        isOpen={isDropdownOpened}
                        onToggle={setIsDropdownOpened}
                        ref={floatingRef}
                        target={targetRef}
                        value={value.voice_message_type}
                    >
                        <DropdownBody>
                            {options.map((option) => (
                                <DropdownItem
                                    key={option}
                                    option={{
                                        label: LABELS[option],
                                        value: option,
                                    }}
                                    onClick={() => {
                                        handleVoiceMessageTypeChange(option)
                                    }}
                                    toggle={false}
                                >
                                    {LABELS[option]}
                                </DropdownItem>
                            ))}
                        </DropdownBody>
                    </Dropdown>
                </SelectInputBox>
            </div>
            {value.voice_message_type === VoiceMessageType.VoiceRecording && (
                <VoiceRecordingInput
                    voiceRecordingPath={voiceRecordingPath}
                    onVoiceRecordingUpload={handleVoiceRecordingUpload}
                    className={css.optionContentHorizontal}
                    replaceLabel={'Replace File'}
                    uploadLabel={'Upload File'}
                    maxSizeInMB={MAX_VOICE_RECORDING_FILE_SIZE_MB}
                    isDisabled={isDisabled}
                    isLoading={isLoading}
                />
            )}
            {value.voice_message_type === VoiceMessageType.TextToSpeech && (
                <>
                    <TextToSpeechRecordingInput
                        onChange={onChange}
                        selectedValue={value}
                        className={css.optionContentHorizontal}
                        isDisabled={isDisabled}
                        withLength={true}
                    />
                    {name && (
                        <VoiceMessageTTSPreviewFields
                            value={value}
                            onChange={onChange}
                            fieldName={name}
                        />
                    )}
                </>
            )}
            {value.voice_message_type === VoiceMessageType.None &&
                noneValueAlertBanner && (
                    <Box marginTop="sm">{noneValueAlertBanner}</Box>
                )}
        </div>
    )
}

export default VoiceMessageField
