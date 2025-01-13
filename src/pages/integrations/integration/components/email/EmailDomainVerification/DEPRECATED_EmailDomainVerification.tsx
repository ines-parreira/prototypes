import React, {useCallback} from 'react'

import {UserRole} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {EmailProvider} from 'models/integration/constants'
import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import Alert from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Loader from 'pages/common/components/Loader/Loader'

import {getCurrentUser} from 'state/currentUser/selectors'
import {fetchIntegration} from 'state/integrations/actions'
import {hasRole} from 'utils'

import {getDomainFromEmailAddress, isBaseEmailAddress} from '../helpers'
import EmailDomainVerificationForm from './components/EmailDomainVerificationForm'
import RecordsTable from './components/RecordsTable'

import {DEPRECATED_useDomainVerification} from './DEPRECATED_useDomainVerification'
import css from './EmailDomainVerification.less'

export type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
    loading?: Record<string, boolean>
    onDeleteDomain?: () => void
}

/**
 * @deprecated
 * @date 2024-11-08
 * @type feature-component
 */
export default function DEPRECATED_EmailDomainVerification({
    integration,
    loading,
    onDeleteDomain,
}: Props) {
    const currentUser = useAppSelector(getCurrentUser)

    const dispatch = useAppDispatch()

    const address = integration.meta?.address || ''
    const provider = integration.meta?.provider || ''
    const domainName = getDomainFromEmailAddress(address)
    const isBaseIntegration = isBaseEmailAddress(address)
    const isMailgun = provider === EmailProvider.Mailgun

    const onDelete = useCallback(() => {
        void fetchIntegration(`${integration.id}`, integration.type)(dispatch)
        onDeleteDomain?.()
    }, [dispatch, integration, onDeleteDomain])

    const {
        domain,
        verifyDomain,
        deleteDomain,
        isFetching,
        isDeleting,
        isVerifying,
        isPending,
    } = DEPRECATED_useDomainVerification(domainName, {
        onDelete,
    })

    if (isBaseIntegration) {
        return (
            <Alert>
                The base email integration cannot have a domain associated.
            </Alert>
        )
    }

    if (isMailgun && !domain) {
        if (loading?.integration) {
            return <Loader data-testid="loader" />
        }

        return <EmailDomainVerificationForm integration={integration} />
    }

    if (loading?.integration || isFetching || !domain) {
        return <Loader data-testid="loader" />
    }

    return (
        <>
            {domain.verified ? (
                <div>
                    The domain <strong>{domainName}</strong> has been verified.
                </div>
            ) : (
                <div>
                    <span>
                        The domain <strong>{domainName}</strong> has not yet
                        been verified. To enable DKIM signing for, please add
                        the information below to your DNS records via your DNS
                        registrar. Note that verification of these settings{' '}
                        <strong>
                            may take up to 72 hours after submission
                        </strong>
                        .{' '}
                        <a
                            href="https://docs.gorgias.com/en-US/spf-dkim-support-81757"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn more
                        </a>
                    </span>
                </div>
            )}

            <RecordsTable domain={domain} domainName={domain.name} />

            <div className={css.buttonGroup}>
                <Button
                    intent="primary"
                    onClick={verifyDomain}
                    isLoading={isVerifying || isPending}
                >
                    Check Status
                </Button>

                {hasRole(currentUser, UserRole.Admin) && (
                    <ConfirmButton
                        onConfirm={deleteDomain}
                        confirmationContent="Are you sure you want to delete this domain? Domain verification can take up to 72 hours. Non-verified domains may lead to increased deliverability issues."
                        fillStyle="ghost"
                        intent="destructive"
                        isLoading={isDeleting}
                        leadingIcon="delete"
                    >
                        Delete Domain
                    </ConfirmButton>
                )}
            </div>
        </>
    )
}
