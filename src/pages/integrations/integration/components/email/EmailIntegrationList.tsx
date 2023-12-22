import React, {useEffect, useState} from 'react'
import {List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import Button from 'pages/common/components/button/Button'

import gmailImg from 'assets/img/integrations/gmail.png'
import outlookImg from 'assets/img/integrations/outlook.png'

import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import Loader from 'pages/common/components/Loader/Loader'
import {EmailDomain, IntegrationType} from 'models/integration/types'
import history from 'pages/history'
import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'
import {getIntegrationsByTypes} from 'state/integrations/helpers'
import useAppDispatch from 'hooks/useAppDispatch'
import useEffectOnce from 'hooks/useEffectOnce'
import {fetchIntegrations} from 'state/integrations/actions'
import Tooltip from 'pages/common/components/Tooltip'
import {makeGetRedirectUri} from 'state/integrations/selectors'
import useAppSelector from 'hooks/useAppSelector'
import IntegrationList from '../IntegrationList'
import {fetchEmailDomains} from './resources'
import {
    getDomainFromEmailAddress,
    isBaseEmailIntegration,
    isOutboundVerifiedSendgrid,
    isSendgridEmailIntegration,
} from './helpers'

import css from './EmailIntegrationList.less'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
}

export default function EmailIntegrationList(props: Props): JSX.Element {
    const {integrations, loading} = props
    const getRedirectUri = useAppSelector(makeGetRedirectUri)

    const [isLoadingDomains, setIsLoadingDomains] = useState(false)
    const [emailDomains, setEmailDomains] = useState<EmailDomain[]>([])

    const dispatch = useAppDispatch()

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

    if (isLoadingDomains) {
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
        const toolTipId = `integration-tooltip-${String(integrationId)}`

        const address = integration.getIn(['meta', 'address'], '') as string
        const domain = getDomainFromEmailAddress(address)

        const isBaseIntegration = isBaseEmailIntegration(integration.toJS())

        const integrationType:
            | IntegrationType.Gmail
            | IntegrationType.Outlook
            | IntegrationType.Email = integration.get('type')
        const isGmail = integrationType === IntegrationType.Gmail
        const isOutlook = integrationType === IntegrationType.Outlook
        const enableGmailSending = integration.getIn(
            ['meta', 'enable_gmail_sending'],
            true
        )

        const isVerified = integration.getIn(['meta', 'verified'], true)
        const isDomainVerified = verifiedDomains.includes(domain)

        // Whether to show the "pending domain verification" warning for this integration

        const shouldDisplayDomainVerificationWarning =
            !isSendgridEmailIntegration(integration.toJS()) && // In case the provider is sendgrid, use shouldDisplayOutboundVerificationWarning
            !isDomainVerified &&
            !isBaseIntegration && // The base email integration cannot have a domain associated
            !isOutlook && // Outlook does not need domain verification
            !(isGmail && enableGmailSending) && // GMail only needs domain verification if email sending is disabled
            (isGmail || isVerified) // Email integrations must be verified before adding a domain configuration

        const shouldDisplayOutboundVerificationWarning =
            isVerified &&
            !isBaseIntegration &&
            isSendgridEmailIntegration(integration.toJS()) &&
            !isOutboundVerifiedSendgrid(integration.toJS())

        const getTabURL = () => {
            if (shouldDisplayOutboundVerificationWarning) {
                return '/outbound-verification'
            }
            return isVerified || isGmail ? '' : '/verification'
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
                image: <img alt="gmail logo" src={gmailImg} width="22" />,
            },
            [IntegrationType.Outlook]: {
                uri: getUri(IntegrationType.Outlook),
                image: <img alt="outlook logo" src={outlookImg} width="22" />,
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

        return (
            <tr key={integrationId}>
                <td className="smallest align-middle">{adapter.image}</td>
                <td className="link-full-td">
                    <Link to={editLink} data-testid="integration-link">
                        <div>
                            <b className="mr-2">{integration.get('name')}</b>
                            <span className="text-faded">{address}</span>
                        </div>
                    </Link>
                </td>
                <td className="smallest align-middle text-right p-0">
                    <div>
                        {!active && (isGmail || isOutlook) && (
                            <>
                                <Button
                                    id={toolTipId}
                                    type="submit"
                                    color="ghost"
                                    fillStyle="ghost"
                                    className={classnames({
                                        'btn-loading': isRowSubmitting,
                                    })}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        window.open(adapter.uri)
                                    }}
                                >
                                    Reconnect
                                </Button>
                                <Tooltip placement="top-end" target={toolTipId}>
                                    Login credentials required to reconnect
                                    email
                                </Tooltip>
                            </>
                        )}
                        {!isGmail && !isOutlook && !isVerified && (
                            <div>
                                <i
                                    className={classnames(
                                        'material-icons mr-2 red'
                                    )}
                                >
                                    cancel
                                </i>
                                Not verified
                            </div>
                        )}
                        {shouldDisplayDomainVerificationWarning && (
                            <div>
                                <i
                                    className={classnames(
                                        'material-icons mr-2 orange'
                                    )}
                                >
                                    warning
                                </i>
                                Pending domain verification
                            </div>
                        )}
                        {shouldDisplayOutboundVerificationWarning && (
                            <div>
                                <i
                                    className={classnames(
                                        'material-icons mr-2 orange'
                                    )}
                                >
                                    warning
                                </i>
                                Pending outbound verification
                            </div>
                        )}
                    </div>
                </td>
                <td className="smallest align-middle">
                    <ForwardIcon href={editLink} />
                </td>
            </tr>
        )
    }

    return (
        <IntegrationList
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
        />
    )
}
