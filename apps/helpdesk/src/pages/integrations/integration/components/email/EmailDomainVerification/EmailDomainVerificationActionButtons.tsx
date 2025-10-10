import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'
import { EmailIntegration, GmailIntegration } from '@gorgias/helpdesk-queries'

import { OutlookIntegration } from 'models/integration/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import LinkButton from 'pages/common/components/button/LinkButton'

import useDeleteEmailIntegration from '../useDeleteEmailIntegration'
import { SUPPORT_EMAIL } from './constants'
import useDomainVerification from './useDomainVerification'

import css from './EmailDomainVerification.less'

type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
}

export default function EmailDomainVerificationActionButtons({
    integration,
}: Props) {
    const {
        domain,
        isCreatingDomain,
        errors,
        isFetching,
        verifyDomain,
        isVerifying,
        isPending,
    } = useDomainVerification()

    const { deleteIntegration, isDeleting } =
        useDeleteEmailIntegration(integration)

    const isDisabled = !domain || isCreatingDomain || isFetching

    if (errors.createDomain) {
        return (
            <div className={css.errorButtonsGroup}>
                <Link to="/app/settings/channels/email">
                    <Button intent="secondary">Close</Button>
                </Link>
                <LinkButton intent="primary" href={`mailto:${SUPPORT_EMAIL}`}>
                    Contact support
                </LinkButton>
            </div>
        )
    }

    return (
        <div className={css.buttonGroup}>
            <Button
                intent="primary"
                onClick={verifyDomain}
                isLoading={isVerifying || isPending}
                isDisabled={isDisabled}
            >
                Check status
            </Button>

            <ConfirmButton
                onConfirm={deleteIntegration}
                confirmationContent="Are you sure you want to delete this domain? Domain verification can take up to 72 hours. Non-verified domains may lead to increased deliverability issues."
                fillStyle="ghost"
                intent="destructive"
                isLoading={isDeleting}
                isDisabled={isDisabled}
                leadingIcon="delete"
            >
                Delete integration
            </ConfirmButton>
        </div>
    )
}
