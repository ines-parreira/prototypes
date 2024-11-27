import {EmailIntegration, GmailIntegration} from '@gorgias/api-queries'
import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {OutlookIntegration} from 'models/integration/types'
import Alert from 'pages/common/components/Alert/Alert'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'

import {getIntegrationsLoading} from 'state/integrations/selectors'

import {getDomainFromEmailAddress, isBaseEmailAddress} from '../helpers'
import RecordsTable from './components/RecordsTable'
import EmailDomainCreationFailure from './EmailDomainCreationFailure'
import useDomainVerification from './useDomainVerification'

type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
}

export default function EmailDomainVerificationContent({integration}: Props) {
    const isLoadingIntegration =
        useAppSelector(getIntegrationsLoading)?.integration ?? false

    const address = integration.meta?.address || ''
    const isBaseIntegration = isBaseEmailAddress(address)
    const domainName = getDomainFromEmailAddress(address)

    const {domain, isCreatingDomain, domainCreationError, isFetching} =
        useDomainVerification()

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
        return <EmailDomainCreationFailure />
    }

    return (
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
    )
}
