import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import useSearch from 'hooks/useSearch'
import {
    WhatsAppMigrationContextProvider,
    WhatsAppMigrationStep,
} from 'hooks/useWhatsAppMigration'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import {FeatureFlagKey} from 'config/featureFlags'

import WhatsAppMigrationPreamble from './WhatsAppMigrationPreamble'
import WhatsAppMigrationConnect from './WhatsAppMigrationConnect'
import WhatsAppMigrationForm from './WhatsAppMigrationForm'
import WhatsAppMigrationVerificationForm from './WhatsAppMigrationVerificationForm'
import WhatsAppMigrationDebug from './WhatsAppMigrationDebug'

export default function WhatsAppIntegrationMigration(): JSX.Element | null {
    const {step} = useSearch<{step: string | undefined}>()
    const debugEnabled = useFlags()[FeatureFlagKey.WhatsAppMigrationsDebug]

    return (
        <WhatsAppMigrationContextProvider>
            <SettingsPageContainer>
                {(!step || step === WhatsAppMigrationStep.Preamble) && (
                    <WhatsAppMigrationPreamble />
                )}
                {step === WhatsAppMigrationStep.Connect && (
                    <WhatsAppMigrationConnect />
                )}
                {step === WhatsAppMigrationStep.Migrate && (
                    <WhatsAppMigrationForm />
                )}
                {step === WhatsAppMigrationStep.Verify && (
                    <WhatsAppMigrationVerificationForm />
                )}
            </SettingsPageContainer>
            {debugEnabled && <WhatsAppMigrationDebug />}
        </WhatsAppMigrationContextProvider>
    )
}
