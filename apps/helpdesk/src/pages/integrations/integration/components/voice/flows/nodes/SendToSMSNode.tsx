import { useMemo } from 'react'

import { useWatch } from 'react-hook-form'

import { Banner } from '@gorgias/axiom'
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
    const step: SendToSMSStep | null = useWatch({ name: `steps.${id}` })

    // we don't have the API exposed to get the phone numbers, so we use the selector
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

    const { data: smsIntegrationsData } = useListIntegrations({ type: 'sms' })
    const smsIntegrations = smsIntegrationsData?.data?.data || []
    const chosenSmsIntegration = smsIntegrations.find(
        (integration) => integration.id === step?.sms_integration_id,
    )

    // Custom validation of the step
    const errors = useMemo(() => {
        const errors: string[] = []
        if (!chosenSmsIntegration) {
            errors.push('SMS integration is required')
        }
        if (!step?.sms_content) {
            errors.push('Outbound SMS message is required')
        }
        if (!validateVoiceMessage(step?.confirmation_message).isValid) {
            errors.push('SMS confirmation message is required')
        }

        return errors
    }, [step?.confirmation_message, step?.sms_content, chosenSmsIntegration])

    if (!step) {
        return null
    }

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
                after. Once the caller hears the transition message, the call
                ends.
            </Banner>

            <div className={css.formWithSeparator}>
                <div className={css.formSection}>
                    <div className={css.sectionHeader}>
                        <div className={css.sectionTitle}>
                            Step 1: Where should this call go?
                        </div>
                        <div className={css.sectionDescription}>
                            Select the SMS integrations you want your callers to
                            be deflected to:
                        </div>
                    </div>
                    <FormField
                        name={`steps.${id}.sms_integration_id`}
                        field={SmsIntegrationSelect}
                        options={smsIntegrations.map((integration) => ({
                            label: getIntegrationName(
                                integration,
                                phoneNumbers,
                            ),
                            value: integration.id,
                        }))}
                    />
                </div>

                <div className={css.formSection}>
                    <div className={css.sectionHeader}>
                        <div className={css.sectionTitle}>
                            Step 2: Transition message
                        </div>
                        <div className={css.sectionDescription}>
                            Let callers know they&apos;re switching to text
                            messaging so they know what to expect next.
                        </div>
                    </div>
                    <div>
                        <FormField
                            name={`steps.${id}.confirmation_message`}
                            field={VoiceMessageField}
                            horizontal={true}
                            shouldUpload={true}
                            allowNone={false}
                            customRecordingType={
                                CustomRecordingType.GreetingMessage
                            }
                            radioButtonId={id}
                        />
                    </div>
                </div>

                <div className={css.formSection}>
                    <div className={css.sectionHeader}>
                        <div className={css.sectionTitle}>
                            Step 3: Opening SMS message
                        </div>
                        <div className={css.sectionDescription}>
                            Welcome customers to the text conversation
                        </div>
                    </div>

                    <FormField
                        name={`steps.${id}.sms_content`}
                        field={TextArea}
                        label={'SMS message'}
                        placeholder="Hello! Thank you for choosing our messaging service. How can I help you?"
                    />
                </div>
            </div>
        </VoiceStepNode>
    )
}
