// @flow
import React from 'react'
import type {List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import {
    EMAIL_INTEGRATION_TYPES,
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
} from '../../../../../constants/integration.ts'

import ForwardIcon from '../ForwardIcon.tsx'
import IntegrationList from '../IntegrationList'
import {getIntegrationsByTypes} from '../../../../../state/integrations/helpers.ts'
import gmailImg from '../../../../../../img/integrations/gmail.png'
import outlookImg from '../../../../../../img/integrations/outlook.png'
import history from '../../../../history.ts'

import css from './EmailIntegrationList.less'

type Props = {
    integrations: List<Map<*, *>>,
    loading: Object,
    actions: Object,
    gmailRedirectUri: string,
    outlookRedirectUri: string,
}

export default class EmailIntegrationList extends React.Component<Props> {
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

        const integrationToItemDisplay = (integration) => {
            const active = !integration.get('deactivated_datetime')
            const isRowSubmitting = isSubmitting === integration.get('id')
            const isGmail = integration.get('type') === GMAIL_INTEGRATION_TYPE
            const isOutlook =
                integration.get('type') === OUTLOOK_INTEGRATION_TYPE

            const isVerified = integration.getIn(['meta', 'verified'], true)

            let editLink = `/app/settings/integrations/email/${integration.get(
                'id'
            )}${isVerified || isGmail ? '' : '/verification'}`

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
                                    href={`${gmailRedirectUri}?integration_id=${integration.get(
                                        'id'
                                    )}`}
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
                                    href={`${outlookRedirectUri}?integration_id=${integration.get(
                                        'id'
                                    )}`}
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
                integrationType="email"
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
