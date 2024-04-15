import React, {useState} from 'react'
import Button from 'pages/common/components/button/Button'
import {Drawer} from 'pages/common/components/Drawer'
import IconButton from 'pages/common/components/button/IconButton'
import {
    DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE,
    DEFAULT_IVR_DEFLECTION_SMS_CONTENT,
    VoiceMessageType,
} from 'models/integration/constants'
import {
    IvrSmsDeflection,
    SmsIntegration,
    VoiceMessage,
} from 'models/integration/types'
import TextArea from 'pages/common/forms/TextArea'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import VoiceMessageField from './VoiceMessageField'
import css from './IvrMenuActionField.less'

type Props = {
    settings: IvrSmsDeflection
    onChange: (value: IvrSmsDeflection) => void
    isDrawerOpen: boolean
    setDrawerOpen: (value: boolean) => void
    smsIntegrations: SmsIntegration[]
}

const IvrMenuActionSendToSMSField = ({
    settings,
    onChange,
    setDrawerOpen,
    isDrawerOpen,
    smsIntegrations,
}: Props) => {
    const [smsConfirmationMessage, setSmsConfirmationMessage] =
        useState<VoiceMessage>(
            settings.confirmation_message ??
                DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE
        )
    const [smsSentToCallers, setSmsSentToCallers] = useState<string>(
        settings.sms_content ?? DEFAULT_IVR_DEFLECTION_SMS_CONTENT
    )
    const [smsIntegrationId, setSmsIntegrationId] = useState<number | null>(
        settings.sms_integration_id ?? smsIntegrations[0]?.id
    )

    const dispatch = useAppDispatch()

    const isSubmitDisabled = (): boolean => {
        if (smsSentToCallers.length === 0) {
            return true
        }

        if (
            smsConfirmationMessage.voice_message_type ===
            VoiceMessageType.TextToSpeech
        ) {
            if (!smsConfirmationMessage.text_to_speech_content) {
                return true
            }
            return smsConfirmationMessage.text_to_speech_content.length === 0
        }

        return false
    }

    const handleSubmit = () => {
        if (!smsIntegrationId) {
            void dispatch(
                notify({
                    message: `Cannot save. Please select an SMS integration.`,
                    status: NotificationStatus.Error,
                })
            )
            return
        }

        if (
            smsConfirmationMessage.voice_message_type ===
                VoiceMessageType.VoiceRecording &&
            !smsConfirmationMessage.voice_recording_file_path &&
            !smsConfirmationMessage.new_voice_recording_file
        ) {
            void dispatch(
                notify({
                    message: `Cannot save. Upload a recording to use it as your confirmation message.`,
                    status: NotificationStatus.Error,
                })
            )
            return
        }

        onChange({
            ...settings,
            confirmation_message: smsConfirmationMessage,
            sms_integration_id: smsIntegrationId,
            sms_content: smsSentToCallers,
        })
        setDrawerOpen(false)
    }

    return (
        <>
            <Button
                onClick={() => {
                    setDrawerOpen(true)
                }}
                intent="primary"
                fillStyle="ghost"
                className={css.linkBtn}
            >
                {settings.sms_integration_id ? (
                    <>
                        <i className="material-icons mr-2">edit</i>
                        Edit message
                    </>
                ) : (
                    <>
                        <i className="material-icons mr-2">add</i>
                        Add message
                    </>
                )}
            </Button>

            <Drawer
                name="deflect-to-sms"
                open={isDrawerOpen}
                fullscreen={false}
                isLoading={false}
                portalRootId="app-root"
                onBackdropClick={() => setDrawerOpen(false)}
            >
                <Drawer.Header>
                    <h3 className={css.drawerHeader}>Manage settings</h3>
                    <Drawer.HeaderActions>
                        <IconButton
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={() => setDrawerOpen(false)}
                        >
                            close
                        </IconButton>
                    </Drawer.HeaderActions>
                </Drawer.Header>

                <Drawer.Content className={css.drawerContent}>
                    <h5>Select SMS integration</h5>
                    <SelectField
                        value={smsIntegrationId}
                        onChange={(integration_id) => {
                            if (typeof integration_id === 'number') {
                                setSmsIntegrationId(integration_id)
                            }
                        }}
                        options={smsIntegrations.map((integration) => ({
                            value: integration.id,
                            label: integration.name,
                        }))}
                        fullWidth
                    />
                    <h5 className={css.headerWithDetails}>
                        SMS confirmation message
                    </h5>
                    <p>
                        This message will be played to callers once the SMS
                        option is selected
                    </p>
                    <VoiceMessageField
                        value={smsConfirmationMessage}
                        onChange={setSmsConfirmationMessage}
                        radioButtonId={'sms-confirmation-message'}
                    />
                    <h5 className={css.innerHeader}>
                        SMS Message sent to callers
                    </h5>
                    <TextArea
                        value={smsSentToCallers}
                        onChange={setSmsSentToCallers}
                        caption="This message will be sent to callers in a form of SMS once this IVR option is selected"
                        error={
                            smsSentToCallers.length === 0
                                ? 'This message will be sent to callers in a form of SMS once this IVR option is selected'
                                : ''
                        }
                    />
                </Drawer.Content>
                <Drawer.Footer>
                    <Button
                        onClick={handleSubmit}
                        intent="primary"
                        isDisabled={isSubmitDisabled()}
                    >
                        Save changes
                    </Button>
                    <Button
                        onClick={() => setDrawerOpen(false)}
                        className="ml-2"
                        intent="secondary"
                    >
                        Cancel
                    </Button>
                </Drawer.Footer>
            </Drawer>
        </>
    )
}

export default IvrMenuActionSendToSMSField
