import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import IntegrationList from '../IntegrationList'

export default class SmoochIntegrationList extends React.Component {
    render() {
        const {integrations, actions, loading} = this.props

        const integrationToItemDisplay = (int) => {
            const editLink = `/app/integrations/smooch/${int.get('id')}`
            return (
                <tr key={int.get('id')}>
                    <td>
                        <div className="ui header">
                            <Link className="subject" to={editLink}>{int.get('name')}</Link>
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
                                onClick={() => browserHistory.push(editLink)}
                        >
                            Edit
                        </button>
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType="smooch"
                integrations={integrations.filter((v) => v.get('type') === 'smooch')}
                createIntegration={() => browserHistory.push('/app/integrations/smooch/new')}
                createIntegrationButtonText="Add Smooch"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

SmoochIntegrationList.propTypes = {
    integrations: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
