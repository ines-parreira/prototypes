import { Banner, CheckBoxField, ToggleField } from '@gorgias/axiom'
import {
    CustomRecordingType,
    UpdateAllPhoneIntegrationSettings,
} from '@gorgias/helpdesk-types'

import { FormField, useFormContext } from 'core/forms'
import { AlertType } from 'pages/common/components/Alert/Alert'

import VoiceMessageFieldWithLabel from './VoiceMessageFieldWithLabel'

import css from './VoiceIntegrationSettingCallbackRequests.less'

export default function VoiceIntegrationSettingCallbackRequests() {
    const methods = useFormContext<UpdateAllPhoneIntegrationSettings>()
    const enabled = methods.watch('meta.callback_requests.enabled')

    return (
        <div className={css.container}>
            <FormField
                name={'meta.callback_requests.enabled'}
                field={ToggleField}
                label="Allow callers to request callback"
                caption="When enabled, callers can request a callback by pressing *. Tickets with pending callback requests will have Callback Requested as their Call Status ticket field value."
            />
            {enabled && (
                <>
                    <FormField
                        name={'meta.callback_requests.prompt_message'}
                        field={VoiceMessageFieldWithLabel}
                        allowNone
                        horizontal
                        shouldUpload
                        label="Callback prompt message"
                        tooltip={`Use this message to instruct callers how to request a callback.`}
                        customRecordingType={
                            CustomRecordingType.CallbackRequests
                        }
                        radioButtonId={'callback-prompt-message'}
                    />
                    <FormField
                        name={'meta.callback_requests.confirmation_message'}
                        field={VoiceMessageFieldWithLabel}
                        shouldUpload
                        horizontal
                        customRecordingType={
                            CustomRecordingType.CallbackRequests
                        }
                        label="Callback confirmation message"
                        tooltip={`Use this to confirm the callback was received. If you’ve unchecked voice message, consider updating the confirmation message to match.`}
                        radioButtonId={'callback-confirmation-message'}
                    />
                    <FormField
                        name={'meta.callback_requests.allow_to_leave_voicemail'}
                        field={CheckBoxField}
                        label={
                            'Allow caller to leave a voice message after requesting a callback'
                        }
                        caption={
                            'When enabled, callers can leave a voice message with their callback request to provide more context.'
                        }
                    />
                    {methods.formState.dirtyFields?.meta?.callback_requests
                        ?.allow_to_leave_voicemail && (
                        <Banner
                            type={AlertType.Info}
                            icon
                            fillStyle="ghost"
                            isClosable={false}
                        >
                            Update the confirmation message to indicate if
                            callers can leave a voice message after requesting a
                            callback or not.
                        </Banner>
                    )}
                </>
            )}
        </div>
    )
}
