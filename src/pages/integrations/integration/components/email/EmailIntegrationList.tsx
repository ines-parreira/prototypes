import React, { useEffect, useState } from 'react'

import { List, Map } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import {
    EmailDomain,
    IntegrationType,
    isEmailIntegration,
} from 'models/integration/types'
import { useListStoreMappings } from 'models/storeMapping/queries'
import Alert, { AlertType } from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import { fetchIntegrations } from 'state/integrations/actions'
import { getIntegrationsByTypes } from 'state/integrations/helpers'

import IntegrationList from '../IntegrationList'
import EmailIntegrationListItem from './EmailIntegrationListItem'
import { isBaseEmailIntegration, isOutboundDomainVerified } from './helpers'
import { fetchEmailDomains } from './resources'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
}

export default function EmailIntegrationList(props: Props): JSX.Element {
    const { integrations, loading } = props

    const showStoreMapping: boolean | undefined =
        useFlags()[FeatureFlagKey.EnableEmailToStoreMapping]

    const [isLoadingDomains, setIsLoadingDomains] = useState(false)
    const [emailDomains, setEmailDomains] = useState<EmailDomain[]>([])

    const dispatch = useAppDispatch()

    const { data: storeMappings, isFetching: isLoadingStoreMappings } =
        useListStoreMappings(
            integrations
                .map((integration) => integration?.get('id') as number)
                .toArray(),
            {
                enabled: integrations.size > 0,
                refetchOnWindowFocus: false,
                select: (data) =>
                    data?.reduce<Record<string, number>>((acc, mapping) => {
                        acc[mapping.integration_id] = mapping.store_id
                        return acc
                    }, {}),
            },
        )

    useEffect(() => {
        setIsLoadingDomains(true)
        fetchEmailDomains().then(
            (domains) => {
                setEmailDomains(domains)
                setIsLoadingDomains(false)
            },
            () => setIsLoadingDomains(false),
        )
    }, [])

    useEffectOnce(() => {
        void dispatch(fetchIntegrations())
    })

    if (isLoadingDomains || (isLoadingStoreMappings && showStoreMapping)) {
        return <Loader />
    }

    const verifiedDomains = emailDomains
        .filter((domain) => domain.verified)
        .map((domain) => domain.name)

    const longTypeDescription = (
        <span>
            Connect your support email addresses and respond to your customers
            from Gorgias.
        </span>
    )

    const isSubmitting = loading.get('updateIntegration')

    const integrationToItemDisplay = (integration: Map<any, any>) => {
        return (
            <EmailIntegrationListItem
                integration={integration.toJS?.()}
                isRowSubmitting={isSubmitting}
                verifiedDomains={verifiedDomains}
                storeMappings={storeMappings}
                integrations={integrations.toJS?.()}
            />
        )
    }

    const areAllEmailIntegrationsVerified = integrations.every(
        (integrationData: Map<any, any> | undefined) => {
            const integration = integrationData?.toJS()
            if (!isEmailIntegration(integration)) {
                return true
            }

            if (isBaseEmailIntegration(integration)) {
                return true
            }

            return isOutboundDomainVerified(integration)
        },
    )

    return (
        <IntegrationList
            alert={
                !areAllEmailIntegrationsVerified ? (
                    <Alert icon type={AlertType.Warning}>
                        {`In order to verify your domains, click on the emails
                        with 'Action required: verify domain' status, go to the
                        Outbound Verification tab and complete the verification
                        process.`}
                        <br />
                        If you need more information{' '}
                        <a
                            href="https://docs.gorgias.com/en-US/sendgrid-email-domain-verification-459392"
                            target="_blank"
                            rel="noreferrer"
                        >
                            click here
                        </a>{' '}
                    </Alert>
                ) : undefined
            }
            integrationType={IntegrationType.Email}
            integrations={getIntegrationsByTypes(
                integrations,
                EMAIL_INTEGRATION_TYPES,
            )}
            longTypeDescription={longTypeDescription}
            createIntegration={() =>
                history.push('/app/settings/channels/email/new')
            }
            createIntegrationButtonLabel="Add email address"
            integrationToItemDisplay={integrationToItemDisplay}
            loading={loading}
            tableHeader={
                showStoreMapping ? (
                    <thead>
                        <tr>
                            <td colSpan={2}>Email</td>
                            <td>Stores</td>
                            <td colSpan={2}>Status</td>
                        </tr>
                    </thead>
                ) : undefined
            }
        />
    )
}
