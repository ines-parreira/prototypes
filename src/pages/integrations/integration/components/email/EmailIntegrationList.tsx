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
import IntegrationList from '../IntegrationList'
import {fetchEmailDomains} from './resources'
import {getDomainFromEmailAddress, isBaseEmailIntegration} from './helpers'
import WarningWithTooltip from './WarningWithTooltip'

import css from './EmailIntegrationList.less'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
    gmailRedirectUri: string
    outlookRedirectUri: string
}

export default function EmailIntegrationList(props: Props): JSX.Element {
    const {integrations, loading, gmailRedirectUri, outlookRedirectUri} = props

    const [isLoadingDomains, setIsLoadingDomains] = useState(false)
    const [emailDomains, setEmailDomains] = useState<EmailDomain[]>([])

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

        const isGmail = integration.get('type') === IntegrationType.Gmail
        const isOutlook = integration.get('type') === IntegrationType.Outlook
        const enableGmailSending = integration.getIn(
            ['meta', 'enable_gmail_sending'],
            true
        )

        const isVerified = integration.getIn(['meta', 'verified'], true)
        const isDomainVerified = verifiedDomains.includes(domain)

        // Whether to show the "pending domain verification" warning for this integration

        const shouldDisplayDomainVerificationWarning =
            !isDomainVerified &&
            !isBaseIntegration && // The base email integration cannot have a domain associated
            !isOutlook && // Outlook does not need domain verification
            !(isGmail && enableGmailSending) && // GMail only needs domain verification if email sending is disabled
            (isGmail || isVerified) // Email integrations must be verified before adding a domain configuration

        const editLink = `/app/settings/channels/email/${integrationId}${
            isVerified || isGmail ? '' : '/verification'
        }`

        let imgComponent = (
            <i
                className={classnames(
                    css.icon,
                    'material-icons',
                    'align-bottom'
                )}
            >
                email
            </i>
        )

        if (isGmail) {
            imgComponent = <img alt="gmail logo" src={gmailImg} width="22" />
        } else if (isOutlook) {
            imgComponent = (
                <img alt="outlook logo" src={outlookImg} width="22" />
            )
        }

        return (
            <tr key={integrationId}>
                <td className="smallest align-middle">{imgComponent}</td>
                <td className="link-full-td">
                    <Link to={editLink}>
                        <div>
                            <b className="mr-2">{integration.get('name')}</b>
                            <span className="text-faded">{address}</span>
                        </div>
                    </Link>
                </td>
                <td className="smallest align-middle text-right p-0">
                    <div>
                        {!active && isGmail && (
                            <Button
                                type="submit"
                                color="success"
                                className={classnames({
                                    'btn-loading': isRowSubmitting,
                                })}
                                onClick={(e) => {
                                    const uri = `${gmailRedirectUri}?integration_id=${integrationId}`
                                    e.preventDefault()
                                    window.open(uri)
                                }}
                            >
                                Reactivate
                            </Button>
                        )}
                        {!active && isOutlook && (
                            <Button
                                type="submit"
                                color="primary"
                                onClick={(e) => {
                                    const uri = `${outlookRedirectUri}?integration_id=${integrationId}`
                                    e.preventDefault()
                                    window.open(uri)
                                }}
                                className={classnames({
                                    'btn-loading': isRowSubmitting,
                                })}
                            >
                                Reactivate
                            </Button>
                        )}
                        {!isGmail && !isOutlook && !isVerified && (
                            <div>
                                <i
                                    className={classnames(
                                        'material-icons mr-2 red'
                                    )}
                                >
                                    close
                                </i>
                                Not verified
                            </div>
                        )}
                        {shouldDisplayDomainVerificationWarning && (
                            <WarningWithTooltip id={toolTipId}>
                                Pending domain verification
                            </WarningWithTooltip>
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
