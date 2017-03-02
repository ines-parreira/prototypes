import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import IntegrationList from '../IntegrationList'
import gmailImg from '../../../../../../img/integrations/gmail.png'
import {getIntegrationsByTypes} from '../../../../../state/integrations/helpers'
import {logEvent} from '../../../../../store/middlewares/amplitudeTracker'

export default class EmailIntegrationList extends React.Component {
    render() {
        const {integrations, actions, loading} = this.props
        const longTypeDescription = (
            <span>
                Connect your support email addresses and respond to your customers from Gorgias.
            </span>
        )

        const isSubmitting = loading.get('updateIntegration')

        const integrationToItemDisplay = (int) => {
            const active = !int.get('deactivated_datetime')
            const isRowSubmitting = isSubmitting === int.get('id')

            const rowClasses = classNames({
                deactivated: !active
            })

            const editLink = `/app/integrations/email/${int.get('id')}`
            let primaryBtn = (
                <button
                    className="ui basic light blue button"
                    onClick={() => browserHistory.push(editLink)}
                >
                    Edit
                </button>

            )

            if (!active) {
                primaryBtn = (
                    <button
                        className={classNames('ui basic light blue button', {
                            'loading disabled': isRowSubmitting
                        })}
                        onClick={() => !isRowSubmitting && actions.activateIntegration(int)}
                    >
                        Re-Activate
                    </button>
                )
            }

            return (
                <tr key={int.get('id')} className={rowClasses}>
                    <td>
                        {
                            int.get('type') === 'email'
                                ? <i className="icon mail big outline"/>
                                : <img src={gmailImg} width="28" alt="email-icon" style={{marginLeft: '2px'}}/>
                        }
                    </td>
                    <td>
                        <Link to={editLink}>
                            <div className="ui header">
                                {int.get('name')}
                                <div className="body sub header">
                                    {int.getIn(['meta', 'address'], '')}
                                </div>
                            </div>
                        </Link>
                    </td>
                    <td className="pr15i">
                        <div className="floated right">
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
                createIntegrationButtonOnClick={() => { logEvent('add_email_address_click') }}
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
