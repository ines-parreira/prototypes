import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import IntegrationList from '../../components/IntegrationList'

export default class HttpIntegrationList extends React.Component {
    render() {
        const {integrations, actions, loading} = this.props
        const longTypeDescription = 'HTTP integrations allow you to connect Gorgias to about anything with HTTP bindings.'

        const integrationToItemDisplay = (int) => {
            return (
                <tr key={int.get('id')}>
                    <td>
                        <div className="ui header">
                            <span className="subject">{int.get('name')}</span>

                            <div className="body sub header">
                                {int.get('description')}
                            </div>
                        </div>
                    </td>
                    <td className="eight wide column">
                        <button className="ui basic light red floated right button"
                                onClick={() => actions.deleteIntegration(int)}
                        >
                            Delete
                        </button>
                        <button className="ui basic light blue floated right button"
                                onClick={() => browserHistory.push(`/app/integrations/http/${int.get('id')}`)}
                        >
                            Edit
                        </button>
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
