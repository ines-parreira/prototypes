import React, {Component} from 'react'
import {List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import ForwardIcon from '../ForwardIcon'
import IntegrationList from '../IntegrationList'
import {getIntegrationsByTypes} from '../../../../../state/integrations/helpers'
import gmailImg from '../../../../../../img/integrations/gmail.png'
import outlookImg from '../../../../../../img/integrations/outlook.png'
import history from '../../../../history'
import {IntegrationType} from '../../../../../models/integration/types'
import {EMAIL_INTEGRATION_TYPES} from '../../../../../constants/integration'

import css from './EmailIntegrationList.less'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
    gmailRedirectUri: string
    outlookRedirectUri: string
}

export default class EmailIntegrationList extends Component<Props> {
    render() {
        const {
            integrations,
            loading,
            gmailRedirectUri,
            outlookRedirectUri,
        } = this.props

        const longTypeDescription = (
            <span>
                Connect your support email addresses and respond to your
                customers from Gorgias.
            </span>
        )

        const isSubmitting = loading.get('updateIntegration')

        const integrationToItemDisplay = (integration: Map<any, any>) => {
            const active = !integration.get('deactivated_datetime')
            const isRowSubmitting = isSubmitting === integration.get('id')
            const isGmail = integration.get('type') === IntegrationType.Gmail
            const isOutlook =
                integration.get('type') === IntegrationType.Outlook

            const isVerified = integration.getIn(['meta', 'verified'], true)

            const editLink = `/app/settings/integrations/email/${
                integration.get('id') as number
            }${isVerified || isGmail ? '' : '/verification'}`

            let imgComponent = (
                <i className={classnames(css.icon, 'material-icons')}>email</i>
            )

            if (isGmail) {
                imgComponent = (
                    <img alt="gmail logo" src={gmailImg} width="22" />
                )
            } else if (isOutlook) {
                imgComponent = (
                    <img alt="outlook logo" src={outlookImg} width="22" />
                )
            }

            return (
                <tr key={integration.get('id')}>
                    <td className="smallest">{imgComponent}</td>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b className="mr-2">
                                    {integration.get('name')}
                                </b>
                                <span className="text-faded">
                                    {integration.getIn(['meta', 'address'])}
                                </span>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle p-0">
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
}
