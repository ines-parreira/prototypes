import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import {Button} from 'reactstrap'

import IntegrationList from '../IntegrationList'
import {getIntegrationsByTypes} from '../../../../../state/integrations/helpers'
import {logEvent} from '../../../../../store/middlewares/amplitudeTracker'
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

        const integrationToItemDisplay = (int) => {
            const active = !int.get('deactivated_datetime')
            const isRowSubmitting = isSubmitting === int.get('id')
            const isGmail = int.get('type') === 'gmail'

            const isForwardingOn = int.getIn(['meta', 'is_forwarding_on'])

            const editLink = `/app/integrations/email/${int.get('id')}`

            return (
                <tr key={int.get('id')}>
                    <td className="smallest">
                        {
                            isGmail ? (
                                    <img
                                        src={gmailImg}
                                        height="23"
                                        alt="email-icon"
                                    />
                                ) : (
                                    <i
                                        className="fa fa-fw fa-envelope text-muted"
                                        style={{
                                            fontSize: '25px',
                                            marginTop: '-2px',
                                            marginLeft: '-3px',
                                        }}
                                    />
                                )
                        }
                    </td>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b className="mr-2">{int.get('name')}</b>
                                <span className="text-faded">
                                    {int.getIn(['meta', 'address'])}
                                </span>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest">
                        <div>
                            {
                                !active && isGmail && (
                                    <Button
                                        tag="a"
                                        color="success"
                                        href={`/integrations/gmail/auth?integration_id=${int.get('id')}`}
                                        className={classNames({
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
                            !isGmail && !isForwardingOn && (
                                <div>
                                    <i className={classNames('fa fa-circle', css.forwardingIcon)}/>
                                    <a
                                        target="_blank"
                                        href="https://gorgias.helpdocs.io/general/how-to-set-up-email-forwarding"
                                    >
                                        No recent email. Is forwarding on?
                                    </a>
                                </div>
                            )
                        }
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType="email"
                integrations={getIntegrationsByTypes(integrations, ['email', 'gmail'])}
                longTypeDescription={longTypeDescription}
                createIntegration={() => browserHistory.push('/app/integrations/email/new')}
                createIntegrationButtonText="Add email address"
                createIntegrationButtonOnClick={() => {
                    logEvent('add_email_address_click')
                }}
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}
