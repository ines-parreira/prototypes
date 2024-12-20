import {EmailIntegration, GmailIntegration} from '@gorgias/api-queries'
import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {OutlookIntegration} from 'models/integration/types'
import Alert from 'pages/common/components/Alert/Alert'
import FormSection from 'pages/settings/SLAs/features/SLAForm/views/FormSection'

import {getIntegrationsLoading} from 'state/integrations/selectors'

import {
    getDomainFromEmailAddress,
    isBaseEmailAddress,
    isCommonDomainEmail,
} from '../helpers'
import RecordsTable from './components/RecordsTable'
import useDomainVerification from './useDomainVerification'

type Props = {
    integration: EmailIntegration | GmailIntegration | OutlookIntegration
}

export default function EmailDomainVerificationContent({integration}: Props) {
    const isLoadingIntegration =
        useAppSelector(getIntegrationsLoading)?.integration ?? false

    const address = integration.meta?.address || ''
    const isBaseIntegration = isBaseEmailAddress(address)
    const isCommonDomainAddress = isCommonDomainEmail(address)
    const domainName = getDomainFromEmailAddress(address)

    const {domain, isCreatingDomain, errors, isFetching} =
        useDomainVerification()

    const shouldDisplayLoadingState =
        isLoadingIntegration ||
        isFetching ||
        !domain ||
        isCreatingDomain ||
        !isCommonDomainAddress

    if (isBaseIntegration) {
        return (
            <Alert>
                The base email integration cannot have a domain associated.
            </Alert>
        )
    }

    if (isCommonDomainAddress) {
        return (
            <Alert className="mb-5">
                The domain associated with this email address is a common domain
                and cannot be verified.
            </Alert>
        )
    }

    if (!domain && errors.createDomain && !isCommonDomainAddress) {
        return (
            <FormSection
                title="There was an issue processing your request"
                description="The DNS records needed for domain verification are still pending from your provider. These records are required for the domain verification process. Please contact support for assistance."
            />
        )
    }

    return (
        <FormSection
            {...(domain?.verified
                ? {
                      title: 'Your domain has been verified',
                      description: `Your domain has been successfully verified. You can now add any email address ending in @${domainName} and use it to send emails from Gorgias.`,
                  }
                : {
                      title: 'Verify your domain to send emails from Gorgias',
                      description: `Domain verification allows Gorgias to send emails to your
                    customers on your behalf. Add the records below to the DNS
                    settings for ${domainName} – copy and paste the information
                    to prevent entry errors.`,
                  })}
        >
            <RecordsTable
                domain={domain}
                domainName={domain?.name ?? domainName}
                isLoading={shouldDisplayLoadingState}
            />
        </FormSection>
    )
}
