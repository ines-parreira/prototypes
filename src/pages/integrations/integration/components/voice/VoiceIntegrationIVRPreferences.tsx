import { PhoneIntegration } from '@gorgias/api-types'

import { Form } from 'core/forms'
import { isPhoneIntegration } from 'models/integration/types'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import { getDefaultValues, useFormSubmit } from './useVoiceSettingsForm'
import { integrationSettingsIVRValidation } from './utils'
import VoiceIntegrationIVRPreferencesForm from './VoiceIntegrationIVRPreferencesForm'

type Props = {
    integration: PhoneIntegration
}

export default function VoiceIntegrationIVRPreferences({
    integration,
}: Props): JSX.Element {
    const { onSubmit } = useFormSubmit(integration)

    if (!isPhoneIntegration(integration)) {
        return <div />
    }

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <Form
                    onValidSubmit={onSubmit}
                    defaultValues={getDefaultValues(integration)}
                    mode="onChange"
                    resetOptions={{
                        keepDirty: false,
                        keepDefaultValues: false,
                        keepDirtyValues: false,
                    }}
                    shouldUnregister
                    validator={(values: Partial<PhoneIntegration>) => {
                        return integrationSettingsIVRValidation(values)
                    }}
                >
                    <VoiceIntegrationIVRPreferencesForm
                        integration={integration}
                    />
                </Form>
            </SettingsContent>
        </SettingsPageContainer>
    )
}
