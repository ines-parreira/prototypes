import React from 'react'

import {useFlag} from 'common/flags'
import {Form} from 'components/Form/Form'
import {FeatureFlagKey} from 'config/featureFlags'
import {PhoneIntegration, isPhoneIntegration} from 'models/integration/types'
import css from 'pages/integrations/integration/components/voice/VoiceIntegrationPreferences.less'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import DEPRECATED_VoiceIntegrationPreferences from './DEPRECATED_VoiceIntegrationPreferences'
import {getDefaultValues, useFormSubmit} from './useVoicePreferencesForm'
import VoiceIntegrationPreferencesForm from './VoiceIntegrationPreferencesForm'

type Props = {
    integration: PhoneIntegration
}

export default function VoiceIntegrationPreferences({
    integration,
}: Props): JSX.Element {
    const {onSubmit} = useFormSubmit(integration)

    const isNewVoicePreferencesFormEnabled = useFlag(
        FeatureFlagKey.NewVoicePreferencesForm,
        false
    )

    if (!isPhoneIntegration(integration)) {
        return <div />
    }

    if (!isNewVoicePreferencesFormEnabled) {
        return (
            <DEPRECATED_VoiceIntegrationPreferences integration={integration} />
        )
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
