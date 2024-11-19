import React from 'react'

import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import SettingsSidebar from 'pages/settings/SettingsSidebar'

import css from './EmailDomainVerification.less'
import EmailDomainVerificationSupportContent from './EmailDomainVerificationSupportContent'
import VerifyDomainModal from './VerifyDomainModal'

export default function EmailDomainVerification() {
    return (
        <SettingsPageContainer className={css.pageContainer}>
            <SettingsContent>Domain verification</SettingsContent>
            <SettingsSidebar className={css.sidebar}>
                <EmailDomainVerificationSupportContent />
            </SettingsSidebar>
            <VerifyDomainModal />
        </SettingsPageContainer>
    )
}
