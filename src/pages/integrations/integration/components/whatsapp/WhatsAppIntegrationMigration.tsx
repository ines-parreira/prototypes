import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import useSearch from 'hooks/useSearch'
import {
    WhatsAppMigrationContextProvider,
    WhatsAppMigrationStep,
} from 'hooks/useWhatsAppMigration'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import WhatsAppMigrationConnect from './WhatsAppMigrationConnect'
import WhatsAppMigrationDebug from './WhatsAppMigrationDebug'
import WhatsAppMigrationForm from './WhatsAppMigrationForm'
import WhatsAppMigrationPreamble from './WhatsAppMigrationPreamble'
import WhatsAppMigrationVerificationForm from './WhatsAppMigrationVerificationForm'

export default function WhatsAppIntegrationMigration(): JSX.Element | null {
    const { step } = useSearch<{ step: string | undefined }>()
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
