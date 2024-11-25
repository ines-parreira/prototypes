import {EmailIntegration, GmailIntegration} from '@gorgias/api-queries'
import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {OutlookIntegration} from 'models/integration/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'

import {getIntegrationsLoading} from 'state/integrations/selectors'

import {getDomainFromEmailAddress, isBaseEmailAddress} from '../helpers'
import useEmailIntegration from '../useEmailIntegration'
import RecordsTable from './components/RecordsTable'
import css from './EmailDomainVerification.less'
import {useDomainVerification} from './useDomainVerification'

type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
    displayButtons?: boolean
}

export default function EmailDomainVerificationContent({
    integration,
    displayButtons,
}: Props) {
    const isLoadingIntegration =
        useAppSelector(getIntegrationsLoading)?.integration ?? false

    const address = integration.meta?.address || ''
    const isBaseIntegration = isBaseEmailAddress(address)
    const domainName = getDomainFromEmailAddress(address)

    const {
        domain,
        isCreatingDomain,
        domainCreationError,
        isFetching,
        verifyDomain,
        isVerifying,
        isPending,
    } = useDomainVerification(domainName, {shouldCreateDomain: true})

    const {deleteIntegration, isDeleting} = useEmailIntegration(integration)

    const shouldDisplayLoadingState =
        isLoadingIntegration || isFetching || !domain || isCreatingDomain

    if (isBaseIntegration) {
        return (
            <Alert>
                The base email integration cannot have a domain associated.
            </Alert>
        )
    }

    if (!domain && domainCreationError) {
        return <Alert type={AlertType.Error}>Failed to create domain</Alert>
    }

    return (
        <>
            <FormSection
                title="Verify your domain to send emails from Gorgias"
                description={`Domain verification allows Gorgias to send emails to your
                    customers on your behalf. Add the records below to the DNS
                    settings for ${domainName} – copy and paste the information
                    to prevent entry errors.`}
            >
                <RecordsTable
                    domain={domain}
                    domainName={domain?.name ?? domainName}
                    isLoading={shouldDisplayLoadingState}
                />
            </FormSection>
            {displayButtons && (
                <div className={css.buttonGroup}>
                    <Button
                        intent="primary"
                        onClick={verifyDomain}
                        isLoading={isVerifying || isPending}
                    >
                        Check status
                    </Button>

                    <ConfirmButton
                        onConfirm={deleteIntegration}
                        confirmationContent="Are you sure you want to delete this domain? Domain verification can take up to 72 hours. Non-verified domains may lead to increased deliverability issues."
                        fillStyle="ghost"
                        intent="destructive"
                        isLoading={isDeleting}
                    >
                        <ButtonIconLabel icon="delete">
                            Delete integration
                        </ButtonIconLabel>
                    </ConfirmButton>
                </div>
            )}
        </>
    )
}
