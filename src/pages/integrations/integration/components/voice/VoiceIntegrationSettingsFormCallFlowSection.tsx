import { CustomRecordingType } from '@gorgias/helpdesk-types'

import { FormField } from 'core/forms'
import Accordion from 'pages/common/components/accordion/Accordion'

import VoiceIntegrationSettingCallRecording from './VoiceIntegrationSettingCallRecording'
import VoiceIntegrationSettingCallTranscription from './VoiceIntegrationSettingCallTranscription'
import VoiceIntegrationSettingDistributionBehavior from './VoiceIntegrationSettingDistributionBehavior'
import VoiceIntegrationSettingVoicemail from './VoiceIntegrationSettingVoicemail'
import VoiceMessageField from './VoiceMessageField'
import VoiceSettingAccordionItem from './VoiceSettingAccordionItem'

function VoiceIntegrationSettingsFormCallFlowSection(): JSX.Element {
    return (
        <div>
            <Accordion>
                <VoiceSettingAccordionItem
                    subtitle={'Greeting message'}
                    description={'Customize your greeting message'}
                >
                    <FormField
                        field={VoiceMessageField}
                        name={'meta.greeting_message'}
                        allowNone
                        horizontal={true}
                        shouldUpload={true}
                        customRecordingType={
                            CustomRecordingType.GreetingMessage
                        }
                        radioButtonId={'greeting-message'}
                    />
                </VoiceSettingAccordionItem>
                <VoiceSettingAccordionItem
                    subtitle={'Routing behavior'}
                    description={'Customize where to route your callers'}
                >
                    <VoiceIntegrationSettingDistributionBehavior />
                </VoiceSettingAccordionItem>
                <VoiceSettingAccordionItem
                    subtitle={'Voicemail'}
                    description={'Customize your voicemail'}
                >
                    <VoiceIntegrationSettingVoicemail />
                </VoiceSettingAccordionItem>
                <VoiceSettingAccordionItem
                    subtitle={'Call recording'}
                    description={'Toggle call recordings on / off'}
                >
                    <VoiceIntegrationSettingCallRecording />
                </VoiceSettingAccordionItem>
                <VoiceSettingAccordionItem
                    subtitle={'Call transcription'}
                    description={'Toggle automatic call transcription on / off'}
                >
                    <VoiceIntegrationSettingCallTranscription />
                </VoiceSettingAccordionItem>
            </Accordion>
        </div>
    )
}

export default VoiceIntegrationSettingsFormCallFlowSection
