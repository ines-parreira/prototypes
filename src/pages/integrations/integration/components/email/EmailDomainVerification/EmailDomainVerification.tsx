import React, {useCallback} from 'react'

import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'

import {getCurrentUser} from 'state/currentUser/selectors'
import {hasRole} from 'utils'
import {UserRole} from 'config/types/user'

import Alert from 'pages/common/components/Alert/Alert'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import useAppSelector from 'hooks/useAppSelector'

import {
    EmailIntegration,
    GmailIntegration,
    OutlookIntegration,
} from 'models/integration/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchIntegration} from 'state/integrations/actions'
import {getDomainFromEmailAddress, isBaseEmailAddress} from '../helpers'
import RecordsTable from './components/RecordsTable'
import EmailDomainVerificationForm from './components/EmailDomainVerificationForm'

import css from './EmailDomainVerification.less'
import {useDomainVerification} from './useDomainVerification'

export type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
    loading?: Record<string, boolean>
    onDeleteDomain?: () => void
}

export default function EmailDomainVerification({
    integration,
    loading,
    onDeleteDomain,
}: Props) {
    const currentUser = useAppSelector(getCurrentUser)

    const dispatch = useAppDispatch()

    const address = integration.meta?.address || ''
    const domainName = getDomainFromEmailAddress(address)
    const isBaseIntegration = isBaseEmailAddress(address)

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
    } = useDomainVerification(domainName, {
        onDelete,
    })

    if (isBaseIntegration) {
        return (
            <Alert>
                The base email integration cannot have a domain associated.
            </Alert>
        )
    }

    if ((loading?.integration || isFetching) && !domain) {
        return <Loader data-testid="loader" />
    }

    if (!domain) {
        return <EmailDomainVerificationForm integration={integration} />
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

            <RecordsTable domainName={domain.name} />

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
                    >
                        <ButtonIconLabel icon="delete">
                            Delete Domain
                        </ButtonIconLabel>
                    </ConfirmButton>
                )}
            </div>
        </>
    )
}
