import React from 'react'

import {Form} from 'core/forms'
import {PhoneIntegration, isPhoneIntegration} from 'models/integration/types'
import css from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferences.less'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import {getDefaultValues, useFormSubmit} from './useVoicePreferencesForm'
import VoiceIntegrationPreferencesForm from './VoiceIntegrationPreferencesForm'

type Props = {
    integration: PhoneIntegration
}

export default function VoiceIntegrationPreferences({
    integration,
}: Props): JSX.Element {
    const {onSubmit} = useFormSubmit(integration)

    if (!isPhoneIntegration(integration)) {
        return <div />
    }

    return (
        <SettingsPageContainer>
            <SettingsContent>
                <Form
                    onValidSubmit={onSubmit}
                    className={css.form}
                    defaultValues={getDefaultValues(integration)}
                    mode="onChange"
                    resetOptions={{
                        keepDirty: false,
                        keepDefaultValues: false,
                    }}
                >
                    <VoiceIntegrationPreferencesForm
                        integration={integration}
                    />
                </Form>
            </SettingsContent>
        </SettingsPageContainer>
    )
}
