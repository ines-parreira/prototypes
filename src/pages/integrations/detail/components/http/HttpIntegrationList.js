import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import IntegrationList from '../IntegrationList'

export default class HttpIntegrationList extends React.Component {
    render() {
        const {integrations, actions, loading} = this.props
        const longTypeDescription = `HTTP integrations allow you to connect Gorgias to about anything with 
HTTP bindings.`

        const integrationToItemDisplay = (int) => {
            const active = !int.get('deactivated_datetime')
            const rowClasses = classNames({
                deactivated: !active
            })
            const editLink = `/app/integrations/http/${int.get('id')}`
            let primaryBtn = (
                <button
                    className="ui basic light blue floated right button"
                    onClick={() => browserHistory.push(editLink)}
                >
                    Edit
                </button>

            )
            let rmBtn = (
                <button
                    className="ui basic light red floated right button"
                    onClick={() => actions.deactivateIntegration(int)}
                >
                    Deactivate
                </button>
            )

            if (!active) {
                primaryBtn = (
                    <button
                        className="ui basic light blue floated right button"
                        onClick={() => actions.activateIntegration(int)}
                    >
                        Re-Activate
                    </button>
                )

                rmBtn = (
                    <button
                        className="ui basic light red floated right button"
                        onClick={() => actions.deleteIntegration(int)}
                    >
                        Delete
                    </button>
                )
            }


            return (
                <tr key={int.get('id')} className={rowClasses}>
                    <td>
                        <div className="ui header">
                            <Link className="subject" to={editLink}>
                                {int.get('name')}
                            </Link>
                            <div className="body sub header">
                                {int.get('description')}
                            </div>
                        </div>
                    </td>
                    <td className="eight wide column">
                        {rmBtn}
                        {primaryBtn}
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType="http"
                integrations={integrations.filter((v) => v.get('type') === 'http')}
                longTypeDescription={longTypeDescription}
                createIntegration={() => browserHistory.push('/app/integrations/http/new')}
                createIntegrationButtonText="Add HTTP integration"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

HttpIntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
