import {EmailIntegration, GmailIntegration} from '@gorgias/api-queries'
import React from 'react'

import {OutlookIntegration} from 'models/integration/types'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import SettingsSidebar from 'pages/settings/SettingsSidebar'

import css from './EmailDomainVerification.less'
import EmailDomainVerificationContent from './EmailDomainVerificationContent'
import EmailDomainVerificationSupportContent from './EmailDomainVerificationSupportContent'
import VerifyDomainModal from './VerifyDomainModal'

type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
}

export default function EmailDomainVerification({integration}: Props) {
    return (
        <SettingsPageContainer className={css.pageContainer}>
            <SettingsContent>
                <EmailDomainVerificationContent
                    integration={integration}
                    displayButtons
                />
            </SettingsContent>
            <SettingsSidebar className={css.sidebar}>
                <EmailDomainVerificationSupportContent />
            </SettingsSidebar>
            <VerifyDomainModal />
        </SettingsPageContainer>
    )
}
