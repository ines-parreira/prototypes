import { EmailIntegration, GmailIntegration } from '@gorgias/helpdesk-queries'
import { Badge } from '@gorgias/merchant-ui-kit'

import { OutlookIntegration } from 'models/integration/types'

import {
    EmailVerificationStatus,
    getEmailVerificationStatus,
} from './getEmailVerificationStatus'

type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
    isDomainVerificationWarningVisible: boolean
}

export default function EmailIntegrationListVerificationStatus({
    integration,
    isDomainVerificationWarningVisible,
}: Props) {
    const emailVerificationStatus = getEmailVerificationStatus(
        integration,
        isDomainVerificationWarningVisible,
    )

    switch (emailVerificationStatus) {
        case EmailVerificationStatus.UnverifiedEmail:
            return (
                <Badge corner="round" type="light-error">
                    <i className="material-icons-outlined">error_outline</i>
                    Verify Email
                </Badge>
            )
        case EmailVerificationStatus.UnconnectedEmail:
            return (
                <Badge corner="round" type="light-error">
                    <i className="material-icons-outlined">error_outline</i>
                    Reconnect Email
                </Badge>
            )
        case EmailVerificationStatus.UnverifiedDomain:
            return (
                <Badge corner="round" type="light-error">
                    <i className="material-icons-outlined">error_outline</i>
                    Verify Domain
                </Badge>
            )
    }

    return (
        <Badge corner="round" type="light-success">
            <i className="material-icons-outlined">check_circle</i>
            Verified
        </Badge>
    )
}
