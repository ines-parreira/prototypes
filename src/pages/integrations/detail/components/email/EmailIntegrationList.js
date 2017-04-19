import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import {Badge, Button} from 'reactstrap'

import IntegrationList from '../IntegrationList'
import {getIntegrationsByTypes} from '../../../../../state/integrations/helpers'
import {logEvent} from '../../../../../store/middlewares/amplitudeTracker'
import gmailImg from '../../../../../../img/integrations/gmail.png'

export default class EmailIntegrationList extends React.Component {
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
            const isDisabled = int.get('deactivated_datetime')

            const editLink = `/app/integrations/email/${int.get('id')}`

            let primaryBtn = (
                <Button
                    tag={Link}
                    color="info"
                    to={editLink}
                >
                    Edit
                </Button>
            )

            if (!active) {
                primaryBtn = (
                    <Button
                        tag={Link}
                        color="success"
                        to={`/integrations/gmail/auth?integration_id=${int.get('id')}`}
                        className={classNames({
                            'btn-loading': isRowSubmitting,
                        })}
                    >
                        Re-activate
                    </Button>
                )
            }

            return (
                <tr key={int.get('id')}>
                    <td className="smallest">
                        {
                            int.get('type') === 'email' ? (
                                    <i
                                        className="fa fa-fw fa-envelope text-muted"
                                        style={{
                                            fontSize: '41px',
                                            marginTop: '-8px',
                                            marginLeft: '-3px',
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={gmailImg}
                                        height="33"
                                        alt="email-icon"
                                    />
                                )
                        }
                    </td>
                    <td style={{verticalAlign: 'middle'}}>
                        <b>{int.get('name')}</b>
                        {' '}
                        <span className="text-faded ml-3">
                            {int.getIn(['meta', 'address'])}
                        </span>

                    </td>
                    <td
                        className="smallest"
                        style={{verticalAlign: 'middle'}}
                    >
                        {
                            isDisabled ? (
                                    <Badge color="warning">
                                        Disabled
                                    </Badge>
                                ) : (
                                    <Badge color="success">
                                        Enabled
                                    </Badge>
                                )
                        }
                    </td>
                    <td className="smallest">
                        <div className="pull-right">
                            {primaryBtn}
                        </div>
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

EmailIntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
