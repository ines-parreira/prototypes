import { EmailIntegration, GmailIntegration } from '@gorgias/helpdesk-queries'

import { OutlookIntegration } from 'models/integration/types'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import { getDomainFromEmailAddress } from '../helpers'
import DomainVerificationProvider from './DomainVerificationProvider'
import EmailDomainVerificationActionButtons from './EmailDomainVerificationActionButtons'
import EmailDomainVerificationContent from './EmailDomainVerificationContent'
import EmailDomainVerificationSupportContentSidebar from './EmailDomainVerificationSupportContentSidebar'
import VerifyDomainModal from './VerifyDomainModal'

import css from './EmailDomainVerification.less'

type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
}

export default function EmailDomainVerification({ integration }: Props) {
    const emailAddress = integration.meta?.address ?? ''

    return (
        <SettingsPageContainer className={css.pageContainer}>
            <DomainVerificationProvider
                domainName={getDomainFromEmailAddress(emailAddress)}
            >
                <SettingsContent>
                    <EmailDomainVerificationContent integration={integration} />
                    <EmailDomainVerificationActionButtons
                        integration={integration}
                    />
                </SettingsContent>
            </DomainVerificationProvider>
            <EmailDomainVerificationSupportContentSidebar />
            <VerifyDomainModal />
        </SettingsPageContainer>
    )
}
