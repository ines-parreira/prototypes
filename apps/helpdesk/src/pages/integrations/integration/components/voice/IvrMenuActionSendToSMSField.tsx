import { useState } from 'react'

import { useId } from '@repo/hooks'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE,
    DEFAULT_IVR_DEFLECTION_SMS_CONTENT,
    VoiceMessageType,
} from 'models/integration/constants'
import type {
    IvrSmsDeflection,
    SmsIntegration,
    VoiceMessage,
} from 'models/integration/types'
import { Drawer } from 'pages/common/components/Drawer'
import TextArea from 'pages/common/forms/TextArea'
import SmsIntegrationSelect from 'pages/integrations/integration/components/sms/SmsIntegrationSelect'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import DEPRECATED_VoiceMessageField from './DEPRECATED_VoiceMessageField'

import css from './IvrMenuActionField.less'

const HELPER_TEXT = `This message will be sent to callers in a form of SMS once this IVR option is selected`

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
    const idForRadioButtons = useId()
    const initialSmsConfirmationMessage =
        settings.confirmation_message ??
        DEFAULT_IVR_DEFLECTION_CONFIRMATION_MESSAGE
    const initialSmsContent =
        settings.sms_content ?? DEFAULT_IVR_DEFLECTION_SMS_CONTENT
    const initialSmsIntegrationId =
        settings.sms_integration_id ?? smsIntegrations[0]?.id

    const [smsConfirmationMessage, setSmsConfirmationMessage] =
        useState<VoiceMessage>(initialSmsConfirmationMessage)
    const [smsSentToCallers, setSmsSentToCallers] =
        useState<string>(initialSmsContent)
    const [smsIntegrationId, setSmsIntegrationId] = useState<number | null>(
        initialSmsIntegrationId,
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
                }),
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
                }),
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

    const handleExitWithoutSaving = () => {
        setSmsConfirmationMessage(initialSmsConfirmationMessage)
        setSmsSentToCallers(initialSmsContent)
        setSmsIntegrationId(initialSmsIntegrationId)
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
                aria-label="Deflect to sms"
                open={isDrawerOpen}
                fullscreen={false}
                isLoading={false}
                portalRootId="app-root"
                onBackdropClick={handleExitWithoutSaving}
            >
                <Drawer.Header className={css.drawerHeader}>
                    <h3 className={css.title}>Message</h3>
                    <Drawer.HeaderActions
                        onClose={handleExitWithoutSaving}
                        closeButtonId="close-button"
                    />
                </Drawer.Header>

                <Drawer.Content className={css.drawerContent}>
                    <h5>Select SMS integration</h5>
                    <SmsIntegrationSelect
                        value={smsIntegrationId}
                        options={smsIntegrations.map((integration) => ({
                            label: integration.name,
                            value: integration.id,
                        }))}
                        onChange={setSmsIntegrationId}
                    />
                    <h5 className={css.headerWithDetails}>
                        SMS confirmation message
                    </h5>
                    <p>
                        This message will be played to callers once the SMS menu
                        option is selected
                    </p>
                    <DEPRECATED_VoiceMessageField
                        value={smsConfirmationMessage}
                        onChange={setSmsConfirmationMessage}
                        radioButtonId={`sms-confirmation-message-${idForRadioButtons}`}
                    />
                    <h5 className={css.innerHeader}>Outbound SMS Message</h5>
                    <TextArea
                        value={smsSentToCallers}
                        onChange={setSmsSentToCallers}
                        caption={HELPER_TEXT}
                        error={smsSentToCallers.length === 0 ? HELPER_TEXT : ''}
                    />
                </Drawer.Content>
                <Drawer.Footer>
                    <Button
                        onClick={handleSubmit}
                        intent="primary"
                        isDisabled={isSubmitDisabled()}
                    >
                        Save Changes
                    </Button>
                    <Button
                        onClick={handleExitWithoutSaving}
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
