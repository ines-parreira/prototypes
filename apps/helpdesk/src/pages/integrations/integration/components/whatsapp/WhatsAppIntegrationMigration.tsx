import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useSearch } from 'hooks/useSearch'
import {
    WhatsAppMigrationContextProvider,
    WhatsAppMigrationStep,
} from 'hooks/useWhatsAppMigration'
import { SettingsPageContainer } from 'pages/settings/SettingsPageContainer'

import { WhatsAppMigrationConnect } from './WhatsAppMigrationConnect'
import { WhatsAppMigrationVerificationForm as WhatsAppMigrationDebug } from './WhatsAppMigrationDebug'
import { WhatsAppMigrationForm } from './WhatsAppMigrationForm'
import { WhatsAppMigrationPreamble } from './WhatsAppMigrationPreamble'
import { WhatsAppMigrationVerificationForm } from './WhatsAppMigrationVerificationForm'

export function WhatsAppIntegrationMigration(): JSX.Element | null {
    const { step } = useSearch<{ step: string | undefined }>()
    const debugEnabled = useFlag(FeatureFlagKey.WhatsAppMigrationsDebug)

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
