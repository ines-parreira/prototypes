import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classnames from 'classnames'
import {Button} from 'reactstrap'

import ForwardIcon from '../ForwardIcon'
import IntegrationList from '../IntegrationList'
import {getIntegrationsByTypes} from '../../../../../state/integrations/helpers'
import gmailImg from '../../../../../../img/integrations/gmail.png'

import css from './EmailIntegrationList.less'

export default class EmailIntegrationList extends React.Component {
    static propTypes = {
        integrations: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        actions: PropTypes.object.isRequired,
    }

    render() {
        const {integrations, loading} = this.props

        const longTypeDescription = (
            <span>
                Connect your support email addresses and respond to your customers from Gorgias.
            </span>
        )

        const isSubmitting = loading.get('updateIntegration')

        const integrationToItemDisplay = (integration) => {
            const active = !integration.get('deactivated_datetime')
            const isRowSubmitting = isSubmitting === integration.get('id')
            const isGmail = integration.get('type') === 'gmail'

            const isVerified = integration.getIn(['meta', 'verified'], true)

            let editLink = `/app/settings/integrations/email/${integration.get('id')}${isVerified || isGmail ? '' : '/verification'}`

            return (
                <tr key={integration.get('id')}>
                    <td className="smallest">
                        {
                            isGmail ? (
                                    <img
                                        src={gmailImg}
                                        width="22"
                                    />
                                ) : (
                                    <i className={classnames(css.icon, 'material-icons')}>
                                        email
                                    </i>
                                )
                        }
                    </td>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b className="mr-2">{integration.get('name')}</b>
                                <span className="text-faded">
                                    {integration.getIn(['meta', 'address'])}
                                </span>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle p-0">
                        <div>
                            {
                                !active && isGmail && (
                                    <Button
                                        tag="a"
                                        color="success"
                                        href={`/integrations/gmail/auth?integration_id=${integration.get('id')}`}
                                        className={classnames({
                                            'btn-loading': isRowSubmitting,
                                        })}
                                    >
                                        Re-activate
                                    </Button>
                                )
                            }
                        </div>
                    </td>

                    <td className="smallest align-middle">
                        {
                            !isGmail && !isVerified && (
                                <div>
                                    <i className={classnames('material-icons mr-2 red')}>close</i>
                                    Not verified
                                </div>
                            )
                        }
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
                integrations={getIntegrationsByTypes(integrations, ['email', 'gmail'])}
                longTypeDescription={longTypeDescription}
                createIntegration={() => browserHistory.push('/app/settings/integrations/email/new')}
                createIntegrationButtonText="Add email address"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
