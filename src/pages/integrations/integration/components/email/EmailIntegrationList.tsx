import React, {useEffect, useState} from 'react'
import {List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import gmailImg from 'assets/img/integrations/gmail.png'
import outlookImg from 'assets/img/integrations/outlook.png'

import ForwardIcon from '../../../common/components/ForwardIcon'
import IntegrationList from '../IntegrationList'
import Loader from '../../../../common/components/Loader/Loader'
import Tooltip from '../../../../common/components/Tooltip'
import {getIntegrationsByTypes} from '../../../../../state/integrations/helpers'
import history from '../../../../history'
import {
    EmailDomain,
    IntegrationType,
} from '../../../../../models/integration/types'
import {EMAIL_INTEGRATION_TYPES} from '../../../../../constants/integration'

import css from './EmailIntegrationList.less'
import {fetchEmailDomains} from './resources'

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
        const isRowSubmitting = isSubmitting === integration.get('id')
        const toolTipId = `integration-tooltip-${String(integration.get('id'))}`

        const address = integration.getIn(['meta', 'address'], '') as string
        const domain = address.substr(address.lastIndexOf('@') + 1)
        const isBaseEmailIntegration = address.endsWith(
            window.EMAIL_FORWARDING_DOMAIN
        )
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
            !isBaseEmailIntegration && // The base email integration cannot have a domain associated
            !isOutlook && // Outlook does not need domain verification
            !(isGmail && enableGmailSending) && // GMail only needs domain verification if email sending is disabled
            (isGmail || isVerified) // Email integrations must be verified before adding a domain configuration

        const editLink = `/app/settings/integrations/email/${
            integration.get('id') as number
        }${isVerified || isGmail ? '' : '/verification'}`

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
            <tr key={integration.get('id')}>
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
                                tag="a"
                                color="success"
                                href={`${gmailRedirectUri}?integration_id=${
                                    integration.get('id') as number
                                }`}
                                className={classnames({
                                    'btn-loading': isRowSubmitting,
                                })}
                            >
                                Reactivate
                            </Button>
                        )}
                        {!active && isOutlook && (
                            <Button
                                tag="a"
                                color="success"
                                href={`${outlookRedirectUri}?integration_id=${
                                    integration.get('id') as number
                                }`}
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
                            <>
                                <span id={toolTipId}>
                                    <i className="material-icons align-middle orange md-2">
                                        warning
                                    </i>
                                </span>
                                <Tooltip placement="top-end" target={toolTipId}>
                                    Pending domain verification
                                </Tooltip>
                            </>
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
                history.push('/app/settings/integrations/email/new')
            }
            createIntegrationButtonContent="Add email address"
            integrationToItemDisplay={integrationToItemDisplay}
            loading={loading}
        />
    )
}
