import React, { useEffect, useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { List, Map } from 'immutable'

import { FeatureFlagKey } from 'config/featureFlags'
import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import { useFlag } from 'core/flags'
import IconLink from 'core/ui/components/IconLink'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { isEnterprise } from 'models/billing/utils'
import { EmailDomain, IntegrationType } from 'models/integration/types'
import { useListStoreMappings } from 'models/storeMapping/queries'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'
import { fetchIntegrations } from 'state/integrations/actions'
import { getIntegrationsByTypes } from 'state/integrations/helpers'

import IntegrationList from '../IntegrationList'
import EmailIntegrationListItem from './EmailIntegrationListItem'
import { fetchEmailDomains } from './resources'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
}

export default function EmailIntegrationList(props: Props): JSX.Element {
    const { integrations, loading } = props
    const dispatch = useAppDispatch()

    const [isLoadingDomains, setIsLoadingDomains] = useState(false)
    const [emailDomains, setEmailDomains] = useState<EmailDomain[]>([])
    const forceEmailForwardingFlag: boolean = useFlag(
        FeatureFlagKey.ForceEmailOnboarding,
        false,
    )

    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const isEnterpriseCustomer = isEnterprise(currentHelpdeskPlan)

    const isForcedEmailOnboarding =
        forceEmailForwardingFlag && isEnterpriseCustomer

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

    if (isLoadingDomains || isLoadingStoreMappings) {
        return <Loader />
    }

    const verifiedDomains = emailDomains
        .filter((domain) => domain.verified)
        .map((domain) => domain.name)

    const longTypeDescription = (
        <>
            <p>View and manage the support emails you use with Gorgias.</p>
            <IconLink
                className="mr-4"
                href="https://link.gorgias.com/121af4"
                icon="menu_book"
                content="Email Forwarding"
            />
            <IconLink
                className="mr-4"
                href="https://docs.gorgias.com/en-US/email-domain-verification-101-81757"
                icon="menu_book"
                content="Domain Verification"
            />
        </>
    )

    const integrationToItemDisplay = (integration: Map<any, any>) => {
        return (
            <EmailIntegrationListItem
                integration={integration.toJS?.()}
                verifiedDomains={verifiedDomains}
                storeMappings={storeMappings}
                integrations={integrations.toJS?.()}
            />
        )
    }

    return (
        <IntegrationList
            createIntegrationButtonLabel="Add New Email"
            createIntegration={() => {
                if (isForcedEmailOnboarding) {
                    history.push('/app/settings/channels/email/new/onboarding')
                } else {
                    history.push('/app/settings/channels/email/new')
                }
            }}
            integrationType={IntegrationType.Email}
            integrations={getIntegrationsByTypes(
                integrations,
                EMAIL_INTEGRATION_TYPES,
            )}
            integrationToItemDisplay={integrationToItemDisplay}
            longTypeDescription={longTypeDescription}
            loading={loading}
            tableHeader={
                <thead>
                    <tr>
                        <td colSpan={2}>Email</td>
                        <td colSpan={1}>Stores</td>
                        <td colSpan={2}>Status</td>
                    </tr>
                </thead>
            }
        />
    )
}
