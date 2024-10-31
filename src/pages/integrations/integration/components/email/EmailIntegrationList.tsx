import {EmailProvider} from '@gorgias/api-queries'
import classnames from 'classnames'
import {List, Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useEffect, useState} from 'react'

import gmailImg from 'assets/img/integrations/gmail.svg'
import officeImg from 'assets/img/integrations/office.svg'
import {FeatureFlagKey} from 'config/featureFlags'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import {
    EmailDomain,
    IntegrationType,
    isEmailIntegration,
} from 'models/integration/types'
import {useListStoreMappings} from 'models/storeMapping/queries'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import {getDefaultIntegrationSettings} from 'state/currentAccount/selectors'
import {fetchIntegrations} from 'state/integrations/actions'
import {
    getIconFromType,
    getIntegrationsByTypes,
} from 'state/integrations/helpers'
import {makeGetRedirectUri} from 'state/integrations/selectors'

import IntegrationList from '../IntegrationList'
import DefaultIntegrationBadge from './DefaultIntegrationBadge'
import css from './EmailIntegrationList.less'
import EmailIntegrationListVerificationStatus from './EmailIntegrationListVerificationStatus'
import {
    getDomainFromEmailAddress,
    isBaseEmailIntegration,
    isOutboundDomainVerified,
    isOutboundVerifiedSendgrid,
} from './helpers'
import {fetchEmailDomains} from './resources'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
}

export default function EmailIntegrationList(props: Props): JSX.Element {
    const {integrations, loading} = props
    const getRedirectUri = useAppSelector(makeGetRedirectUri)

    const showStoreMapping: boolean | undefined =
        useFlags()[FeatureFlagKey.EnableEmailToStoreMapping]

    const showDefaultIntegration: boolean | undefined =
        useFlags()[FeatureFlagKey.DefaultEmailAddress]

    const [isLoadingDomains, setIsLoadingDomains] = useState(false)
    const [emailDomains, setEmailDomains] = useState<EmailDomain[]>([])

    const defaultIntegrations = useAppSelector(getDefaultIntegrationSettings)
    const dispatch = useAppDispatch()

    const {data: storeMappings, isFetching: isLoadingStoreMappings} =
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
            }
        )

    useEffect(() => {
        setIsLoadingDomains(true)
        fetchEmailDomains().then(
            (domains) => {
                setEmailDomains(domains)
                setIsLoadingDomains(false)
            },
            () => setIsLoadingDomains(false)
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
        const active = !integration.get('deactivated_datetime')
        const integrationId = integration.get('id') as string
        const isRowSubmitting = isSubmitting === integrationId

        const address = integration.getIn(['meta', 'address'], '') as string
        const domain = getDomainFromEmailAddress(address)

        const isBaseIntegration = isBaseEmailIntegration(integration.toJS())
        const isDefault =
            showDefaultIntegration &&
            defaultIntegrations?.data?.email === integration.get('id')

        const integrationType:
            | IntegrationType.Gmail
            | IntegrationType.Outlook
            | IntegrationType.Email = integration.get('type')
        const isForwardEmail = integrationType === IntegrationType.Email
        const isSendgrid =
            integration.getIn(['meta', 'provider'], EmailProvider.Mailgun) ===
            EmailProvider.Sendgrid

        const isVerified =
            integration.getIn(['meta', 'verified'], true) || !isForwardEmail
        const isDomainVerified = isSendgrid
            ? isOutboundVerifiedSendgrid(integration.toJS())
            : verifiedDomains.includes(domain)

        // Whether to show the "pending domain verification" warning for this integration

        const shouldDisplayDomainVerificationWarning =
            !isDomainVerified &&
            !isBaseIntegration && // The base email integration cannot have a domain associated
            isVerified

        const getTabURL = () => {
            if (!isForwardEmail && !active) {
                return ''
            }

            if (shouldDisplayDomainVerificationWarning) {
                return isSendgrid ? '/outbound-verification' : '/dns'
            }

            return isVerified ? '' : '/verification'
        }

        const editLink = `/app/settings/channels/email/${integrationId}${getTabURL()}`

        const getUri = (type: IntegrationType) => {
            const uri = new URL(getRedirectUri(type), window.location.origin)
            uri.search = new URLSearchParams({
                integration_id: integrationId,
            }).toString()
            return uri.toString()
        }
        const adapters = {
            [IntegrationType.Gmail]: {
                uri: getUri(IntegrationType.Gmail),
                image: (
                    <img alt="gmail logo" src={gmailImg} className={css.logo} />
                ),
            },
            [IntegrationType.Outlook]: {
                uri: getUri(IntegrationType.Outlook),
                image: (
                    <img
                        alt="outlook logo"
                        src={officeImg}
                        className={css.logo}
                    />
                ),
            },
            [IntegrationType.Email]: {
                uri: undefined,
                image: (
                    <i
                        className={classnames(
                            css.icon,
                            'material-icons',
                            'align-bottom'
                        )}
                    >
                        email
                    </i>
                ),
            },
        }

        const adapter = adapters[integrationType]

        const storeIntegration: Map<any, any> = integrations.find(
            (_integration) =>
                _integration?.get('id') === storeMappings?.[integrationId]
        )

        const handleRowClick = () => {
            history.push(editLink)
        }

        return (
            <tr
                key={integrationId}
                onClick={handleRowClick}
                className={css.row}
            >
                <td className="smallest align-middle">{adapter.image}</td>
                <td className={classnames('align-middle')}>
                    <div className={css.address}>
                        <div>
                            <b className="mr-2">{integration.get('name')}</b>
                            <span className={css.addressValue}>{address}</span>
                        </div>

                        {isDefault && <DefaultIntegrationBadge />}
                    </div>
                </td>
                {showStoreMapping && (
                    <td className={classnames('align-middle pr-2', css.store)}>
                        {storeIntegration ? (
                            <span className={css.storeName}>
                                <img
                                    height={16}
                                    width={16}
                                    src={getIconFromType(
                                        storeIntegration.get('type')
                                    )}
                                    alt="logo"
                                />
                                <span>{storeIntegration.get('name')}</span>
                            </span>
                        ) : (
                            'No store connected'
                        )}
                    </td>
                )}
                <td className="smallest align-middle text-left p-0">
                    <EmailIntegrationListVerificationStatus
                        active={active}
                        isForwardEmail={isForwardEmail}
                        isVerified={isVerified}
                        isRowSubmitting={isRowSubmitting}
                        redirectURI={adapter.uri}
                        isDomainVerificationWarningVisible={
                            shouldDisplayDomainVerificationWarning
                        }
                    />
                </td>
                <td className="smallest align-middle">
                    <i className="material-icons md-2 align-middle icon-go-forward">
                        keyboard_arrow_right
                    </i>
                </td>
            </tr>
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
        }
    )

    return (
        <IntegrationList
            alert={
                !areAllEmailIntegrationsVerified ? (
                    <Alert icon type={AlertType.Warning}>
                        In order to verify your domains, click on the emails
                        with 'Action required: verify domain' status, go to the
                        Outbound Verification tab and complete the verification
                        process.
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
                EMAIL_INTEGRATION_TYPES
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
