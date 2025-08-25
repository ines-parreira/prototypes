import { useMemo } from 'react'

import { useWatch } from 'react-hook-form'

import { Banner, Label } from '@gorgias/axiom'
import { useListIntegrations } from '@gorgias/helpdesk-queries'
import { CustomRecordingType, SendToSMSStep } from '@gorgias/helpdesk-types'
import { validateVoiceMessage } from '@gorgias/helpdesk-validators'

import { FormField } from 'core/forms'
import { NodeProps } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'
import useAppSelector from 'hooks/useAppSelector'
import TextArea from 'pages/common/forms/TextArea'
import SmsIntegrationSelect from 'pages/integrations/integration/components/sms/SmsIntegrationSelect'
import { getIntegrationName } from 'pages/integrations/integration/components/sms/utils'
import VoiceMessageField from 'pages/integrations/integration/components/voice/VoiceMessageField'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'

import type { SendToSMSNode } from '../types'
import { VoiceStepNode } from './VoiceStepNode'

import css from './VoiceStepNode.less'

export function SendToSMSNode(props: NodeProps<SendToSMSNode>) {
    const { id } = props.data
    const step: SendToSMSStep = useWatch({ name: `steps.${id}` })
    const { confirmation_message, sms_integration_id, sms_content } = step

    // we don't have the API exposed to get the phone numbers, so we use the selector
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

    const { data: smsIntegrationsData } = useListIntegrations({ type: 'sms' })
    const smsIntegrations = smsIntegrationsData?.data?.data || []
    const chosenSmsIntegration = smsIntegrations.find(
        (integration) => integration.id === sms_integration_id,
    )

    // Custom validation of the step
    const errors = useMemo(() => {
        const errors: string[] = []
        if (!chosenSmsIntegration) {
            errors.push('SMS integration is required')
        }
        if (!sms_content) {
            errors.push('Outbound SMS message is required')
        }
        if (!validateVoiceMessage(confirmation_message).isValid) {
            errors.push('SMS confirmation message is required')
        }

        return errors
    }, [confirmation_message, sms_content, chosenSmsIntegration])

    return (
        <VoiceStepNode
            {...props}
            title="Send to SMS"
            description={
                getIntegrationName(chosenSmsIntegration, phoneNumbers) ||
                'SMS integration'
            }
            icon={
                <StepCardIcon backgroundColor="green" name="comm-chat-dots" />
            }
            errors={errors}
        >
            <Banner type="info">
                Sending to SMS is a final step, you cannot add any other steps
                after. Once the caller hears the confirmation message, the call
                ends.
            </Banner>
            <div className={css.formSection}>
                <Label>SMS integration</Label>
                <FormField
                    name={`steps.${id}.sms_integration_id`}
                    field={SmsIntegrationSelect}
                    options={smsIntegrations.map((integration) => ({
                        label: getIntegrationName(integration, phoneNumbers),
                        value: integration.id,
                    }))}
                />
            </div>

            <div className={css.formSection}>
                <Label>SMS confirmation message</Label>
                <span>
                    This message will be played to callers before deflecting the
                    conversation to SMS
                </span>
            </div>
            <div>
                <FormField
                    name={`steps.${id}.confirmation_message`}
                    field={VoiceMessageField}
                    horizontal={true}
                    shouldUpload={true}
                    allowNone={false}
                    customRecordingType={CustomRecordingType.GreetingMessage}
                    radioButtonId={id}
                />
            </div>

            <div className={css.formSection}>
                <Label>Outbound SMS message</Label>
                <span>This message will be sent to callers via SMS</span>
            </div>
            <FormField
                name={`steps.${id}.sms_content`}
                field={TextArea}
                placeholder="Hello! Thank you for choosing our messaging service. How can I help you?"
            />
        </VoiceStepNode>
    )
}
